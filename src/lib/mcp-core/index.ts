/**
 * MCP Module
 *
 * Main export file for MCP client and tools
 * This is a pure library - no dependencies on external integrations
 */

export {
  MCPClientManager,
  type MCPClient,
  type MCPClientConfig,
} from "./client";
export { createHttpMCPClient, type HttpAdapterConfig } from "./http-adapter";
export { createSSEMCPClient, type SSEAdapterConfig } from "./sse-adapter";
