'use client';

import { Button } from '@/components/ui/button';
import promptbookLogoBlueTransparent from '@/public/logo/logo-blue-transparent-256.png';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

type HeaderProps = {
    /**
     * Is bare header without navigation and CTA button
     */
    isBare?: boolean;
    tryItYourselfText?: string | null;
    whyPromptbookText?: string;
    integrationsText?: string;
    pricingText?: string;
    getStartedText?: string;
    /**
     * Override the default Promptbook logo with a custom element (e.g. for sub-brands like Hackathon Factory)
     */
    brandLogo?: ReactNode;
    /**
     * Override the default "Promptbook" brand name shown next to the logo
     */
    brandName?: ReactNode;
};

export function Header(props: HeaderProps) {
    const {
        isBare = false,
        tryItYourselfText = null, // 'Try it Yourself!',
        whyPromptbookText = 'Why Promptbook?',
        integrationsText = 'Integrations',
        pricingText = 'Pricing',
        getStartedText = 'Get Started',
        brandLogo,
        brandName,
    } = props;

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex h-16 min-w-0 items-center justify-between gap-3">
                    {/* Logo */}
                    <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3">
                        {brandLogo ?? (
                            <Image
                                src={promptbookLogoBlueTransparent}
                                alt="Promptbook"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                        )}
                        <span className="max-w-[9rem] truncate text-base text-gray-900 sm:max-w-none sm:text-xl">
                            {brandName ?? (
                                <>
                                    Prompt<b>book</b>
                                </>
                            )}
                        </span>
                    </Link>

                    {/* Navigation */}
                    {!isBare && (
                        <nav className="hidden md:flex items-center gap-8">
                            {tryItYourselfText && (
                                <button
                                    onClick={() => scrollToSection('try-it-yourself')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                >
                                    {tryItYourselfText}
                                </button>
                            )}
                            <button
                                onClick={() => scrollToSection('benefits')}
                                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                {whyPromptbookText}
                            </button>
                            <button
                                onClick={() => scrollToSection('integrations')}
                                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                {integrationsText}
                            </button>
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                {pricingText}
                            </button>
                        </nav>
                    )}

                    {/* CTA Button */}
                    {!isBare && (
                        <Link href="?modal=get-started" className="shrink-0">
                            <Button className="max-w-[11rem] gap-1 bg-promptbook-blue-dark px-3 text-xs text-white hover:bg-promptbook-blue-dark/90 sm:max-w-none sm:px-4 sm:text-sm">
                                <span className="truncate">{getStartedText}</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
