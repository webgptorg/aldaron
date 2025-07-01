'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/promptbook-logo-blue-256.png"
                            alt="Promptbook"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="text-xl text-gray-900">
                            Prompt<b>book</b>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="https://github.com/webgptorg/promptbook"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Documentation
                        </Link>
                        <Link
                            href="https://promptbook.studio/miniapps/new"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Playground
                        </Link>
                        <Link
                            href="https://ptbk.io/blog"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Blog
                        </Link>
                    </nav>

                    {/* CTA Button */}
                    <Button asChild className="bg-promptbook-blue hover:bg-promptbook-blue/90 text-white">
                        <Link href="https://promptbook.studio">
                            Get Started
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
