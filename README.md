# Arobid Chat AI

AI Assistant application built with Next.js, assistant-ui, Vercel AI SDK, and MCP (Model Context Protocol). A modern, feature-rich chat interface that supports multiple LLM providers and dynamic tool integration.

## ✨ Features

- 🤖 **Multiple LLM Providers**: Support for Google Gemini and OpenAI
- 💬 **Dual Chat Modes**: Switch between Chatbot mode and LLM mode
- 🔄 **URL State Management**: Mode switching via search params using nuqs
- 💬 **Modern Chat UI**: Beautiful, customizable chat interface using assistant-ui
- 🔧 **MCP Tools Integration**: Dynamic tool loading from MCP servers via HTTP/SSE
- ⚡ **Streaming Responses**: Real-time streaming responses for better UX
- 🎨 **Beautiful UI**: Tailwind CSS v4 with Radix UI components
- 🔄 **Tool Calling**: Automatic tool execution when LLM requests
- 📝 **Markdown Support**: Rich markdown rendering with syntax highlighting
- 📊 **Logging System**: Custom logger with context, metadata, and adapter pattern (Sentry support)
- 🌐 **Type-safe**: Full TypeScript support with strict type checking

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **UI Library**: assistant-ui (@assistant-ui/react)
- **AI SDK**: Vercel AI SDK v5 (ai)
- **LLM Providers**:
  - Google Gemini (@ai-sdk/google) - Default: `gemini-2.5-flash`
  - OpenAI (@ai-sdk/openai) - Default: `gpt-4o-mini`
- **MCP Integration**: Model Context Protocol SDK (@modelcontextprotocol/sdk)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **URL State**: nuqs for type-safe search params management
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

# Required for MCP integration
MCP_SERVER_URL=https://your-mcp-server.com/mcp
AROBID_BACKEND_URL=https://your-backend-url.com

# Optional: Logger configuration
LOGGER_ENABLED=true

# Optional: Additional MCP headers
# MCP_HEADER_Authorization=Bearer token
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
├── app/                          # Next.js app directory
│   ├── api/
│   │   ├── chat/route.ts        # LLM chat API endpoint
│   │   └── chat-bot/route.ts     # Chatbot API endpoint
│   ├── layout.tsx                # Root layout with NuqsAdapter
│   └── page.tsx                 # Home page (server component)
├── components/                   # React components
│   ├── assistant-ui/            # Custom assistant-ui components
│   ├── chat-content.tsx         # Chat content client component
│   ├── navbar.tsx               # Navigation with mode switcher
│   └── ui/                      # Reusable UI components
├── hooks/                        # React hooks
│   └── use-chat-runtime.ts      # Chat runtime with mode switching
├── services/                      # Business logic services
│   └── chatbot.ts               # Chatbot service
├── stores/                       # State management
│   └── chat-mode-store.ts       # Chat mode store (Zustand)
└── lib/                          # Core libraries
    ├── assistant-runtime/       # LLM & chat runtime
    ├── fetch-client/            # Fetch client library (see README)
    ├── mcp-core/                # MCP client library (see README)
    ├── mcp-intergrations/       # MCP integration layer
    ├── loggers/                 # Logger library (see README)
    ├── streaming-response/      # Streaming response utilities (see README)
    ├── search-params.ts         # Search params schema (nuqs)
    └── utils.ts
```

## 🏗️ Architecture

### Overview

The application follows a modular architecture:

- **Frontend**: Next.js App Router with assistant-ui for chat interface
- **Backend**: API route (`/api/chat`) handles chat requests and streaming
- **LLM Integration**: Supports Gemini and OpenAI via Vercel AI SDK
- **MCP Tools**: Dynamic tool loading from MCP servers
- **Logging**: Custom logger with adapter pattern

### Core Libraries

- **[Fetch Client](src/lib/fetch-client/README.md)**: Reusable, type-safe fetch client with baseUrl support, streaming, comprehensive error handling, and configurable parser error handling.

- **[MCP Core](src/lib/mcp-core/README.md)**: Pure TypeScript library for managing MCP client connections, transport adapters (HTTP/SSE), and tools retrieval.

- **[Logger](src/lib/loggers/README.md)**: Custom logger with context, metadata, colors, debug filtering, and adapter pattern (Sentry, Grafana support).

- **[Streaming Response](src/lib/streaming-response/README.md)**: Utility library for converting text strings to Server-Sent Events (SSE) streaming responses compatible with assistant-ui format.

- **MCP Integrations**: Application-level integration layer that auto-initializes MCP clients from environment variables and provides convenience functions.

- **Assistant Runtime**: LLM provider configuration and chat handler that integrates LLM with MCP tools, supports frontend tools, and handles streaming responses.

## 💻 Usage

### Basic Usage

1. Open the app in your browser
2. Use the mode switcher in the navbar to choose between:
   - **Chatbot Mode**: Uses the chatbot API endpoint (`/api/chat-bot`)
   - **LLM Mode**: Uses the LLM API endpoint (`/api/chat`) with Gemini/OpenAI
3. Start chatting! The mode is persisted in the URL search params

### Chat Modes

- **Chatbot Mode** (`?mode=chatbot`): Direct chatbot integration, optimized for specific use cases
- **LLM Mode** (`?mode=llm`): Full LLM capabilities with tool calling support

The mode is managed via URL search params using `nuqs`, ensuring clean state management and shareable URLs.

### Switching LLM Providers

In LLM mode, the app defaults to **Gemini** (`gemini-2.5-flash`). You can switch providers programmatically by passing `modelProvider` in the request metadata.

### MCP Tools

MCP tools are automatically loaded when the app starts via `mcp-integrations`:

- Tools are fetched from all registered MCP servers
- Tools appear in the tool execution UI when LLM calls them
- Tool results are included in the conversation
- If MCP servers are unavailable, the app continues to work normally (graceful degradation)

### Force Tool Use

By default, the app forces the LLM to use at least one tool when tools are available. This can be disabled by setting `forceToolUse: false` in the request.

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

| Variable                       | Required | Description                     | Default |
| ------------------------------ | -------- | ------------------------------- | ------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes\*    | Google Gemini API key           | -       |
| `OPENAI_API_KEY`               | Yes\*    | OpenAI API key                  | -       |
| `MCP_SERVER_URL`               | Yes      | MCP server endpoint URL         | -       |
| `AROBID_BACKEND_URL`           | Yes      | Arobid backend URL for MCP      | -       |
| `LOGGER_ENABLED`               | No       | Enable/disable logger           | `true`  |
| `MCP_HEADER_*`                 | No       | Additional MCP headers (prefix) | -       |

\* At least one LLM provider API key is required.

## 📝 Configuration

### Default Models

- **Gemini**: `gemini-2.5-flash`
- **OpenAI**: `gpt-4o-mini`

You can override the model name by passing `modelName` in the request metadata.

### MCP Server

The MCP server should implement the Model Context Protocol. See [MCP Core README](src/lib/mcp-core/README.md) for details on HTTP/SSE transport support and client management.

### Logger Configuration

See [Logger README](src/lib/loggers/README.md) for configuration options, adapter setup, and usage examples.

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

- Check `MCP_SERVER_URL` and `AROBID_BACKEND_URL` in `.env.local`
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

## 📚 Documentation

- **Fetch Client Library**: [`src/lib/fetch-client/README.md`](src/lib/fetch-client/README.md)
- **MCP Core Library**: [`src/lib/mcp-core/README.md`](src/lib/mcp-core/README.md)
- **Logger Library**: [`src/lib/loggers/README.md`](src/lib/loggers/README.md)
- **Streaming Response Library**: [`src/lib/streaming-response/README.md`](src/lib/streaming-response/README.md)

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
