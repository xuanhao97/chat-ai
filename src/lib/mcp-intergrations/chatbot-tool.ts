/**
 * Chatbot MCP Tool
 *
 * Purpose: Provides MCP tool for Arobid Chatbot API
 * - Integrates chatbot API as an MCP tool
 * - Can be used by LLM to answer questions via chatbot
 * - Follows AI SDK tool format
 */

import { askChatbot } from "@/services/chatbot";
import { createLogger } from "@/lib/loggers";

const logger = createLogger({ service: "mcp-integration", tool: "chatbot" });

/**
 * Get chatbot tool definition
 *
 * Purpose: Returns tool definition compatible with AI SDK
 * - Defines tool schema with question parameter
 * - Provides execute function that calls chatbot API
 *
 * @returns Tool definition object
 */
export function getChatbotTool(): Record<string, unknown> {
  return {
    askChatbot: {
      description:
        "Ask a question to the Arobid chatbot API. Use this tool to get answers from the chatbot service without using LLM.",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The question to ask the chatbot",
          },
        },
        required: ["question"],
      },
      execute: async (args: { question: string }): Promise<string> => {
        try {
          if (!args.question || typeof args.question !== "string") {
            throw new Error("Question is required and must be a string");
          }

          logger.debug("Executing chatbot tool", {
            questionLength: args.question.length,
          });

          const result = await askChatbot({ question: args.question });

          logger.debug("Chatbot tool executed successfully", {
            answerLength: result.answer.length,
          });

          return result.answer;
        } catch (error) {
          logger.error("Chatbot tool execution failed", {
            error: error instanceof Error ? error.message : String(error),
            question: args.question?.substring(0, 100),
          });

          throw new Error(
            `Failed to get answer from chatbot: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      },
    },
  };
}
