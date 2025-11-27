# Hướng dẫn cài đặt

## Bước 1: Cài đặt dependencies

Chạy lệnh sau để cài đặt tất cả dependencies:

```bash
npm install
```

Lệnh này sẽ cài đặt:

- Next.js và React
- assistant-ui packages
- Vercel AI SDK và providers (Google, OpenAI)
- Các dependencies phụ trợ (Radix UI, Tailwind CSS, etc.)

## Bước 2: Cấu hình environment variables

1. Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

2. Điền các API keys vào `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_GOOGLE_GENERATIVE_AI_API_KEY_here
OPENAI_API_KEY=your_openai_api_key_here
MCP_SERVER_URL=https://hao-mcp.vercel.app/mcp
```

**Lưu ý:**

- Lấy Gemini API key từ [Google AI Studio](https://makersuite.google.com/app/apikey)
- Lấy OpenAI API key từ [OpenAI Platform](https://platform.openai.com/api-keys)
- `MCP_SERVER_URL` đã có giá trị mặc định, chỉ cần thay đổi nếu dùng server khác

## Bước 3: Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

## Troubleshooting

### Lỗi TypeScript về missing modules

Nếu thấy lỗi TypeScript về các module như `@ai-sdk/google`, `ai`, etc., đảm bảo đã chạy `npm install` và các packages đã được cài đặt đúng.

### Lỗi về API keys

Đảm bảo:

- File `.env.local` tồn tại (không commit file này vào git)
- Các API keys đã được điền đúng
- Không có khoảng trắng thừa trong file `.env.local`

### Lỗi về MCP server

Nếu MCP server không hoạt động:

- Kiểm tra `MCP_SERVER_URL` trong `.env.local`
- Kiểm tra network connection
- App vẫn chạy được nếu MCP server lỗi (sẽ không có tools)
