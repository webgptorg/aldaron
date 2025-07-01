import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ChatbotScript from './chatbot-script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Make AI that Thinks Like You',
    description: 'Reclaim Your Time with AI That Thinks Like You ✨ Powered by Promptbook',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <ChatbotScript />
            </body>
        </html>
    );
}
