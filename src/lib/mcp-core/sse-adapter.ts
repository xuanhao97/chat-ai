/**
 * SSE Transport Adapter for MCP Client
 *
 * Handles Server-Sent Events (SSE) based connections to MCP servers
 * Used for backward compatibility with older MCP servers
 */

import { experimental_createMCPClient } from "@ai-sdk/mcp";

export interface SSEAdapterConfig {
  url: string;
  headers?: Record<string, string>;
}

/**
 * Create MCP client with SSE transport
 */
export async function createSSEMCPClient(
  config: SSEAdapterConfig
): Promise<Awaited<ReturnType<typeof experimental_createMCPClient>>> {
  return await experimental_createMCPClient({
    transport: {
      type: "http",
      url: config.url,
      headers: config.headers,
    },
  });
}
