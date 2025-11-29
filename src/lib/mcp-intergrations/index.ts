/**
 * MCP Integrations
 *
 * Central export for all MCP client integrations
 * This is a barrel export file - all integration logic is in manager.ts
 */

export * from "./manager";
export { getArobidMCPConfig } from "./arobid";
export { getChatbotTool } from "./chatbot-tool";
