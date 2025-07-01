'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Footer() {
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!consent) {
            setError('Please consent to receive news and updates');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('https://promptbook.studio/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(data.message || 'Failed to subscribe');
            }

            setSuccess(true);
            setEmail('');
            setConsent(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Product */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="/get-started" className="text-gray-400 hover:text-white transition-colors">
                                    Get started
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://ptbk.io/manifest"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Manifest
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/webgptorg/promptbook"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://promptbook.studio/miniapps/new"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Playground
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    AI Web, LLC
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://ptbk.io/about"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://ptbk.io/blog"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Connect</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://github.com/webgptorg/promptbook"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://linkedin.com/company/promptbook"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://discord.gg/x3QWNaa89N"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    More
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Stay Updated */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Email *</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                    required
                                />
                            </div>

                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="consent"
                                    checked={consent}
                                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                                    className="mt-0.5"
                                />
                                <label htmlFor="consent" className="text-sm text-gray-400 leading-relaxed">
                                    I consent to receive news and updates via email *
                                </label>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}
                            {success && <p className="text-sm text-green-500">Successfully subscribed!</p>}

                            <Button
                                type="submit"
                                disabled={!email || !consent || isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/promptbook-logo-blue-256.png"
                                    alt="Promptbook"
                                    className="h-8 w-8 filter brightness-0 invert"
                                />
                                <span className="text-xl font-bold text-white">Promptbook</span>
                            </div>
                            <p className="text-sm text-gray-400 text-center lg:text-left">
                                © 2025 Promptbook
                                <br />
                                All rights reserved.
                            </p>
                            <p className="text-xs text-gray-500 text-center lg:text-left leading-relaxed">
                                The AI orchestration framework for building intelligent applications
                            </p>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-4">
                            <img
                                src="https://www.ptbk.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FCI-Technology-Incubation.6cc58993.png&w=828&q=75"
                                alt="Technology Incubation logo"
                                className="h-24 w-auto"
                            />
                            <p className="text-xs text-gray-500 text-center lg:text-right leading-relaxed">
                                This project was implemented with funding from the national budget
                                <br />
                                via the Ministry of Industry and Trade of the Czech Republic within the CzechInvest
                                Technology Incubation programme.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
