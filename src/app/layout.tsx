import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arobid Chat AI",
  description: "AI Assistant with Arobid support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-dvh">{children}</body>
    </html>
  );
}
