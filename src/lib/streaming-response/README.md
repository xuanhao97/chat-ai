# Streaming Response

## Table of Contents

- [Purpose](#purpose)
- [Key Concepts](#key-concepts)
- [Quick Example](#quick-example)
- [API Reference](#api-reference)
- [Stream Format](#stream-format)
- [Usage](#usage)

## Purpose

The streaming response utility converts plain text strings into Server-Sent Events (SSE) streaming responses compatible with `assistant-ui` and `AssistantChatTransport`. It formats responses according to the AI SDK UIMessage stream format, enabling seamless integration with chat interfaces.

## Key Concepts

- **Server-Sent Events (SSE)**: Protocol for streaming data from server to client
- **AI SDK Format**: Matches the format expected by `@assistant-ui/react-ai-sdk`
- **Message ID**: Unique identifier for each message in the stream
- **Stream Phases**: Structured sequence of events (start → step → text → finish)

## Quick Example

```ts
import { createStreamingResponse } from "@/lib/streaming-response";

// Convert text to streaming response
const response = createStreamingResponse({
  text: "Hello, world!",
  messageId: "msg-123",
});

// Return in API route
export async function POST(req: Request) {
  const answer = "This is the chatbot response";
  return createStreamingResponse({ text: answer });
}
```

## API Reference

### `createStreamingResponse`

Converts a text string into a streaming Response object.

**Signature:**

```ts
function createStreamingResponse(
  options: CreateStreamingResponseOptions
): Response;
```

**Parameters:**

- `options.text` (required): The text content to stream
- `options.messageId` (optional): Message identifier, defaults to `"0"`

**Returns:**

- `Response` object with `text/event-stream` content type

**Example:**

```ts
const response = createStreamingResponse({
  text: "User question answer",
  messageId: "custom-id",
});
```

## Stream Format

The function generates a stream following the AI SDK UIMessage format:

1. **start** - Initializes the stream

   ```json
   { "type": "start" }
   ```

2. **start-step** - Begins a processing step

   ```json
   { "type": "start-step" }
   ```

3. **text-start** - Starts text content

   ```json
   { "type": "text-start", "id": "message-id" }
   ```

4. **text-delta** - Contains the actual text

   ```json
   { "type": "text-delta", "id": "message-id", "delta": "text content" }
   ```

5. **text-end** - Ends text content

   ```json
   { "type": "text-end", "id": "message-id" }
   ```

6. **finish-step** - Completes the step

   ```json
   { "type": "finish-step" }
   ```

7. **finish** - Finalizes the stream

   ```json
   { "type": "finish", "finishReason": "stop" }
   ```

8. **[DONE]** - Marks stream completion
   ```
   [DONE]
   ```

## Usage

### Basic Usage

```ts
import { createStreamingResponse } from "@/lib/streaming-response";

export async function POST(req: Request) {
  const answer = await getAnswer();
  return createStreamingResponse({ text: answer });
}
```

### With Custom Message ID

```ts
import { createStreamingResponse } from "@/lib/streaming-response";

export async function POST(req: Request) {
  const messageId = generateId();
  const answer = await getAnswer();

  return createStreamingResponse({
    text: answer,
    messageId: messageId,
  });
}
```

### Integration with Chatbot Service

```ts
import { createStreamingResponse } from "@/lib/streaming-response";
import { askChatbot } from "@/services/chatbot";

export async function POST(req: Request) {
  const question = await parseQuestion(req);
  const result = await askChatbot({ question });

  return createStreamingResponse({
    text: result.answer,
  });
}
```

## Notes

- The stream uses SSE format with `data: ` prefix for each event
- Response headers are automatically set for streaming
- Message ID defaults to `"0"` if not provided
- The entire text is sent in a single `text-delta` event
- Compatible with `AssistantChatTransport` from `@assistant-ui/react-ai-sdk`
