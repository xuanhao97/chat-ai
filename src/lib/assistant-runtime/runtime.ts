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
  forceToolUse?: boolean; // Bắt buộc LLM phải sử dụng ít nhất một tool
}

/**
 * Create streamText with a specific model
 * Returns the streamText result
 */
function createStreamTextWithModel(
  modelConfig: ReturnType<typeof getModelConfig>,
  messages: UIMessage[],
  system: string | undefined,
  allTools: Record<string, unknown>,
  forceToolUse: boolean = false
) {
  try {
    // Nếu bắt buộc sử dụng tools, thêm system message yêu cầu
    let finalSystem = system;
    if (forceToolUse && Object.keys(allTools).length > 0) {
      const toolUseInstruction = `IMPORTANT: You MUST use at least one of the available tools to answer the user's question. Do not provide a direct answer without using a tool. Available tools: ${Object.keys(allTools).join(", ")}.`;
      finalSystem = finalSystem
        ? `${finalSystem}\n\n${toolUseInstruction}`
        : toolUseInstruction;
    }

    return streamText({
      model: modelConfig.model,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(10),
      ...(finalSystem ? { system: finalSystem } : {}),
      // @ts-expect-error - tools type mismatch between AI SDK and assistant-ui
      tools: allTools,
      // Bắt buộc tool use bằng cách set maxSteps tối thiểu
      maxSteps:
        forceToolUse && Object.keys(allTools).length > 0 ? 5 : undefined,
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
    forceToolUse = true, // Mặc định bắt buộc sử dụng tools
  } = options;

  console.log("[DEBUG] messages: ", messages);
  console.log("[DEBUG] system: ", system);
  console.log("[DEBUG] modelProvider: ", modelProvider);
  console.log("[DEBUG] modelName: ", modelName);
  console.log("[DEBUG] forceToolUse: ", forceToolUse);

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

  // Kiểm tra nếu bắt buộc sử dụng tools nhưng không có tools nào
  // Tự động disable forceToolUse nếu không có tools
  let finalForceToolUse = forceToolUse;
  if (forceToolUse && Object.keys(allTools).length === 0) {
    console.warn(
      "[WARNING] forceToolUse is enabled but no tools are available. Disabling tool enforcement."
    );
    finalForceToolUse = false;
  }

  // Get model config and create streamText directly
  const modelConfig = getModelConfig(modelProvider, modelName);
  return createStreamTextWithModel(
    modelConfig,
    messages,
    system,
    allTools,
    finalForceToolUse
  );
}
