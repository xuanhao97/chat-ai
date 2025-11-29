"use client";

import { useMemo } from "react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useChatMode } from "@/stores/chat-mode-store";

/**
 * Custom hook for chat runtime with mode switching
 *
 * Purpose: Creates runtime based on current chat mode
 * - Returns chatbot runtime when mode is "chatbot"
 * - Returns LLM runtime when mode is "llm"
 * - Automatically switches API endpoint based on mode
 * - Recreates transport when mode changes to ensure clean state
 *
 * Note: The AssistantRuntimeProvider in page.tsx uses key={mode} to reset
 * the component tree when mode changes, ensuring clean state.
 *
 * @returns Chat runtime instance
 */
export function useChatRuntimeWithMode() {
  const { mode } = useChatMode();

  // Create transport based on current mode
  // Using mode as dependency ensures fresh transport on mode switch
  const transport = useMemo(() => {
    return new AssistantChatTransport({
      api: mode === "chatbot" ? "/api/chat-bot" : "/api/chat",
    });
  }, [mode]);

  // Create runtime with transport
  // The runtime will be recreated when transport changes (which happens on mode switch)
  const runtime = useChatRuntime({
    transport,
  });

  return runtime;
}
