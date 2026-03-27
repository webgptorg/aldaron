'use client';

import { useYou } from '@/hooks/useYou';
import { Conversation } from '@/lib/conversations-data';
import { motion } from 'framer-motion';
import { JSX } from 'react';
import { MockedChatSection } from './mocked-chat-section';

type HeroSectionProps = {
    backgroundImage?: string | null;

    /**
     * Function to customize the heading text.
     */
    getHero: (params: { you: string | null }) => JSX.Element;

    conversation: Conversation;
};

export function HeroSection(props: HeroSectionProps) {
    const { backgroundImage = `/backgrounds/generic.svg`, getHero, conversation } = props;

    const you = useYou();

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
            style={backgroundImage ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: '50% 100%',
            } : undefined}
        >
            {/* Background Elements */}
            {/*
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-purple rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-green rounded-full blur-3xl opacity-10"></div>
                </div>
                */}

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8 lg:col-span-1"
                    >
                        {getHero({ you })}
                    </motion.div>

                    {/* Right Column - Book Example */}
                    <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <MockedChatSection conversation={conversation} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
