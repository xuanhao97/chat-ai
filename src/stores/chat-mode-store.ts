import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Chat mode type
 */
export type ChatMode = "chatbot" | "llm";

/**
 * Chat mode store state
 */
interface ChatModeState {
  /**
   * Current chat mode
   */
  mode: ChatMode;
  /**
   * Set chat mode and navigate to appropriate route
   */
  setMode: (mode: ChatMode) => void;
}

/**
 * Global chat mode store instance
 *
 * Purpose: Global state management for chat mode with persistence
 * - Manages current mode (chatbot or LLM)
 * - Persists mode to localStorage
 * - Default mode: "chatbot"
 * - Can be used directly in components
 */
export const useChatModeStore = create<ChatModeState>()(
  persist(
    (set) => ({
      mode: "chatbot",
      setMode: (mode: ChatMode) => set({ mode }),
    }),
    {
      name: "chat-mode-storage",
      version: 1,
    }
  )
);

/**
 * Hook to access chat mode
 *
 * Purpose: Convenience hook for accessing chat mode
 * - Returns current mode and setter function
 * - Uses global store instance
 *
 * @returns Chat mode state and setter
 *
 * @example
 * ```ts
 * const { mode, setMode } = useChatMode();
 * setMode("llm");
 * ```
 */
export function useChatMode() {
  const mode = useChatModeStore((state) => state.mode);
  const setMode = useChatModeStore((state) => state.setMode);

  return { mode, setMode };
}
