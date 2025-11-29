import { createChatHandler } from "@/lib/assistant-runtime/runtime";
import type { ModelProvider } from "@/lib/assistant-runtime/llm";
import type { ChatHandlerOptions } from "@/lib/assistant-runtime/runtime";
import type { UIMessage } from "ai";
import { createLogger } from "@/lib/loggers";
import { toErrorResponse } from "@/lib/api-errors";
import { HTTP_STATUS } from "@/constants";

const logger = createLogger({ service: "api", endpoint: "/api/chat" });

/**
 * Chat API Route
 *
 * Purpose: Handles POST requests from assistant-ui AssistantChatTransport
 * - Parses request body and extracts configuration
 * - Processes messages and selects LLM provider
 * - Returns streaming response compatible with assistant-ui
 */

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max duration

/**
 * Request body structure from AssistantChatTransport
 */
interface ChatRequestBody {
  messages?: unknown;
  system?: string;
  modelProvider?: string;
  modelName?: string;
  forceToolUse?: boolean;
  tools?: Record<string, unknown>;
  metadata?: {
    system?: string;
    modelProvider?: string;
    modelName?: string;
    forceToolUse?: boolean;
    tools?: Record<string, unknown>;
  };
}

/**
 * Options for parsing request body
 */
interface ParseRequestBodyOptions {
  /**
   * Raw request body object
   */
  body: unknown;
}

/**
 * Parse and extract messages from request body
 *
 * Purpose: Extracts and validates messages array from request
 * - Handles AssistantChatTransport message format
 * - Provides fallback to empty array
 *
 * @param options - Parse request body options
 * @returns Array of UI messages
 */
function parseMessages(options: ParseRequestBodyOptions): UIMessage[] {
  const { body } = options;

  if (
    !body ||
    typeof body !== "object" ||
    !("messages" in body) ||
    !Array.isArray(body.messages)
  ) {
    return [];
  }

  return body.messages as UIMessage[];
}

/**
 * Options for extracting system message
 */
interface ExtractSystemMessageOptions {
  /**
   * Request body object
   */
  body: ChatRequestBody;
}

/**
 * Extract system message from request body
 *
 * Purpose: Gets system message from body or metadata
 * - Checks body.system first
 * - Falls back to body.metadata.system
 *
 * @param options - Extract system message options
 * @returns System message or undefined
 */
function extractSystemMessage(
  options: ExtractSystemMessageOptions
): string | undefined {
  const { body } = options;
  return body.system || body.metadata?.system;
}

/**
 * Options for extracting model provider
 */
interface ExtractModelProviderOptions {
  /**
   * Request body object
   */
  body: ChatRequestBody;
  /**
   * Default provider to use if not specified
   * @default "gemini"
   */
  defaultProvider?: ModelProvider;
}

/**
 * Extract model provider from request body
 *
 * Purpose: Gets model provider from body or metadata
 * - Checks body.modelProvider first
 * - Falls back to body.metadata.modelProvider
 * - Uses default provider if neither is specified
 *
 * @param options - Extract model provider options
 * @returns Model provider
 */
function extractModelProvider(
  options: ExtractModelProviderOptions
): ModelProvider {
  const { body, defaultProvider = "gemini" } = options;

  const provider =
    body.modelProvider || body.metadata?.modelProvider || defaultProvider;

  return provider as ModelProvider;
}

/**
 * Options for extracting model name
 */
interface ExtractModelNameOptions {
  /**
   * Request body object
   */
  body: ChatRequestBody;
}

/**
 * Extract model name from request body
 *
 * Purpose: Gets model name from body or metadata
 * - Checks body.modelName first
 * - Falls back to body.metadata.modelName
 *
 * @param options - Extract model name options
 * @returns Model name or undefined
 */
function extractModelName(
  options: ExtractModelNameOptions
): string | undefined {
  const { body } = options;
  return body.modelName || body.metadata?.modelName;
}

/**
 * Options for extracting forceToolUse setting
 */
interface ExtractForceToolUseOptions {
  /**
   * Request body object
   */
  body: ChatRequestBody;
  /**
   * Default value if not specified
   * @default true
   */
  defaultValue?: boolean;
}

/**
 * Extract forceToolUse setting from request body
 *
 * Purpose: Gets forceToolUse from body or metadata
 * - Checks body.forceToolUse first
 * - Falls back to body.metadata.forceToolUse
 * - Uses default value if neither is specified
 *
 * @param options - Extract forceToolUse options
 * @returns Force tool use setting
 */
function extractForceToolUse(options: ExtractForceToolUseOptions): boolean {
  const { body, defaultValue = true } = options;

  if (body.forceToolUse !== undefined) {
    return body.forceToolUse;
  }

  if (body.metadata?.forceToolUse !== undefined) {
    return body.metadata.forceToolUse;
  }

  return defaultValue;
}

/**
 * Options for extracting frontend tools
 */
interface ExtractFrontendToolsOptions {
  /**
   * Request body object
   */
  body: ChatRequestBody;
}

/**
 * Extract frontend tools from request body
 *
 * Purpose: Gets frontend tools from body or metadata
 * - Checks body.tools first
 * - Falls back to body.metadata.tools
 * - AssistantChatTransport automatically forwards frontend tools
 *
 * @param options - Extract frontend tools options
 * @returns Frontend tools object or undefined
 */
function extractFrontendTools(
  options: ExtractFrontendToolsOptions
): Record<string, unknown> | undefined {
  const { body } = options;
  return body.tools || body.metadata?.tools;
}

/**
 * Options for parsing chat request
 */
interface ParseChatRequestOptions {
  /**
   * Raw request object
   */
  request: Request;
}

/**
 * Parse chat request and extract all configuration
 *
 * Purpose: Extracts all necessary configuration from request
 * - Parses JSON body
 * - Extracts messages, system, model config, tools, and forceToolUse
 * - Validates request structure
 *
 * @param options - Parse chat request options
 * @returns Parsed chat handler options
 * @throws Error if request body is invalid JSON
 */
async function parseChatRequest(
  options: ParseChatRequestOptions
): Promise<ChatHandlerOptions> {
  const { request } = options;

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch (error) {
    logger.error("Failed to parse request body", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Invalid request body: JSON parsing failed");
  }

  const messages = parseMessages({ body });
  const system = extractSystemMessage({ body });
  const modelProvider = extractModelProvider({ body });
  const modelName = extractModelName({ body });
  const forceToolUse = extractForceToolUse({ body });
  const tools = extractFrontendTools({ body });

  return {
    messages,
    system,
    modelProvider,
    modelName,
    tools,
    forceToolUse,
  };
}

/**
 * Handle POST request to chat API
 *
 * Purpose: Main entry point for chat API requests
 * - Parses request body
 * - Creates chat handler with configuration
 * - Returns streaming response
 *
 * Steps:
 * 1. Parse and validate request body
 * 2. Extract all configuration (messages, model, tools, etc.)
 * 3. Create chat handler with parsed options
 * 4. Return streaming response
 *
 * @param req - HTTP request object
 * @returns Streaming response or error response
 *
 * @example
 * ```ts
 * // Request body structure:
 * {
 *   messages: UIMessage[],
 *   system?: string,
 *   modelProvider?: "gemini" | "openai",
 *   modelName?: string,
 *   forceToolUse?: boolean,
 *   tools?: Record<string, unknown>,
 *   metadata?: { ... }
 * }
 * ```
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const chatOptions = await parseChatRequest({ request: req });

    const result = await createChatHandler(chatOptions);

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return toErrorResponse({
      error,
      status: HTTP_STATUS.BAD_REQUEST,
      loggerContext: {
        service: "api",
        endpoint: "/api/chat",
      },
    });
  }
}
