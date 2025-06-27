import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ChatbotScript from "./chatbot-script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "✨ YOUR AI Avatar",
  description: "Reclaim Your Time with AI That Thinks Like You",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatbotScript />
      </body>
    </html>
  );
}
