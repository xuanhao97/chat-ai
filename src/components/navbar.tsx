"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { parseAsStringEnum } from "nuqs";
import { Settings, LogOut, User } from "lucide-react";
import { useChatMode } from "@/stores/chat-mode-store";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ChatMode } from "@/stores/chat-mode-store";

/**
 * Navbar component
 *
 * Purpose: Navigation bar with mode switcher
 * - Displays current mode from search params using nuqs
 * - Allows switching between chatbot and LLM modes
 * - Updates searchParams when switching modes using nuqs
 * - Syncs mode with store for runtime access
 */
export function Navbar() {
  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringEnum<ChatMode>(["chatbot", "llm"]).withDefault("chatbot")
  );
  const { setMode: setStoreMode } = useChatMode();

  // Sync mode with store when it changes
  useEffect(() => {
    setStoreMode(mode);
  }, [mode, setStoreMode]);

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? "llm" : "chatbot";
    setMode(newMode);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex shrink-0 items-center min-w-0">
          <a
            href="https://arobid.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image
              src="/arobid-logo.png"
              alt="Arobid Logo"
              width={180}
              height={50}
              className="h-8 w-auto max-w-[140px] sm:max-w-[200px] object-contain"
              quality={100}
              priority
              unoptimized
            />
          </a>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <span
              className={cn(
                "text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                mode === "chatbot" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Chatbot
            </span>
            <Switch
              checked={mode === "llm"}
              onCheckedChange={handleModeChange}
              aria-label="Chuyển đổi giữa chế độ chatbot và LLM"
            />
            <span
              className={cn(
                "text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                mode === "llm" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              LLM
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="" alt="haopham" />
                  <AvatarFallback>
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">haopham</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    haopham.arobid@gmail.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
