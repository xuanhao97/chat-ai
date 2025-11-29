/**
 * MCP Integration Manager
 *
 * Handles integration, setup, and tools retrieval for MCP clients
 * This file combines client management and tools functionality
 */

import { MCPClientManager, type MCPClientConfig } from "@/lib/mcp-core";
import { getArobidMCPConfig } from "./arobid";
import { getChatbotTool } from "./chatbot-tool";
import { createLogger } from "@/lib/loggers";

const logger = createLogger({ service: "mcp-integration" });

/**
 * Register a single MCP client with automatic fallback
 * Tries HTTP first, falls back to SSE if HTTP fails
 *
 * @param manager - MCPClientManager instance to register the client with
 * @param config - Client configuration
 * @param fallbackToSSE - Whether to fallback to SSE if HTTP fails (default: true)
 * @returns Promise that resolves when client is registered
 */
export async function registerMCPClient(
  manager: MCPClientManager,
  config: MCPClientConfig,
  fallbackToSSE: boolean = true
): Promise<void> {
  // Check if client already exists
  if (manager.getClient(config.id)) {
    logger.warn("Client already exists, skipping registration", {
      clientId: config.id,
    });
    return;
  }

  // If type is HTTP and fallback is enabled, try HTTP first
  if (config.type === "http" && fallbackToSSE) {
    try {
      await manager.registerClient(config);
      return;
    } catch (error) {
      logger.warn("Failed to register client (HTTP), trying SSE", {
        clientId: config.id,
        error: error instanceof Error ? error.message : String(error),
      });
      // Fallback to SSE
      try {
        await manager.registerClient({
          ...config,
          type: "sse",
        });
        return;
      } catch (err) {
        logger.error("Failed to register client (SSE)", {
          clientId: config.id,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    }
  }

  // Direct registration without fallback
  await manager.registerClient(config);
}

/**
 * Register multiple MCP clients from configuration
 *
 * @param manager - MCPClientManager instance
 * @param configs - Array of client configurations
 * @param options - Registration options
 * @returns Promise that resolves when all clients are registered
 */
export async function registerMCPClients(
  manager: MCPClientManager,
  configs: MCPClientConfig[],
  options: {
    fallbackToSSE?: boolean;
    continueOnError?: boolean;
  } = {}
): Promise<void> {
  const { fallbackToSSE = true, continueOnError = true } = options;

  for (const config of configs) {
    try {
      await registerMCPClient(manager, config, fallbackToSSE);
    } catch (error) {
      if (continueOnError) {
        logger.error("Failed to register client", {
          clientId: config.id,
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      } else {
        throw error;
      }
    }
  }
}

/**
 * Initialize all MCP clients from registered integrations
 * Loads configurations from all registered integrations
 *
 * @param manager - MCPClientManager instance
 * @param options - Initialization options
 * @returns Promise that resolves when all clients are initialized
 */
export async function initializeMCPClients(
  manager: MCPClientManager,
  options: {
    fallbackToSSE?: boolean;
    continueOnError?: boolean;
  } = {}
): Promise<void> {
  const configs: MCPClientConfig[] = [];

  // Load Arobid MCP integration
  try {
    configs.push(getArobidMCPConfig());
  } catch (error) {
    // Log but don't throw - allow other integrations to load
    logger.warn("Failed to load Arobid MCP config", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Add more integrations here as needed
  // Example:
  // try {
  //   configs.push(getExternalMCPConfig());
  // } catch (error) {
  //   console.warn("[MCP Integration] Failed to load External MCP config:", error);
  // }

  if (configs.length === 0) {
    logger.warn(
      "No MCP client configurations found. MCP tools will not be available."
    );
    return;
  }

  await registerMCPClients(manager, configs, options);
}

/**
 * Create and configure an MCP client manager with all configured clients
 * This is a convenience function for applications that need a ready-to-use manager
 *
 * @param options - Configuration options
 * @returns Promise resolving to configured MCPClientManager instance
 */
export async function createMCPManager(
  options: {
    fallbackToSSE?: boolean;
    continueOnError?: boolean;
  } = {}
): Promise<MCPClientManager> {
  const manager = new MCPClientManager();
  await initializeMCPClients(manager, options);
  return manager;
}

export async function getMcpTool(
  clientId: string
): Promise<Record<string, unknown>> {
  try {
    const manager = await createMCPManager();
    const client = manager.getClient(clientId);

    if (!client) {
      logger.warn("MCP client not found, returning empty tools", {
        clientId: clientId || "default",
      });
      return {};
    }

    const tools = await client.tools();
    return tools;
  } catch (error) {
    logger.error("Failed to get MCP tools", {
      clientId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Return empty object if MCP server is unavailable
    // App can still function without tools
    return {};
  }
}

/**
 * Get all MCP tools from all registered clients
 * Automatically creates and initializes manager if needed
 * Also includes integrated tools like chatbot tool
 *
 * @returns Promise resolving to merged tools object from all clients and integrated tools
 */
export async function getAllMcpTools(): Promise<Record<string, unknown>> {
  try {
    const manager = await createMCPManager();
    const clientIds = manager.listClientIds();
    const allTools: Record<string, unknown> = {};

    // Add integrated tools first (can be overridden by MCP server tools)
    try {
      const chatbotTool = getChatbotTool();
      Object.assign(allTools, chatbotTool);
    } catch (error) {
      logger.warn("Failed to load chatbot tool", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Add MCP server tools (these override integrated tools with same name)
    for (const clientId of clientIds) {
      try {
        const client = manager.getClient(clientId);
        if (client) {
          const tools = await client.tools();
          // Merge tools (later clients override earlier ones with same name)
          Object.assign(allTools, tools);
        }
      } catch (error) {
        logger.error("Failed to get tools from client", {
          clientId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return allTools;
  } catch (error) {
    logger.error("Failed to get all MCP tools", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}
