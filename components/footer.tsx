'use client';

import { subscribeToNewsletter } from '@/app/subscription/subscribeToNewsletter';
import { subscribeToWaitlist } from '@/app/subscription/subscribeToWaitlist';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import technologyIncubationSponsor from '@/public/sponsors/CI-Technology-Incubation.png';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
const promptbookLogo = '/logo/promptbook-logo-blue-transparent-256.png'; // <- TODO: import promptbookLogo from '@/public/logo/promptbook-logo-blue-transparent-256.png';

interface FooterProps {
    productHeader?: string;
    productLinks?: { href: string; text: string }[];
    companyHeader?: string;
    companyLinks?: { href: string; text: string }[];
    connectHeader?: string;
    connectLinks?: { href: string; text: string }[];
    stayUpdatedHeader?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    consentLabel?: string;
    consentErrorMessage?: string;
    subscribeButtonText?: string;
    subscribingButtonText?: string;
    successMessage?: string;
    genericErrorMessage?: string;
    rightsReservedText?: string;
    projectFundingText?: React.ReactNode;
}

export function Footer({
    productHeader = 'Product',
    productLinks = [
        { href: '?modal=get-started', text: 'Get started' },
        { href: 'https://ptbk.io/manifest', text: 'Manifest' },
        { href: 'https://github.com/webgptorg/promptbook', text: 'Documentation' },
        { href: 'https://promptbook.studio/miniapps/new', text: 'Playground' },
    ],
    companyHeader = 'Company',
    companyLinks = [
        {
            href: 'https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp',
            text: 'AI Web s.r.o.',
        },
        { href: 'https://ptbk.io/about', text: 'About Us' },
        { href: 'https://ptbk.io/blog', text: 'Blog' },
    ],
    connectHeader = 'Connect',
    connectLinks = [
        { href: 'https://github.com/webgptorg/promptbook', text: 'GitHub' },
        { href: 'https://linkedin.com/company/promptbook', text: 'LinkedIn' },
        { href: 'https://discord.gg/x3QWNaa89N', text: 'Discord' },
        { href: '/contact', text: 'More' },
    ],
    stayUpdatedHeader = 'Stay Updated',
    emailLabel = 'Email *',
    emailPlaceholder = 'you@example.com',
    consentLabel = 'I consent to receive news and updates via email *',
    consentErrorMessage = 'Please consent to receive news and updates',
    subscribeButtonText = 'Subscribe',
    subscribingButtonText = 'Subscribing...',
    successMessage = 'Successfully subscribed!',
    genericErrorMessage = 'An error occurred',
    rightsReservedText = 'All rights reserved.',
    projectFundingText = (
        <>
            This project was implemented with funding from the national budget
            <br />
            via the Ministry of Industry and Trade of the Czech Republic within the CzechInvest Technology Incubation
            programme.
        </>
    ),
}: FooterProps) {
    const claim = 'Create AI that truly understands your business.';
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!consent) {
            setError(consentErrorMessage);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await Promise.all([subscribeToNewsletter(email), subscribeToWaitlist(email, 'newsletter-footer')]);

            setSuccess(true);
            setEmail('');
            setConsent(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : genericErrorMessage);
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
                        <h3 className="text-lg font-semibold mb-6">{productHeader}</h3>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{companyHeader}</h3>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{connectHeader}</h3>
                        <ul className="space-y-3">
                            {connectLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Stay Updated */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{stayUpdatedHeader}</h3>
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">{emailLabel}</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={emailPlaceholder}
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
                                    {consentLabel}
                                </label>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}
                            {success && <p className="text-sm text-green-500">{successMessage}</p>}

                            <Button
                                type="submit"
                                disabled={!email || !consent || isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90"
                            >
                                {isSubmitting ? subscribingButtonText : subscribeButtonText}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <div className="flex items-center gap-3">
                                <Image
                                    src={promptbookLogo}
                                    alt="Promptbook"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 filter brightness-0 invert"
                                />
                                <span className="text-xl font-bold text-white">Promptbook</span>
                            </div>
                            <p className="text-sm text-gray-400 text-center lg:text-left">
                                © 2025 Promptbook
                                <br />
                                {rightsReservedText}
                            </p>
                            <p className="text-xs text-gray-500 text-center lg:text-left leading-relaxed">
                                {claim} <i style={{ visibility: 'hidden' }}>11:11</i>
                            </p>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-4">
                            <Image src={technologyIncubationSponsor} alt="Our Sponsor" className="h-32 w-auto" />
                            <p className="text-xs text-gray-500 text-center lg:text-right leading-relaxed">
                                {projectFundingText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
