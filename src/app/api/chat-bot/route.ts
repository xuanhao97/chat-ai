/**
 * Chat Bot API Route
 *
 * Purpose: Handles POST requests for chatbot mode (non-LLM)
 * - Parses request body and extracts question
 * - Calls chatbot API service
 * - Returns response compatible with assistant-ui format
 */

import { askChatbot } from "@/services/chatbot";
import { createLogger } from "@/lib/loggers";
import { HTTP_STATUS } from "@/constants";
import { toErrorResponse } from "@/lib/api-errors";
import { createStreamingResponse } from "@/lib/streaming-response";

const logger = createLogger({ service: "api", endpoint: "/api/chat-bot" });

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max duration

/**
 * Request body structure for chatbot API
 */
interface ChatBotRequestBody {
  messages?: unknown;
  question?: string;
  metadata?: {
    question?: string;
  };
}

/**
 * Options for parsing chatbot request
 */
interface ParseChatBotRequestOptions {
  /**
   * Raw request object
   */
  request: Request;
}

/**
 * Extract question from request body
 *
 * Purpose: Gets question from body or metadata
 * - Checks body.question first
 * - Falls back to body.metadata.question
 * - Extracts from last user message if question not found
 * - Supports both UIMessage format (content) and AssistantChatTransport format (parts)
 *
 * @param body - Request body object
 * @param messages - Array of UI messages or raw message objects
 * @returns Question string or undefined
 */
function extractQuestion(
  body: ChatBotRequestBody,
  messages: unknown[]
): string | undefined {
  // Try direct question field
  if (body.question && typeof body.question === "string") {
    return body.question.trim();
  }

  // Try metadata question
  if (body.metadata?.question && typeof body.metadata.question === "string") {
    return body.metadata.question.trim();
  }

  // Extract from last user message
  if (Array.isArray(messages) && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      typeof lastMessage === "object" &&
      "role" in lastMessage &&
      lastMessage.role === "user"
    ) {
      // Handle AssistantChatTransport format (parts)
      if ("parts" in lastMessage && Array.isArray(lastMessage.parts)) {
        const textPart = lastMessage.parts.find(
          (part: unknown) =>
            part &&
            typeof part === "object" &&
            "type" in part &&
            part.type === "text" &&
            "text" in part
        );
        if (textPart && typeof textPart === "object" && "text" in textPart) {
          return typeof textPart.text === "string"
            ? textPart.text.trim()
            : undefined;
        }
      }

      // Handle UIMessage format (content)
      if ("content" in lastMessage) {
        const content = lastMessage.content;
        if (typeof content === "string") {
          return content.trim();
        }
        if (Array.isArray(content)) {
          const textContent = content.find(
            (item) =>
              item &&
              typeof item === "object" &&
              "type" in item &&
              item.type === "text" &&
              "text" in item
          );
          if (
            textContent &&
            typeof textContent === "object" &&
            "text" in textContent
          ) {
            return typeof textContent.text === "string"
              ? textContent.text.trim()
              : undefined;
          }
        }
      }
    }
  }

  return undefined;
}

/**
 * Parse messages from request body
 *
 * Purpose: Extracts and validates messages array from request
 * - Handles AssistantChatTransport message format (with parts)
 * - Handles UIMessage format (with content)
 * - Provides fallback to empty array
 *
 * @param body - Request body object
 * @returns Array of message objects (can be UIMessage or AssistantChatTransport format)
 */
function parseMessages(body: unknown): unknown[] {
  if (
    !body ||
    typeof body !== "object" ||
    !("messages" in body) ||
    !Array.isArray(body.messages)
  ) {
    return [];
  }

  return body.messages;
}

/**
 * Parse chatbot request and extract question
 *
 * Purpose: Extracts question from request body
 * - Parses JSON body
 * - Extracts question from various sources
 * - Validates request structure
 *
 * @param options - Parse chatbot request options
 * @returns Question string
 * @throws Error if request body is invalid or question not found
 */
async function parseChatBotRequest(
  options: ParseChatBotRequestOptions
): Promise<string> {
  const { request } = options;

  let body: ChatBotRequestBody;
  try {
    body = (await request.json()) as ChatBotRequestBody;
  } catch (error) {
    logger.error("Failed to parse request body", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Invalid request body: JSON parsing failed");
  }

  const messages = parseMessages(body);
  const question = extractQuestion(body, messages);

  if (!question || question.length === 0) {
    throw new Error("Question is required and cannot be empty");
  }

  return question;
}

/**
 * Handle POST request to chatbot API
 *
 * Purpose: Main entry point for chatbot API requests
 * - Parses request body
 * - Calls chatbot service
 * - Returns streaming response compatible with assistant-ui
 *
 * Steps:
 * 1. Parse and validate request body
 * 2. Extract question from request
 * 3. Call chatbot service
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
 *   question?: string,
 *   metadata?: { question?: string }
 * }
 * ```
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const question = await parseChatBotRequest({ request: req });

    logger.debug("Processing chatbot request", {
      questionLength: question.length,
    });

    const result = await askChatbot({ question });

    logger.debug("Chatbot request completed", {
      answerLength: result.answer.length,
      status: result.status,
    });

    return createStreamingResponse({ text: result.answer });
  } catch (error) {
    return toErrorResponse({
      error,
      status: HTTP_STATUS.BAD_REQUEST,
      loggerContext: {
        service: "api",
        endpoint: "/api/chat-bot",
      },
    });
  }
}
