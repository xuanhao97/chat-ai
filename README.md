# Arobid Chat AI

AI Assistant application built with Next.js, assistant-ui, Vercel AI SDK, and MCP (Model Context Protocol).

## Features

- 🤖 Support for multiple LLM providers (Gemini, OpenAI)
- 💬 Modern chat UI using assistant-ui
- 🔧 MCP tools integration
- ⚡ Streaming responses
- 🎨 Beautiful UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: assistant-ui (@assistant-ui/react)
- **AI SDK**: Vercel AI SDK (ai)
- **LLM Providers**:
  - Google Gemini (@ai-sdk/google)
  - OpenAI (@ai-sdk/openai)
- **MCP**: Model Context Protocol integration
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_GOOGLE_GENERATIVE_AI_API_KEY_here
OPENAI_API_KEY=your_openai_api_key_here
MCP_SERVER_URL=https://hao-mcp.vercel.app/mcp
```

**Where to get API keys:**

- Gemini: [Google AI Studio](https://makersuite.google.com/app/apikey)
- OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys)

3. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   └── assistant/
│       └── MyAssistant.tsx       # Main chat component
└── lib/
    └── assistant-runtime/
        ├── llm.ts                # LLM provider configuration
        ├── mcp-client.ts         # MCP server client
        ├── mcp-tools.ts          # MCP tools adapter
        └── runtime.ts            # Chat handler
```

## Usage

1. Select your preferred LLM provider (Gemini or OpenAI) from the dropdown
2. Start chatting! The assistant will use the selected provider
3. MCP tools are automatically loaded and available if the MCP server is accessible

## Development

### Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Lint

```bash
pnpm lint
```

## Notes

- The app defaults to Gemini (`gemini-1.5-flash`) if no provider is specified
- MCP tools are loaded dynamically from the configured MCP server
- If the MCP server is unavailable, the app will continue to work without tools
- See code comments for TODOs and areas that may need adjustment based on actual API specs

## License

MIT
