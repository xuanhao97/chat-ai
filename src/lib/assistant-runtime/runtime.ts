import { stepCountIs, streamText } from "ai";
import { getModelConfig, type ModelProvider } from "./llm";
import { getMcpTools } from "./mcp-tools";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages } from "ai";
/**
 * Chat Runtime
 *
 * Creates chat handler that integrates LLM provider with MCP tools
 */

export interface ChatHandlerOptions {
  messages: UIMessage[];
  modelProvider?: ModelProvider;
  modelName?: string;
  system?: string; // System message forwarded from AssistantChatTransport
  tools?: Record<string, unknown>; // Frontend tools forwarded from AssistantChatTransport
}

/**
 * Create streamText with a specific model
 * Returns the streamText result
 */
function createStreamTextWithModel(
  modelConfig: ReturnType<typeof getModelConfig>,
  messages: UIMessage[],
  system: string | undefined,
  allTools: Record<string, unknown>
) {
  try {
    return streamText({
      model: modelConfig.model,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(10),
      ...(system ? { system } : {}),
      // @ts-expect-error - tools type mismatch between AI SDK and assistant-ui
      tools: allTools,
    });
  } catch (error) {
    console.error("[ERROR] createStreamTextWithModel failed: ", error);
    throw error;
  }
}

/**
 * Create chat handler for assistant-ui
 *
 * This function:
 * 1. Selects the appropriate LLM provider (Gemini/OpenAI)
 * 2. Loads MCP tools and registers them with the LLM
 * 3. Returns a streaming response compatible with assistant-ui
 *
 * @param options - Chat handler options
 * @returns Streaming text response
 */
export async function createChatHandler(options: ChatHandlerOptions) {
  const {
    messages,
    system,
    modelProvider = "gemini",
    modelName,
    tools,
  } = options;

  console.log("[DEBUG] messages: ", messages);
  console.log("[DEBUG] system: ", system);
  console.log("[DEBUG] modelProvider: ", modelProvider);
  console.log("[DEBUG] modelName: ", modelName);

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array of UIMessage");
  }

  // Load MCP tools
  // TODO: Consider caching tools to avoid fetching on every request
  const mcpTools = await getMcpTools();

  // Merge frontend tools and MCP tools
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTools: Record<string, any> = {};

  // Add frontend tools
  if (tools && typeof tools === "object" && !Array.isArray(tools)) {
    // @ts-expect-error - frontendTools expects specific type but we have Record<string, unknown>
    const frontendToolsResult = frontendTools(tools);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.assign(allTools, frontendToolsResult as any);
  }

  // Add MCP tools
  if (mcpTools && typeof mcpTools === "object" && !Array.isArray(mcpTools)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.assign(allTools, mcpTools as any);
  }

  console.log("[DEBUG] MCP tools count: ", Object.keys(allTools).length);
  console.log("[DEBUG] All tools keys: ", Object.keys(allTools));

  // Get model config and create streamText directly
  const modelConfig = getModelConfig(modelProvider, modelName);
  return createStreamTextWithModel(modelConfig, messages, system, allTools);
}
