"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntimeWithMode } from "@/hooks/use-chat-runtime";

/**
 * ChatContent component
 *
 * Purpose: Client component for chat interface
 * - Creates runtime based on current mode
 * - Provides runtime to assistant-ui components
 */
export function ChatContent() {
  const runtime = useChatRuntimeWithMode();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
