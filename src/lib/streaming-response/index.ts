/**
 * Streaming Response Utilities
 *
 * Purpose: Converts text strings to streaming responses compatible with assistant-ui
 * - Creates Server-Sent Events (SSE) format responses
 * - Matches AI SDK UIMessage stream format
 * - Compatible with AssistantChatTransport
 */

/**
 * Options for creating streaming response
 */
export interface CreateStreamingResponseOptions {
  /**
   * Text content to stream
   */
  text: string;
  /**
   * Message ID for the stream (default: "0")
   */
  messageId?: string;
}

/**
 * Create streaming response compatible with assistant-ui format
 *
 * Purpose: Converts a text string into a streaming response
 * - Formats response using AI SDK UIMessage stream format
 * - Uses Server-Sent Events (SSE) protocol
 * - Compatible with AssistantChatTransport from @assistant-ui/react-ai-sdk
 *
 * Stream Format:
 * 1. "start" - Initializes the stream
 * 2. "start-step" - Begins a step in the stream
 * 3. "text-start" - Starts text content with message ID
 * 4. "text-delta" - Contains the actual text content
 * 5. "text-end" - Ends text content
 * 6. "finish-step" - Completes the step
 * 7. "finish" - Finalizes the stream with finish reason
 * 8. "[DONE]" - Marks stream completion
 *
 * @param options - Streaming response options
 * @returns Response object with streaming text/event-stream content
 *
 * @example
 * ```ts
 * const response = createStreamingResponse({
 *   text: "Hello, world!",
 *   messageId: "msg-123"
 * });
 * return response;
 * ```
 */
export function createStreamingResponse(
  options: CreateStreamingResponseOptions
): Response {
  const { text, messageId = "0" } = options;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // AI SDK UIMessage stream format for AssistantChatTransport
      // Format uses SSE (Server-Sent Events) with "data: " prefix

      // Send start message
      const start = `data: ${JSON.stringify({ type: "start" })}\n\n`;
      controller.enqueue(encoder.encode(start));

      // Send start-step message
      const startStep = `data: ${JSON.stringify({ type: "start-step" })}\n\n`;
      controller.enqueue(encoder.encode(startStep));

      // Send text-start message
      const textStart = `data: ${JSON.stringify({
        type: "text-start",
        id: messageId,
      })}\n\n`;
      controller.enqueue(encoder.encode(textStart));

      // Send text delta with message ID (use "delta" not "textDelta")
      const textDelta = `data: ${JSON.stringify({
        type: "text-delta",
        id: messageId,
        delta: text,
      })}\n\n`;
      controller.enqueue(encoder.encode(textDelta));

      // Send text-end message
      const textEnd = `data: ${JSON.stringify({
        type: "text-end",
        id: messageId,
      })}\n\n`;
      controller.enqueue(encoder.encode(textEnd));

      // Send finish-step message
      const finishStep = `data: ${JSON.stringify({ type: "finish-step" })}\n\n`;
      controller.enqueue(encoder.encode(finishStep));

      // Send finish message to complete the stream
      const finish = `data: ${JSON.stringify({
        type: "finish",
        finishReason: "stop",
      })}\n\n`;
      controller.enqueue(encoder.encode(finish));

      // Send [DONE] marker
      const done = "data: [DONE]\n\n";
      controller.enqueue(encoder.encode(done));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
