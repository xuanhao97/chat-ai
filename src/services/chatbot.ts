/**
 * Chatbot Service
 *
 * Purpose: Handles communication with Arobid Chatbot API
 * - Uses fetch client for API requests
 * - Handles request/response transformation
 * - Manages error handling and logging
 */

import { createLogger } from "@/lib/loggers";
import { createFetchClient, type FetchClient } from "@/lib/fetch-client";

const logger = createLogger({ service: "chatbot" });

/**
 * Chatbot API configuration
 */
const CHATBOT_API_BASE_URL =
  process.env.CHATBOT_API_URL || "https://ai-chat.arobid.com/api/v1.0";

/**
 * Chatbot API endpoint path
 */
const CHATBOT_API_ENDPOINT = "/chat/ask";

/**
 * Create fetch client instance for chatbot service
 *
 * Purpose: Creates dedicated fetch client for chatbot API
 * - Configures baseUrl for chatbot API
 * - Sets default headers
 * - Enables logging for debugging
 */
const chatbotClient: FetchClient = createFetchClient({
  baseUrl: CHATBOT_API_BASE_URL,
  defaultHeaders: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  },
  defaultTimeout: 30000,
  enableLogger: false,
});

/**
 * Request body for chatbot API
 */
interface ChatbotRequest {
  question: string;
}

/**
 * Response from chatbot API
 */
interface ChatbotResponse {
  answer: string;
}

/**
 * Options for chatbot API request
 */
interface ChatbotRequestOptions {
  /**
   * Question to ask the chatbot
   */
  question: string;
  /**
   * Optional custom API URL
   */
  apiUrl?: string;
  /**
   * Optional headers to include
   */
  headers?: Record<string, string>;
}

/**
 * Result of chatbot API call
 */
interface ChatbotResult {
  /**
   * Answer from chatbot
   */
  answer: string;
  /**
   * HTTP status code
   */
  status: number;
}

/**
 * Validate chatbot response structure
 *
 * Purpose: Ensures response has expected structure
 * - Checks if response is an object
 * - Validates answer field exists
 *
 * @param data - Response data to validate
 * @returns Validated chatbot response
 * @throws Error if response structure is invalid
 */
function validateChatbotResponse(data: unknown): ChatbotResponse {
  if (!data || typeof data !== "object" || !("answer" in data)) {
    logger.error("Invalid response structure from chatbot API", {
      responseData: JSON.stringify(data).substring(0, 200),
    });
    throw new Error("Invalid response structure from chatbot API");
  }

  const response = data as ChatbotResponse;
  return response;
}

/**
 * Ask chatbot a question
 *
 * Purpose: Provides configured function for chatbot requests
 * - Uses fetch client for HTTP requests
 * - Handles request/response transformation
 * - Includes error handling and validation
 *
 * @param options - Chatbot request options
 * @returns Promise resolving to chatbot result
 * @throws Error if request fails or response is invalid
 *
 * @example
 * ```ts
 * const result = await askChatbot({ question: "arobid" });
 * console.log(result.answer);
 * ```
 */
export async function askChatbot(
  options: ChatbotRequestOptions
): Promise<ChatbotResult> {
  const { question, apiUrl, headers = {} } = options;

  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    throw new Error("Question is required and must be a non-empty string");
  }

  const requestBody: ChatbotRequest = {
    question: question.trim(),
  };

  // Use custom URL if provided, otherwise use default endpoint
  const url = apiUrl || CHATBOT_API_ENDPOINT;

  try {
    logger.debug("Sending request to chatbot API", {
      url,
      question: question.substring(0, 100), // Log first 100 chars
    });

    const result = await chatbotClient.request<ChatbotResponse>({
      url,
      method: "POST",
      body: requestBody,
      headers,
      parseJson: true,
      stream: false, // Force non-streaming response
    });

    // Type guard: ensure result is FetchResult (not FetchStreamResult)
    // With stream=false, fetch-client will always return FetchResult
    if (!("data" in result)) {
      logger.error("Unexpected streaming response from chatbot API", {
        hasStream: "stream" in result,
      });
      throw new Error("Unexpected streaming response from chatbot API");
    }

    // Handle regular JSON response
    const responseData = validateChatbotResponse(result.data);
    const answer =
      typeof responseData.answer === "string" ? responseData.answer : "";

    logger.debug("Chatbot API request successful", {
      status: result.status,
      answerLength: answer.length,
    });

    return {
      answer,
      status: result.status,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid response")) {
      throw error;
    }

    if (error instanceof Error && error.message.includes("Request failed")) {
      logger.error("Chatbot API request failed", {
        error: error.message,
      });
      throw new Error(`Chatbot API request failed: ${error.message}`);
    }

    logger.error("Unexpected error in chatbot API request", {
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      `Failed to communicate with chatbot API: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
