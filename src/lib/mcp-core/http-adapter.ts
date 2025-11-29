/**
 * HTTP Transport Adapter for MCP Client
 *
 * Handles HTTP-based connections to MCP servers using StreamableHTTP transport
 */

import { experimental_createMCPClient } from "@ai-sdk/mcp";

export interface HttpAdapterConfig {
  url: string;
  headers?: Record<string, string>;
}

/**
 * Create MCP client with HTTP transport
 */
export async function createHttpMCPClient(
  config: HttpAdapterConfig
): Promise<Awaited<ReturnType<typeof experimental_createMCPClient>>> {
  return await experimental_createMCPClient({
    transport: {
      type: "http",
      url: config.url,
      headers: config.headers,
    },
  });
}
