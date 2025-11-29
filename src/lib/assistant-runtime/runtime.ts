import { stepCountIs, streamText } from "ai";
import { getModelConfig, type ModelProvider } from "./llm";
import { getAllMcpTools } from "@/lib/mcp-intergrations";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages } from "ai";
import { createLogger } from "@/lib/loggers";

const logger = createLogger({ service: "assistant-runtime" });

/**
 * Chat Runtime
 *
 * Purpose: Creates chat handler that integrates LLM provider with MCP tools
 * - Handles message processing and validation
 * - Merges frontend and MCP tools
 * - Configures streaming responses for assistant-ui
 */

/**
 * Options for chat handler configuration
 */
export interface ChatHandlerOptions {
  /**
   * Array of UI messages to process
   */
  messages: UIMessage[];
  /**
   * LLM provider to use (default: "gemini")
   */
  modelProvider?: ModelProvider;
  /**
   * Optional model name override
   */
  modelName?: string;
  /**
   * System message forwarded from AssistantChatTransport
   */
  system?: string;
  /**
   * Frontend tools forwarded from AssistantChatTransport
   */
  tools?: Record<string, unknown>;
  /**
   * Force LLM to use at least one tool before responding
   * @default false
   */
  forceToolUse?: boolean;
}

/**
 * Options for creating streamText with model
 */
interface CreateStreamTextOptions {
  /**
   * Model configuration from getModelConfig
   */
  modelConfig: ReturnType<typeof getModelConfig>;
  /**
   * Array of UI messages
   */
  messages: UIMessage[];
  /**
   * Optional system message
   */
  system?: string;
  /**
   * Merged tools object (frontend + MCP tools)
   */
  allTools: Record<string, unknown>;
  /**
   * Whether to force tool use
   */
  forceToolUse: boolean;
}

/**
 * Options for building system message with tool instruction
 */
interface BuildSystemMessageOptions {
  /**
   * Original system message
   */
  system?: string;
  /**
   * Available tools object
   */
  allTools: Record<string, unknown>;
  /**
   * Whether to force tool use
   */
  forceToolUse: boolean;
}

/**
 * Build system message with tool use instruction if needed
 *
 * Purpose: Enhances system message when forceToolUse is enabled
 * - Appends tool use instruction to existing system message
 * - Lists available tools for the LLM
 *
 * @param options - System message building options
 * @returns Enhanced system message or undefined
 */
function buildSystemMessageWithToolInstruction(
  options: BuildSystemMessageOptions
): string | undefined {
  const { system, allTools, forceToolUse } = options;

  if (!forceToolUse || Object.keys(allTools).length === 0) {
    return system;
  }

  const toolNames = Object.keys(allTools).join(", ");
  const toolUseInstruction = `IMPORTANT: You MUST use at least one of the available tools to answer the user's question. Do not provide a direct answer without using a tool. Available tools: ${toolNames}.`;

  return system ? `${system}\n\n${toolUseInstruction}` : toolUseInstruction;
}

/**
 * Create streamText with a specific model configuration
 *
 * Purpose: Configures and creates streaming text response
 * - Converts UI messages to model messages
 * - Applies system message with tool instructions if needed
 * - Configures tool usage and step limits
 *
 * @param options - Stream text configuration options
 * @returns Streaming text response from AI SDK
 * @throws Error if streamText creation fails
 */
function createStreamTextWithModel(
  options: CreateStreamTextOptions
): ReturnType<typeof streamText> {
  const { modelConfig, messages, system, allTools, forceToolUse } = options;

  try {
    const finalSystem = buildSystemMessageWithToolInstruction({
      system,
      allTools,
      forceToolUse,
    });

    const hasTools = Object.keys(allTools).length > 0;

    return streamText({
      model: modelConfig.model,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(10),
      ...(finalSystem ? { system: finalSystem } : {}),
      // @ts-expect-error - tools type mismatch between AI SDK and assistant-ui
      tools: allTools,
      // Force tool use by setting minimum maxSteps when enabled
      maxSteps: forceToolUse && hasTools ? 5 : undefined,
    });
  } catch (error) {
    logger.error("createStreamTextWithModel failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Validate messages array
 *
 * Purpose: Ensures messages are valid before processing
 * - Checks if messages is an array
 * - Ensures array is not empty
 *
 * @param messages - Messages to validate
 * @throws Error if messages are invalid
 */
function validateMessages(messages: unknown): asserts messages is UIMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array of UIMessage");
  }
}

/**
 * Options for merging frontend tools
 */
interface MergeFrontendToolsOptions {
  /**
   * Frontend tools object
   */
  tools: Record<string, unknown> | undefined;
  /**
   * Target object to merge into
   */
  allTools: Record<string, unknown>;
}

/**
 * Merge frontend tools into tools object
 *
 * Purpose: Processes and adds frontend tools from assistant-ui
 * - Validates tools object structure
 * - Converts using frontendTools helper
 *
 * @param options - Merge frontend tools options
 */
function mergeFrontendTools(options: MergeFrontendToolsOptions): void {
  const { tools, allTools } = options;

  if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
    return;
  }

  try {
    // @ts-expect-error - frontendTools expects specific type but we have Record<string, unknown>
    const frontendToolsResult = frontendTools(tools);
    Object.assign(allTools, frontendToolsResult);
  } catch (error) {
    logger.warn("Failed to process frontend tools", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Options for merging MCP tools
 */
interface MergeMcpToolsOptions {
  /**
   * MCP tools object
   */
  mcpTools: Record<string, unknown>;
  /**
   * Target object to merge into
   */
  allTools: Record<string, unknown>;
}

/**
 * Merge MCP tools into tools object
 *
 * Purpose: Adds MCP tools from all configured integrations
 * - Validates tools object structure
 * - Merges tools (later tools override earlier ones with same name)
 *
 * @param options - Merge MCP tools options
 */
function mergeMcpTools(options: MergeMcpToolsOptions): void {
  const { mcpTools, allTools } = options;

  if (!mcpTools || typeof mcpTools !== "object" || Array.isArray(mcpTools)) {
    return;
  }

  Object.assign(allTools, mcpTools);
}

/**
 * Options for merging all tools
 */
interface MergeAllToolsOptions {
  /**
   * Frontend tools from assistant-ui
   */
  frontendTools: Record<string, unknown> | undefined;
  /**
   * MCP tools from integrations
   */
  mcpTools: Record<string, unknown>;
}

/**
 * Merge all available tools (frontend + MCP)
 *
 * Purpose: Combines frontend and MCP tools into single object
 * - Processes frontend tools first
 * - Adds MCP tools (overrides frontend tools with same name)
 *
 * @param options - Merge all tools options
 * @returns Merged tools object
 */
function mergeAllTools(options: MergeAllToolsOptions): Record<string, unknown> {
  const { frontendTools, mcpTools } = options;
  const allTools: Record<string, unknown> = {};

  mergeFrontendTools({ tools: frontendTools, allTools });
  mergeMcpTools({ mcpTools, allTools });

  return allTools;
}

/**
 * Options for validating forceToolUse
 */
interface ValidateForceToolUseOptions {
  /**
   * Original forceToolUse value
   */
  forceToolUse: boolean | undefined;
  /**
   * Available tools object
   */
  allTools: Record<string, unknown>;
}

/**
 * Validate and adjust forceToolUse setting
 *
 * Purpose: Ensures forceToolUse is only enabled when tools are available
 * - Disables forceToolUse if no tools are available
 * - Logs warning when adjustment is made
 *
 * @param options - Validate forceToolUse options
 * @returns Adjusted forceToolUse value
 */
function validateForceToolUse(options: ValidateForceToolUseOptions): boolean {
  const { forceToolUse, allTools } = options;
  const hasTools = Object.keys(allTools).length > 0;
  const shouldForceToolUse = forceToolUse ?? false;

  if (shouldForceToolUse && !hasTools) {
    logger.warn(
      "forceToolUse is enabled but no tools are available. Disabling tool enforcement."
    );
    return false;
  }

  return shouldForceToolUse;
}

/**
 * Create chat handler for assistant-ui
 *
 * Purpose: Main entry point for chat processing
 * - Validates input messages
 * - Loads and merges tools from all sources
 * - Configures LLM model
 * - Returns streaming response compatible with assistant-ui
 *
 * Steps:
 * 1. Validates messages array
 * 2. Loads MCP tools from all configured integrations
 * 3. Merges frontend and MCP tools
 * 4. Validates and adjusts forceToolUse setting
 * 5. Configures model and creates streaming response
 *
 * Note: MCP tools are fetched on every request. Consider implementing
 * caching if tool definitions change infrequently to improve performance.
 *
 * @param options - Chat handler configuration options
 * @returns Streaming text response from AI SDK
 * @throws Error if messages are invalid or model configuration fails
 *
 * @example
 * ```ts
 * const result = await createChatHandler({
 *   messages: uiMessages,
 *   modelProvider: "gemini",
 *   system: "You are a helpful assistant",
 *   forceToolUse: true
 * });
 * ```
 */
export async function createChatHandler(
  options: ChatHandlerOptions
): Promise<ReturnType<typeof streamText>> {
  const {
    messages,
    system,
    modelProvider = "gemini",
    modelName,
    tools,
    forceToolUse,
  } = options;

  validateMessages(messages);

  // Load MCP tools from all configured integrations
  // Note: Tools are fetched on every request. Consider implementing
  // caching (e.g., in-memory cache with TTL) if tool definitions
  // change infrequently to reduce latency and API calls.
  const mcpTools = await getAllMcpTools();

  // Merge frontend tools and MCP tools
  const allTools = mergeAllTools({
    frontendTools: tools,
    mcpTools,
  });

  // Validate and adjust forceToolUse setting
  const finalForceToolUse = validateForceToolUse({
    forceToolUse,
    allTools,
  });

  // Get model config and create streamText
  const modelConfig = getModelConfig({
    provider: modelProvider,
    modelName,
  });

  return createStreamTextWithModel({
    modelConfig,
    messages,
    system,
    allTools,
    forceToolUse: finalForceToolUse,
  });
}
