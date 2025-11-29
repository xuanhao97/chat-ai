/**
 * Arobid MCP Integration
 *
 * Configuration for Arobid MCP server
 * All values are required - no defaults
 */

import type { MCPClientConfig } from "../mcp-core/client";

/**
 * Get Arobid MCP client configuration
 * Requires MCP_SERVER_URL and AROBID_BACKEND_URL environment variables
 *
 * @returns MCPClientConfig for Arobid MCP server
 * @throws Error if required environment variables are not set
 */
export function getArobidMCPConfig(): MCPClientConfig {
  const serverUrl = process.env.MCP_SERVER_URL;
  const backendUrl = process.env.AROBID_BACKEND_URL;

  if (!serverUrl) {
    throw new Error(
      "MCP_SERVER_URL environment variable is required for Arobid MCP integration"
    );
  }

  if (!backendUrl) {
    throw new Error(
      "AROBID_BACKEND_URL environment variable is required for Arobid MCP integration"
    );
  }

  const headers: Record<string, string> = {
    "X-Arobid-Backend-Url": backendUrl,
  };

  // Allow additional headers from environment
  // Format: MCP_HEADER_<NAME>=<VALUE>
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("MCP_HEADER_")) {
      const headerName = key.replace("MCP_HEADER_", "").replace(/_/g, "-");
      const headerValue = process.env[key];
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    }
  });

  return {
    id: "arobid",
    type: "sse",
    url: serverUrl,
    headers,
    setAsDefault: true,
  };
}
