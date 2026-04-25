'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
const promptbookLogo = '/logo/promptbook-logo-blue-transparent-128.png'; // <- TODO: import promptbookLogo from '@/public/logo/promptbook-logo-blue-transparent-128.png';

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCTAClick = () => {
        // Dispatch custom event to open qualification popup
        window.dispatchEvent(new CustomEvent('open-qualification-popup'));
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
                    : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
                        <Image src={promptbookLogo} alt="Promptbook" width={32} height={32} className="w-8 h-8" />
                        <span className="text-xl text-gray-900">
                            Prompt<b>book</b>
                        </span>
                    </Link>

                    {/* FOMO text — centered, hidden on small screens */}
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                        <span>🔥</span>
                        <span>
                            Zbývá <strong className="text-gray-900">7 míst z 10</strong> pro strategický hovor zdarma
                        </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                        onClick={handleCTAClick}
                        className="bg-promptbook-blue-dark text-white hover:bg-promptbook-blue-dark/90 hover:shadow-lg transition-all duration-300 shrink-0 text-[13px] sm:text-sm px-3 sm:px-4"
                        id="header-cta"
                    >
                        <span className="sm:hidden">Chci hovor zdarma</span>
                        <span className="hidden sm:inline">Zarezervovat hovor zdarma</span>
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
