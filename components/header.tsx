'use client';

import { Button } from '@/components/ui/button';
import promptbookLogoBlueTransparent from '@/public/logo/logo-blue-transparent-256.png';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
};

export function Header(props: HeaderProps) {
    const {
        isBare = false,
        tryItYourselfText = null, // 'Try it Yourself!',
        whyPromptbookText = 'Why Promptbook?',
        integrationsText = 'Integrations',
        pricingText = 'Pricing',
        getStartedText = 'Get Started',
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
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src={promptbookLogoBlueTransparent}
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
                        <Link href="?modal=get-started">
                            <Button className="bg-promptbook-blue-dark text-white hover:bg-promptbook-blue-dark/90">
                                {getStartedText}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
