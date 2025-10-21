'use client';

import { Button } from '@/components/ui/button';
import { useYou } from '@/hooks/use-you';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
    const you = useYou();

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-16">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-purple rounded-full blur-3xl opacity-10"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-green rounded-full blur-3xl opacity-10"></div>
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                <BookOpen className="w-4 h-4" />
                                AI Transformation for Your Business
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Create AI that{' '}
                                <span className="bg-gradient-promptbook-dark bg-clip-text text-transparent">
                                    Truly&nbsp;Understand
                                </span>{' '}
                                {you || <>Your Company</>}
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                With Promptbook, you can capture your company's context, rules, and knowledge into
                                simple <b>Books</b> to build AI agents that align perfectly with your business needs.
                            </p>
                        </div>

                        <br />

                        <Link href="/get-started" passHref>
                            <Button
                                size="lg"
                                className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                            >
                                Get Started {you ? <>with AI in {you}</> : <>with Promptbook AI</>}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>

                        <div className="flex items-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Open Source
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Your Data, Your Control
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Easy Setup
                            </div>
                        </div>

                        {/* Powered by Promptbook */}
                        <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/promptbook-logo-blue-256.png" alt="Promptbook" className="w-6 h-6" />
                            <div className="text-sm">
                                <span className="text-gray-600">Powered by </span>
                                <a
                                    href="https://www.ptbk.io"
                                    className="font-semibold text-promptbook-blue hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Promptbook
                                </a>
                                <span className="text-gray-500 ml-2">• Truly Your AI{you && <>, {you}</>}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Book Example */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 text-white font-mono text-sm">
                            <pre>
                                <code>
                                    <span className="text-purple-400">Paul Smith & Associés</span>
                                    {`\n\n`}
                                    <span className="text-pink-400">PERSONA</span> You are a company lawyer.
                                    {`\n`}
                                    Your job is to provide legal advice and support to the company and its employees.
                                    {`\n\n`}
                                    <span className="text-pink-400">RULE</span> Always ensure compliance with laws and
                                    regulations.
                                    {`\n`}
                                    <span className="text-pink-400">RULE</span> Never provide legal advice outside your
                                    area of expertise.
                                    {`\n\n`}
                                    <span className="text-pink-400">KNOWLEDGE</span>{' '}
                                    https://company.com/company-policies.pdf
                                </code>
                            </pre>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
