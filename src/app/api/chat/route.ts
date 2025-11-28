import { createChatHandler } from "@/lib/assistant-runtime/runtime";
import type { ModelProvider } from "@/lib/assistant-runtime/llm";
import type { UIMessage } from "ai";
/**
 * Chat API Route
 *
 * Handles POST requests from assistant-ui AssistantChatTransport
 * Processes messages, selects LLM provider, and returns streaming response
 */

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max duration

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Parse messages from assistant-ui payload
    // AssistantChatTransport sends messages in UIMessage format
    const messages = (body.messages || []) as UIMessage[];

    // Get system message from body (if provided by assistant-ui)
    const system = body.system || body.metadata?.system;

    // Get model provider from metadata or body
    // Default to "gemini" if not specified
    const modelProvider = (body.modelProvider ||
      body.metadata?.modelProvider ||
      "gemini") as ModelProvider;
    const modelName = body.modelName || body.metadata?.modelName;

    // Get forceToolUse option (default: true - bắt buộc sử dụng tools)
    const forceToolUse =
      body.forceToolUse !== undefined
        ? body.forceToolUse
        : body.metadata?.forceToolUse !== undefined
          ? body.metadata.forceToolUse
          : true;

    // Get frontend tools from request body
    // AssistantChatTransport automatically forwards frontend tools
    const tools = body.tools || body.metadata?.tools;

    // Create chat handler with provider, messages, and frontend tools
    const result = await createChatHandler({
      messages,
      system,
      modelProvider,
      modelName,
      tools,
      forceToolUse,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
