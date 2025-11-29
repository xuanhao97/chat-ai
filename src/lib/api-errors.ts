import { createLogger } from "@/lib/loggers";
import { HTTP_STATUS } from "@/constants";

const logger = createLogger({ service: "api-errors" });

/**
 * API Error Response Utilities
 *
 * Purpose: Common error response handling for API routes
 * - Standardizes error response format
 * - Provides consistent error logging
 * - Supports different HTTP status codes
 */

/**
 * Options for converting error to response
 */
export interface ToErrorResponseOptions {
  /**
   * Error object
   */
  error: unknown;
  /**
   * HTTP status code
   * @default HTTP_STATUS.BAD_REQUEST (400)
   */
  status?: number;
  /**
   * Optional logger context (service name, endpoint, etc.)
   */
  loggerContext?: {
    service?: string;
    endpoint?: string;
    [key: string]: unknown;
  };
}

/**
 * Convert error object to standardized HTTP error response
 *
 * Purpose: Formats error into HTTP response with consistent structure
 * - Extracts error message from error object
 * - Logs error with context information
 * - Returns JSON error response with appropriate status code
 *
 * @param options - Convert error to response options
 * @returns Error response with JSON body
 *
 * @example
 * ```ts
 * try {
 *   // ... some operation
 * } catch (error) {
 *   return toErrorResponse({
 *     error,
 *     status: 400,
 *     loggerContext: { service: "api", endpoint: "/api/chat" }
 *   });
 * }
 * ```
 */
export function toErrorResponse(options: ToErrorResponseOptions): Response {
  const {
    error,
    status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    loggerContext = {},
  } = options;

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : undefined;

  const contextLogger = loggerContext.service
    ? createLogger({
        service: loggerContext.service,
        endpoint: loggerContext.endpoint,
      })
    : logger;

  contextLogger.error("API error occurred", {
    error: errorMessage,
    stack: errorStack,
    status,
    ...loggerContext,
  });

  const errorTitle =
    status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? "Internal server error"
      : status >= HTTP_STATUS.BAD_REQUEST
        ? "Bad request"
        : "Error";

  return new Response(
    JSON.stringify({
      error: errorTitle,
      message: errorMessage,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
