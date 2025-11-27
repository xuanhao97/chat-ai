/**
 * MCP Client
 *
 * Client để giao tiếp với MCP server qua HTTP.
 * Giả định MCP server expose REST API với các endpoint:
 * - POST /tools/list -> list tools
 * - POST /tools/call -> call a tool
 *
 */

/**
 * JSON Schema property definition
 */
export interface JsonSchemaProperty {
  type?: string;
  description?: string;
  enum?: unknown[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  [key: string]: unknown;
}

export interface McpToolDef {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
}

/**
 * JSON-RPC 2.0 Request format
 */
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id?: string | number | null;
}

/**
 * JSON-RPC 2.0 Response format
 */
export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id?: string | number | null;
}

const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

if (!MCP_SERVER_URL) {
  console.warn("MCP_SERVER_URL is not set. MCP tools will not be available.");
}

/**
 * Parse Server-Sent Events (SSE) format response
 * SSE format: "event: message\ndata: {...}\n\n"
 *
 * @param text - SSE formatted text
 * @returns Parsed JSON data from SSE data field
 */
function parseSSEResponse(text: string): unknown {
  const lines = text.split("\n");
  let jsonData: string | null = null;

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      jsonData = line.substring(6); // Remove "data: " prefix
      break;
    }
  }

  if (!jsonData) {
    throw new Error("No data field found in SSE response");
  }

  return JSON.parse(jsonData);
}

/**
 * MCP Client object
 * Provides methods to interact with MCP server
 */
export const mcpClient = {
  /**
   * List all available tools from MCP server
   *
   * @returns Promise resolving to array of tool definitions
   */
  async listTools(): Promise<McpToolDef[]> {
    if (!MCP_SERVER_URL) {
      throw new Error("MCP_SERVER_URL is not set. Cannot list tools.");
    }
    console.log("[DEBUG] Listing MCP tools from: ", MCP_SERVER_URL);
    try {
      const requestId = Date.now().toString();
      const jsonRpcRequest: JsonRpcRequest = {
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
        id: requestId,
      };

      const response = await fetch(MCP_SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "X-Arobid-Backend-Url": "https://gw-prod.arobid.com",
        },
        body: JSON.stringify(jsonRpcRequest),
        // TODO: Add timeout and error handling
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => response.statusText);
        console.error(`MCP server error: ${response.status} ${errorText}`);
        return [];
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      const text = await response.text();

      // If response is empty, return empty array
      if (!text || text.trim().length === 0) {
        console.warn("MCP server returned empty response");
        return [];
      }

      // Parse response - handle both JSON and Server-Sent Events (SSE) format
      let jsonRpcResponse: JsonRpcResponse<
        { tools?: McpToolDef[] } | McpToolDef[]
      >;
      try {
        // Check if response is SSE format (text/event-stream)
        if (
          contentType?.includes("text/event-stream") ||
          text.includes("event:") ||
          text.includes("data: ")
        ) {
          const parsed = parseSSEResponse(text);
          jsonRpcResponse = parsed as JsonRpcResponse<
            { tools?: McpToolDef[] } | McpToolDef[]
          >;
        } else {
          // Regular JSON response
          jsonRpcResponse = JSON.parse(text) as JsonRpcResponse<
            { tools?: McpToolDef[] } | McpToolDef[]
          >;
        }
      } catch (parseError) {
        console.error("Failed to parse MCP server response:", {
          contentType,
          textPreview: text.substring(0, 200),
          error:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error",
        });
        return [];
      }

      // Check for JSON-RPC error
      if (jsonRpcResponse.error) {
        console.error(
          "MCP server returned JSON-RPC error:",
          jsonRpcResponse.error
        );
        return [];
      }

      // Extract result from JSON-RPC response
      const result = jsonRpcResponse.result;
      if (!result) {
        console.warn("MCP server returned empty result");
        return [];
      }

      // Handle different result formats
      if (Array.isArray(result)) {
        return result;
      } else if (
        typeof result === "object" &&
        "tools" in result &&
        Array.isArray(result.tools)
      ) {
        return result.tools;
      } else {
        console.warn("Unexpected MCP server response format:", result);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch MCP tools:", error);
      return [];
    }
  },

  /**
   * Call a tool on MCP server
   *
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Promise resolving to tool result
   */
  async callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    if (!MCP_SERVER_URL) {
      throw new Error("MCP_SERVER_URL is not set. Cannot call tool.");
    }

    try {
      console.log("[DEBUG] Calling MCP tool: ", name, args);

      const requestId = Date.now().toString();
      const jsonRpcRequest: JsonRpcRequest = {
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name,
          arguments: args,
        },
        id: requestId,
      };

      const response = await fetch(MCP_SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "X-Arobid-Backend-Url": "https://gw-prod.arobid.com",
        },
        body: JSON.stringify(jsonRpcRequest),
        // TODO: Add timeout and error handling
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => response.statusText);
        throw new Error(
          `MCP tool call failed: ${response.status} ${errorText}`
        );
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      const text = await response.text();

      // If response is empty, return null
      if (!text || text.trim().length === 0) {
        console.warn("MCP server returned empty response for tool call");
        return null;
      }

      // Parse response - handle both JSON and Server-Sent Events (SSE) format
      let jsonRpcResponse: JsonRpcResponse<unknown>;
      try {
        // Check if response is SSE format (text/event-stream)
        if (
          contentType?.includes("text/event-stream") ||
          text.includes("event:") ||
          text.includes("data: ")
        ) {
          const parsed = parseSSEResponse(text);
          jsonRpcResponse = parsed as JsonRpcResponse<unknown>;
        } else {
          // Regular JSON response
          jsonRpcResponse = JSON.parse(text) as JsonRpcResponse<unknown>;
        }
      } catch (parseError) {
        const errorMessage =
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error";
        console.error(`Failed to parse MCP tool call response:`, {
          contentType,
          textPreview: text.substring(0, 200),
          error: errorMessage,
        });
        throw new Error(`Invalid response from MCP server: ${errorMessage}`);
      }

      // Check for JSON-RPC error
      if (jsonRpcResponse.error) {
        const errorMessage = jsonRpcResponse.error.message || "Unknown error";
        const errorCode = jsonRpcResponse.error.code || -32000;
        throw new Error(`MCP tool call error (${errorCode}): ${errorMessage}`);
      }

      // Extract result from JSON-RPC response
      if ("result" in jsonRpcResponse && jsonRpcResponse.result !== undefined) {
        // If result has a nested result property (e.g., { result: { result: ... } }), extract it
        if (
          typeof jsonRpcResponse.result === "object" &&
          jsonRpcResponse.result !== null &&
          "result" in jsonRpcResponse.result
        ) {
          return (jsonRpcResponse.result as { result: unknown }).result;
        }
        return jsonRpcResponse.result;
      }

      // Fallback: return null if no result
      return null;
    } catch (error) {
      console.error(`Failed to call MCP tool "${name}":`, error);
      throw error;
    }
  },
};
