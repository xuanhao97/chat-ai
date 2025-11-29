import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

/**
 * LLM Provider configuration
 * Maps provider names to their respective AI SDK models
 */

export type ModelProvider = "gemini" | "openai";

export interface ModelConfig {
  provider: ModelProvider;
  model: ReturnType<typeof google> | ReturnType<typeof openai>;
}

type GoogleGenerativeAIModelId =
  | "gemini-1.5-flash"
  | "gemini-1.5-flash-latest"
  | "gemini-1.5-flash-001"
  | "gemini-1.5-flash-002"
  | "gemini-1.5-flash-8b"
  | "gemini-1.5-flash-8b-latest"
  | "gemini-1.5-flash-8b-001"
  | "gemini-1.5-pro"
  | "gemini-1.5-pro-latest"
  | "gemini-1.5-pro-001"
  | "gemini-1.5-pro-002"
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-001"
  | "gemini-2.0-flash-live-001"
  | "gemini-2.0-flash-lite"
  | "gemini-2.0-pro-exp-02-05"
  | "gemini-2.0-flash-thinking-exp-01-21"
  | "gemini-2.0-flash-exp"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-image-preview"
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash-lite-preview-09-2025"
  | "gemini-2.5-flash-preview-04-17"
  | "gemini-2.5-flash-preview-09-2025"
  | "gemini-3-pro-preview"
  | "gemini-3-pro-image-preview"
  | "gemini-pro-latest"
  | "gemini-flash-latest"
  | "gemini-flash-lite-latest"
  | "gemini-2.5-pro-exp-03-25"
  | "gemini-exp-1206"
  | "gemma-3-12b-it"
  | "gemma-3-27b-it"
  | (string & {});

type OpenAIResponsesModelId =
  | "chatgpt-4o-latest"
  | "gpt-3.5-turbo-0125"
  | "gpt-3.5-turbo-1106"
  | "gpt-3.5-turbo"
  | "gpt-4-0613"
  | "gpt-4-turbo-2024-04-09"
  | "gpt-4-turbo"
  | "gpt-4.1-2025-04-14"
  | "gpt-4.1-mini-2025-04-14"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano-2025-04-14"
  | "gpt-4.1-nano"
  | "gpt-4.1"
  | "gpt-4"
  | "gpt-4o-2024-05-13"
  | "gpt-4o-2024-08-06"
  | "gpt-4o-2024-11-20"
  | "gpt-4o-mini-2024-07-18"
  | "gpt-4o-mini"
  | "gpt-4o"
  | "gpt-5.1"
  | "gpt-5.1-chat-latest"
  | "gpt-5.1-codex-mini"
  | "gpt-5.1-codex"
  | "gpt-5-2025-08-07"
  | "gpt-5-chat-latest"
  | "gpt-5-codex"
  | "gpt-5-mini-2025-08-07"
  | "gpt-5-mini"
  | "gpt-5-nano-2025-08-07"
  | "gpt-5-nano"
  | "gpt-5-pro-2025-10-06"
  | "gpt-5-pro"
  | "gpt-5"
  | "o1-2024-12-17"
  | "o1"
  | "o3-2025-04-16"
  | "o3-mini-2025-01-31"
  | "o3-mini"
  | "o3"
  | (string & {});

/**
 * Options for getModelConfig function
 */
export interface GetModelConfigOptions {
  /**
   * LLM provider to use
   * @default "gemini"
   */
  provider?: ModelProvider;
  /**
   * Optional model name override
   * If not provided, uses default model for the provider:
   * - Gemini: "gemini-2.5-flash"
   * - OpenAI: "gpt-4o-mini"
   */
  modelName?: string;
}

/**
 * Get model configuration based on provider and optional model name
 *
 * Purpose: Creates and configures an LLM model instance for the specified provider
 * - Validates API keys are present
 * - Returns configured model instance ready for use with AI SDK
 *
 * @param options - Configuration options
 * @param options.provider - "gemini" (default) or "openai"
 * @param options.modelName - Optional model name override
 * @returns ModelConfig with provider and model instance
 * @throws Error if API key is missing or provider is unknown
 *
 * @example
 * ```ts
 * // Use default Gemini model
 * const config = getModelConfig({ provider: "gemini" });
 *
 * // Use specific OpenAI model
 * const config = getModelConfig({
 *   provider: "openai",
 *   modelName: "gpt-4o"
 * });
 * ```
 */
export function getModelConfig(
  options: GetModelConfigOptions = {}
): ModelConfig {
  const { provider = "gemini", modelName } = options;

  switch (provider) {
    case "gemini": {
      const name: GoogleGenerativeAIModelId = modelName || "gemini-2.5-flash";
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Google Generative AI API key is missing. " +
            "Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable."
        );
      }

      return {
        provider: "gemini",
        model: google(name),
      };
    }
    case "openai": {
      // Default to gpt-4o-mini for cost-effectiveness
      // gpt-4.1-mini is available but gpt-4o-mini is more stable and widely supported
      const name: OpenAIResponsesModelId = modelName || "gpt-4o-mini";
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "OpenAI API key is missing. " +
            "Please set OPENAI_API_KEY environment variable."
        );
      }

      // @ai-sdk/openai automatically reads from OPENAI_API_KEY environment variable
      return {
        provider: "openai",
        model: openai(name),
      };
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
