import { Navbar } from "@/components/navbar";
import { ChatContent } from "@/components/chat-content";

/**
 * Home page component
 *
 * Purpose: Server component that renders chat interface
 * - Mode is managed by nuqs in client components
 * - No need to parse search params here as nuqs handles it
 */
export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <ChatContent />
    </div>
  );
}
