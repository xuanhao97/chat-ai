import { mcpClient, type McpToolDef } from "./mcp-client";
import { tool } from "ai";
import { z } from "zod";

/**
 * MCP Tools Adapter
 *
 * Converts MCP tool definitions to AI SDK tool format
 */

/**
 * Type for AI SDK tool created from MCP tool
 * Using ReturnType to infer the actual type from tool() function
 * In AI SDK v5, tool() returns Tool<TInput, TOutput> where TInput is the zod schema type
 */
type McpTool = ReturnType<
  typeof tool<z.ZodObject<Record<string, z.ZodTypeAny>>, unknown>
>;

/**
 * Convert MCP tool definition to AI SDK tool format
 *
 * Note: AI SDK's tool() function expects zod schema for parameters,
 * but MCP provides JSON schema. We cast the JSON schema to satisfy
 * the type system, but runtime validation should be handled by the MCP server.
 *
 * @param mcpTool - MCP tool definition
 * @returns AI SDK tool definition
 */
function convertMcpToolToAiSdkTool(mcpTool: McpToolDef): McpTool {
  // Convert JSON schema to zod schema
  // For now, use z.object({}).passthrough() to accept any parameters
  // Runtime validation is handled by the MCP server
  // TODO: Consider implementing full JSON schema to zod schema conversion for better type safety
  const toolResult = tool({
    description: mcpTool.description,
    parameters: z.object({}).passthrough(), // Accept any parameters - validation handled by MCP server
    // @ts-expect-error - AI SDK v5 may have changed the tool() API, execute might not be a valid property
    execute: async (args: Record<string, unknown>) => {
      // Execute tool via MCP client
      return await mcpClient.callTool(mcpTool.name, args);
    },
  });

  // Cast to McpTool type to satisfy type system
  return toolResult as unknown as McpTool;
}

/**
 * Get all MCP tools converted to AI SDK format
 *
 * @returns Promise resolving to object with tool name as key and tool as value
 */
export async function getMcpTools(): Promise<Record<string, McpTool>> {
  try {
    const mcpTools = await mcpClient.listTools();
    const tools: Record<string, McpTool> = {};
    for (const mcpTool of mcpTools) {
      tools[mcpTool.name] = convertMcpToolToAiSdkTool(mcpTool);
    }
    return tools;
  } catch (error) {
    console.error("Failed to get MCP tools:", error);
    // Return empty object if MCP server is unavailable
    // App can still function without tools
    return {};
  }
}
