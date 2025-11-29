# MCP Client Library

A pure TypeScript library for managing MCP (Model Context Protocol) client connections and retrieving tools for AI SDK integration.

## Table of Contents

- [Overview](#overview)
- [Library Structure](#library-structure)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
  - [Create and Register Clients](#1-create-and-register-clients)
  - [Get Tools](#2-get-tools)
  - [Use with AI SDK](#3-use-with-ai-sdk)
- [API Reference](#api-reference)
  - [MCPClientManager](#mcpclientmanager)
  - [Tools Functions](#tools-functions)
  - [Transport Adapters](#transport-adapters)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Design Principles](#design-principles)
- [Integration](#integration)

## Overview

This library provides core functionality for:

- **MCPClientManager**: Manage multiple MCP client instances
- **Transport Adapters**: HTTP and SSE transport support
- **Tools Integration**: Retrieve and merge tools from MCP servers

## Library Structure

```
mcp/
├── index.ts          # Main exports (MCPClientManager, tools, adapters)
├── client.ts         # MCPClientManager class and types
├── tools.ts          # getMcpTools, getAllMcpTools functions
├── http-adapter.ts   # HTTP transport adapter
└── sse-adapter.ts    # SSE transport adapter
```

## Installation

This is a pure library with no external dependencies beyond `@ai-sdk/mcp`. It does not include integration logic - use `mcp-integrations` for that.

## Basic Usage

### 1. Create and Register Clients

```typescript
import { MCPClientManager } from "@/lib/mcp";

const manager = new MCPClientManager();

// Register an HTTP client
await manager.registerClient({
  id: "my-client",
  type: "http",
  url: "https://example.com/mcp",
  headers: {
    Authorization: "Bearer token",
  },
  setAsDefault: true,
});

// Register an SSE client
await manager.registerClient({
  id: "sse-client",
  type: "sse",
  url: "https://example.com/mcp/sse",
});
```

### 2. Get Tools

```typescript
import { getMcpTools, getAllMcpTools } from "@/lib/mcp";

// Get tools from default client
const tools = await getMcpTools(manager);

// Get tools from specific client
const clientTools = await getMcpTools(manager, "my-client");

// Get and merge tools from all clients
const allTools = await getAllMcpTools(manager);
```

### 3. Use with AI SDK

```typescript
import { getAllMcpTools } from "@/lib/mcp";
import { generateText } from "ai";

const manager = new MCPClientManager();
// ... register clients ...

const tools = await getAllMcpTools(manager);

const result = await generateText({
  model: yourModel,
  prompt: "User prompt",
  tools: tools,
});
```

## API Reference

### MCPClientManager

#### `registerClient(config: MCPClientConfig): Promise<void>`

Register a new MCP client.

**Parameters:**

- `config.id`: Unique client identifier
- `config.type`: `"http"` or `"sse"`
- `config.url`: MCP server URL (required)
- `config.headers`: Optional headers object
- `config.setAsDefault`: Set as default client

#### `getClient(id: string): MCPClient | undefined`

Get client by ID.

#### `getDefaultClient(): MCPClient | undefined`

Get the default client.

#### `setDefaultClient(id: string): void`

Set the default client.

#### `removeClient(id: string): Promise<void>`

Remove and close a client.

#### `listClientIds(): string[]`

List all registered client IDs.

#### `closeAll(): Promise<void>`

Close all clients and clear the manager.

### Tools Functions

#### `getMcpTools(manager: MCPClientManager, clientId?: string): Promise<Record<string, unknown>>`

Get tools from a specific client or the default client.

**Returns:** Tools object compatible with AI SDK

#### `getAllMcpTools(manager: MCPClientManager): Promise<Record<string, unknown>>`

Get and merge tools from all registered clients. Later clients override earlier ones if tool names conflict.

**Returns:** Merged tools object

### Transport Adapters

#### `createHttpMCPClient(config: HttpAdapterConfig): Promise<MCPClient>`

Create an MCP client with HTTP transport.

#### `createSSEMCPClient(config: SSEAdapterConfig): Promise<MCPClient>`

Create an MCP client with SSE transport.

## Type Definitions

```typescript
interface MCPClientConfig {
  id: string;
  type: "http" | "sse";
  url: string;
  headers?: Record<string, string>;
  setAsDefault?: boolean;
}

type MCPClient = Awaited<ReturnType<typeof experimental_createMCPClient>>;
```

## Error Handling

The library handles errors gracefully:

- Returns empty object `{}` if client is unavailable
- Logs warnings for missing clients
- Continues operation even if some clients fail

This ensures applications can function normally when MCP tools are unavailable.

## Design Principles

- **Pure Library**: No external dependencies beyond `@ai-sdk/mcp`
- **No Defaults**: All configurations must be explicitly provided
- **No Auto-initialization**: Clients must be registered manually
- **Separation of Concerns**: Integration logic is in `mcp-integrations`, not this library

## Integration

For application-level integration with environment variables and auto-initialization, use the `mcp-integrations` module:

```typescript
import { createMCPManager, getAllMcpTools } from "@/lib/mcp-integrations";

const manager = await createMCPManager();
const tools = await getAllMcpTools(manager);
```
