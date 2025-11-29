import { parseAsStringEnum, createSearchParamsCache } from "nuqs/server";
import type { ChatMode } from "@/stores/chat-mode-store";

/**
 * Search params schema for chat mode
 *
 * Purpose: Defines search params structure for nuqs
 * - Validates mode parameter (chatbot or llm)
 * - Defaults to "chatbot" if not provided
 * - Provides type-safe access to search params
 */
export const searchParamsCache = createSearchParamsCache({
  mode: parseAsStringEnum<ChatMode>(["chatbot", "llm"]).withDefault("chatbot"),
});
