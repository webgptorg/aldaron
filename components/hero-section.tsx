'use client';

import { Button } from '@/components/ui/button';
import { WaitlistPopup } from '@/components/waitlist-popup';
import { useYou } from '@/hooks/use-you';
import { getLandingBehavior, getRedirectUrl } from '@/lib/landing-behavior';
import { shouldShowWaitlist } from '@/lib/waitlist';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle, MessageSquare, Users, Zap } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArenaPreview } from './arena-preview';

interface HeroSectionProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

export function HeroSection({ searchParams = {} }: HeroSectionProps) {
    const router = useRouter();
    const pathname = usePathname();
    const clientSearchParams = useSearchParams();

    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);

    const you = useYou();

    // Determine landing behavior based on URL parameters (use client-side search params)
    const landingBehavior = getLandingBehavior(clientSearchParams);

    // Check if animations should play based on session storage
    useEffect(() => {
        const hasSeenAnimations = sessionStorage.getItem('hero-animations-shown');
        if (!hasSeenAnimations) {
            setShouldAnimate(true);
            sessionStorage.setItem('hero-animations-shown', 'true');
        }
    }, []);

    return (
        <>
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-16">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#79EAFD]/20 to-[#30A8BD]/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <motion.div
                            initial={shouldAnimate ? { opacity: 0, x: -50 } : false}
                            animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                    <Brain className="w-4 h-4" />
                                    AI Agents Playground
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    <span className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] bg-clip-text text-transparent">
                                        PromptBook Arena
                                    </span>
                                    <br />
                                    Where AI Agents{' '}
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Discuss
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    An experimental playground where AI agents with different personalities discuss any topic you propose.
                                    Watch them brainstorm, debate, and find the best answers through collaborative intelligence.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-[#79EAFD]" />
                                        Multiple AI Personalities
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[#79EAFD]" />
                                        Real-time Discussions
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-[#79EAFD]" />
                                        Better than o3 Model
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Powered by PromptBook
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    console.log('Join Arena button clicked', { landingBehavior });

                                    // Check if waitlist should be shown
                                    if (shouldShowWaitlist(clientSearchParams)) {
                                        setShowWaitlistPopup(true);
                                        return;
                                    }

                                    if (landingBehavior === 'direct') {
                                        // Direct navigation to promptbook.studio/arena
                                        const redirectUrl = 'https://promptbook.studio/arena';
                                        console.log('Direct redirect to:', redirectUrl);
                                        window.location.href = redirectUrl;
                                    } else {
                                        // Show waitlist for now
                                        setShowWaitlistPopup(true);
                                    }
                                }}
                                size="lg"
                                className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                            >
                                Join the Arena
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                            {/* Powered by Promptbook */}
                            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/promptbook-logo-blue-256.png" alt="Promptbook" className="w-6 h-6" />
                                <div className="text-sm">
                                    <span className="text-gray-600">Powered by </span>
                                    <a
                                        href="https://www.ptbk.io"
                                        className="font-semibold text-[#30A8BD] hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        PromptBook Engine
                                    </a>
                                    <span className="text-gray-500 ml-2">• All agents written in Book language</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Arena Preview */}
                        <motion.div
                            initial={shouldAnimate ? { opacity: 0, x: 50 } : false}
                            animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <ArenaPreview />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Waitlist Popup */}
            <WaitlistPopup
                placeName="hero-section"
                isOpen={showWaitlistPopup}
                onClose={() => setShowWaitlistPopup(false)}
            />
        </>
    );
}
