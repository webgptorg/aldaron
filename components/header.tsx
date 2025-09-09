'use client';

import { Button } from '@/components/ui/button';
import { WaitlistPopup } from '@/components/waitlist-popup';
import { getLandingBehavior, getRedirectUrl } from '@/lib/landing-behavior';
import { shouldShowWaitlist } from '@/lib/waitlist';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function Header() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);

    // Determine landing behavior based on URL parameters
    const landingBehavior = getLandingBehavior(searchParams);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleGetStartedClick = () => {
        // Check if waitlist should be shown
        if (shouldShowWaitlist(searchParams)) {
            setShowWaitlistPopup(true);
            return;
        }

        if (landingBehavior === 'direct') {
            // Direct navigation to promptbook.studio/from-social-links
            const redirectUrl = getRedirectUrl('direct');
            window.location.href = redirectUrl;
        } else {
            // Show popup for platform selection
            router.push('/get-started');
        }
    };
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
                        <button
                            onClick={() => scrollToSection('benefits')}
                            className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            Why Our AI?
                        </button>
                        <button
                            onClick={() => scrollToSection('integrations')}
                            className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            Integration
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            Pricing
                        </button>
                    </nav>

                    {/* CTA Button */}
                    <Button
                        onClick={handleGetStartedClick}
                        className="bg-promptbook-blue-dark text-white hover:bg-promptbook-blue-dark/90"
                    >
                        Get Started
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Waitlist Popup */}
            <WaitlistPopup placeName="header" isOpen={showWaitlistPopup} onClose={() => setShowWaitlistPopup(false)} />
        </header>
    );
}
