import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { ChatContent } from "@/components/chat-content";

/**
 * Home page component
 *
 * Purpose: Server component that renders chat interface
 * - Mode is managed by nuqs in client components
 * - Navbar wrapped in Suspense for useSearchParams compatibility
 * - No need to parse search params here as nuqs handles it
 */
export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b bg-background/95" />}>
        <Navbar />
      </Suspense>
      <ChatContent />
    </div>
  );
}
