# Arobid Chat AI

AI Assistant application built with Next.js, assistant-ui, Vercel AI SDK, and MCP (Model Context Protocol). A modern, feature-rich chat interface that supports multiple LLM providers and dynamic tool integration.

## ✨ Features

- 🤖 **Multiple LLM Providers**: Support for Google Gemini and OpenAI
- 💬 **Modern Chat UI**: Beautiful, customizable chat interface using assistant-ui
- 🔧 **MCP Tools Integration**: Dynamic tool loading from MCP server
- ⚡ **Streaming Responses**: Real-time streaming responses for better UX
- 🎨 **Beautiful UI**: Tailwind CSS with Radix UI components
- 🔄 **Tool Calling**: Automatic tool execution when LLM requests
- 📝 **Markdown Support**: Rich markdown rendering with syntax highlighting
- 🌐 **Type-safe**: Full TypeScript support with strict type checking

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: assistant-ui (@assistant-ui/react)
- **AI SDK**: Vercel AI SDK v5 (ai)
- **LLM Providers**:
  - Google Gemini (@ai-sdk/google) - Default: `gemini-2.5-pro`
  - OpenAI (@ai-sdk/openai) - Default: `gpt-4o-mini`
- **MCP Integration**: Model Context Protocol via HTTP/JSON-RPC
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Language**: TypeScript (strict mode)

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm/yarn
- API keys for at least one LLM provider:
  - Google Gemini API key
  - OpenAI API key

## 🛠️ Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd arobid-chat-ai
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Set up environment variables**:

Create `.env.local` file in the root directory:

```env
# Required: At least one LLM provider API key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional: MCP server URL (defaults to the provided URL)
MCP_SERVER_URL=https://hao-mcp.vercel.app/mcp
```

**Where to get API keys:**

- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Run the development server**:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint (POST /api/chat)
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page with AssistantRuntimeProvider
│   └── globals.css               # Global styles and Tailwind directives
│
├── components/
│   ├── assistant-ui/             # Custom assistant-ui components
│   │   ├── thread.tsx           # Main Thread component (chat UI)
│   │   ├── markdown-text.tsx    # Markdown renderer with syntax highlighting
│   │   ├── attachment.tsx       # Attachment handling
│   │   ├── tool-fallback.tsx    # Tool execution UI
│   │   └── tooltip-icon-button.tsx # Icon button with tooltip
│   └── ui/                       # Reusable UI components (Radix UI)
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       └── tooltip.tsx
│
└── lib/
    ├── assistant-runtime/        # Assistant runtime logic
    │   ├── llm.ts               # LLM provider configuration
    │   ├── mcp-client.ts        # MCP server client (JSON-RPC)
    │   ├── mcp-tools.ts         # MCP tools adapter (MCP → AI SDK)
    │   └── runtime.ts           # Chat handler with tool integration
    └── utils.ts                  # Utility functions (cn, etc.)
```

## 🏗️ Architecture

### Frontend (Next.js App Router)

- **`page.tsx`**: Sets up `AssistantRuntimeProvider` with `useChatRuntime` hook
- **`Thread` Component**: Main chat interface with messages, composer, and tool UI
- **`AssistantChatTransport`**: Automatically connects to `/api/chat` endpoint

### Backend (API Route)

- **`/api/chat`**: POST endpoint that:
  1. Receives messages from assistant-ui
  2. Parses provider and model preferences
  3. Loads MCP tools dynamically
  4. Creates chat handler with selected LLM provider
  5. Returns streaming response

### LLM Provider System

- **`llm.ts`**: Centralized provider configuration
  - Supports Gemini and OpenAI
  - Validates API keys
  - Returns configured model instances

### MCP Integration

- **`mcp-client.ts`**: HTTP client for MCP server
  - Uses JSON-RPC 2.0 protocol
  - Handles both JSON and SSE response formats
  - Methods: `listTools()`, `callTool(name, args)`

- **`mcp-tools.ts`**: Adapter layer
  - Converts MCP tool definitions to AI SDK tool format
  - Registers tools with the runtime
  - Handles tool execution via MCP server

### Runtime

- **`runtime.ts`**: Main chat handler
  - Integrates LLM provider with MCP tools
  - Supports frontend tools and backend MCP tools
  - Returns streaming response compatible with assistant-ui

## 💻 Usage

### Basic Usage

1. Open the app in your browser
2. Start chatting! The assistant will use the default provider (Gemini)

### Switching LLM Providers

The app defaults to **Gemini** (`gemini-2.5-pro`). You can switch providers programmatically by passing `modelProvider` in the request metadata.

### MCP Tools

MCP tools are automatically loaded when the app starts. If the MCP server is available:

- Tools will appear in the tool execution UI when LLM calls them
- Tool results will be included in the conversation

If the MCP server is unavailable:

- The app continues to work normally
- Tool calling will be disabled
- No error is shown (graceful degradation)

## 🔧 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
pnpm lint:fix      # Auto-fix linting issues

# Type checking
pnpm type-check

# Format code
pnpm format
pnpm format:check  # Check formatting without fixing
```

### Code Quality

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **TypeScript**: Strict mode enabled

## 🌐 Environment Variables

| Variable                       | Required | Description             | Default                          |
| ------------------------------ | -------- | ----------------------- | -------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes\*    | Google Gemini API key   | -                                |
| `OPENAI_API_KEY`               | Yes\*    | OpenAI API key          | -                                |
| `MCP_SERVER_URL`               | No       | MCP server endpoint URL | `https://hao-mcp.vercel.app/mcp` |

\* At least one LLM provider API key is required.

## 📝 Configuration

### Default Models

- **Gemini**: `gemini-2.5-pro`
- **OpenAI**: `gpt-4o-mini`

You can override the model name by passing `modelName` in the request metadata.

### MCP Server

The MCP server should implement the JSON-RPC 2.0 protocol with the following methods:

- **`tools/list`**: Returns array of available tools
- **`tools/call`**: Executes a tool with given arguments

The client automatically handles:

- Request/response formatting
- Error handling
- Both JSON and SSE response formats

## 🐛 Troubleshooting

### API Key Issues

**Error**: "API key is missing"

**Solution**:

- Ensure `.env.local` file exists in the root directory
- Check that API keys are correctly set (no extra spaces)
- Restart the development server after changing `.env.local`

### MCP Server Issues

**Symptom**: Tools not available or tool calls failing

**Solutions**:

- Check `MCP_SERVER_URL` in `.env.local`
- Verify network connectivity to MCP server
- Check browser console for MCP-related errors
- The app works without MCP tools (they're optional)

### TypeScript Errors

**Error**: Missing module types

**Solution**:

- Run `pnpm install` to ensure all dependencies are installed
- Run `pnpm type-check` to see detailed type errors
- Check that all imports are using correct paths

### Build Issues

**Error**: Build fails with module resolution errors

**Solution**:

- Delete `node_modules` and `pnpm-lock.yaml`
- Run `pnpm install` again
- Clear Next.js cache: `rm -rf .next`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [assistant-ui Documentation](https://assistant-ui.dev)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [assistant-ui](https://github.com/Yonom/assistant-ui) for the amazing UI framework
- [Vercel AI SDK](https://github.com/vercel/ai) for seamless LLM integration
- [Radix UI](https://www.radix-ui.com) for accessible UI primitives
