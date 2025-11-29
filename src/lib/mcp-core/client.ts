/**
 * MCP Client Manager
 *
 * Manages multiple MCP client instances with different transports
 */

import type { experimental_createMCPClient } from "@ai-sdk/mcp";
import { createHttpMCPClient } from "./http-adapter";
import { createSSEMCPClient } from "./sse-adapter";

export type MCPClient = Awaited<
  ReturnType<typeof experimental_createMCPClient>
>;

export interface MCPClientConfig {
  id: string;
  type: "http" | "sse";
  url: string;
  headers?: Record<string, string>;
  setAsDefault?: boolean;
}

/**
 * MCP Client Manager
 * Manages multiple MCP client instances
 */
export class MCPClientManager {
  private clients: Map<string, MCPClient> = new Map();
  private defaultClientId: string | null = null;

  /**
   * Register a new MCP client
   */
  async registerClient(config: MCPClientConfig): Promise<void> {
    let client: MCPClient;

    if (config.type === "http") {
      client = await createHttpMCPClient({
        url: config.url,
        headers: config.headers,
      });
    } else if (config.type === "sse") {
      client = await createSSEMCPClient({
        url: config.url,
        headers: config.headers,
      });
    } else {
      throw new Error(`Unsupported transport type: ${config.type}`);
    }

    this.clients.set(config.id, client);

    if (config.setAsDefault || this.defaultClientId === null) {
      this.defaultClientId = config.id;
    }
  }

  /**
   * Get a client by ID
   */
  getClient(id: string): MCPClient | undefined {
    return this.clients.get(id);
  }

  /**
   * Get the default client
   */
  getDefaultClient(): MCPClient | undefined {
    if (this.defaultClientId === null) {
      return undefined;
    }
    return this.clients.get(this.defaultClientId);
  }

  /**
   * Set the default client
   */
  setDefaultClient(id: string): void {
    if (!this.clients.has(id)) {
      throw new Error(`Client with id "${id}" not found`);
    }
    this.defaultClientId = id;
  }

  /**
   * Remove a client
   */
  async removeClient(id: string): Promise<void> {
    const client = this.clients.get(id);
    if (client) {
      await client.close();
    }

    if (this.defaultClientId === id) {
      this.defaultClientId = null;
    }
    this.clients.delete(id);
  }

  /**
   * List all registered client IDs
   */
  listClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Close all clients
   */
  async closeAll(): Promise<void> {
    await Promise.all(
      Array.from(this.clients.values()).map((client) => client.close())
    );
    this.clients.clear();
    this.defaultClientId = null;
  }
}
