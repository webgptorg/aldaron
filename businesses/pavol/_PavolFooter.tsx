'use client';

import type { PavolLink } from '@/businesses/pavol/pavolContent';
import { pavolContainerClassName } from '@/businesses/pavol/layout';
import { pavolPageContent } from '@/businesses/pavol/pavolContent';
import { Button } from '@/components/ui/button';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function FooterLinkColumn({ title, links }: { title: string; links: PavolLink[] }) {
    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{title}</h3>
            <ul className="mt-5 space-y-3">
                {links.map((link) => (
                    <li key={`${title}-${link.href}`}>
                        <Link
                            href={link.href}
                            className="inline-flex items-center gap-2 text-sm text-slate-200 transition-colors duration-200 hover:text-white"
                        >
                            {link.icon ? <link.icon className="h-4 w-4 shrink-0" /> : null}
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function PavolFooter({ language }: { language: SupportedHomepageLanguage }) {
    const content = pavolPageContent[language];

    return (
        <footer className="border-t border-[var(--pavol-ink)]/10 bg-[var(--pavol-ink)] text-white">
            <div className={`${pavolContainerClassName} py-16`}>
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,0.7fr))]">
                    <div className="max-w-md">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                                <Image
                                    src="/logo/pavol-hejny-ph.svg"
                                    alt="Pavol Hejný"
                                    width={36}
                                    height={36}
                                    className="h-9 w-9"
                                />
                            </div>

                            <div>
                                <p className="text-2xl font-semibold">Pavol Hejný</p>
                                <p className="mt-1 text-sm text-slate-300">{content.hero.eyebrow}</p>
                            </div>
                        </div>

                        <p className="mt-6 text-sm leading-7 text-slate-300">{content.footer.description}</p>

                        <Button
                            asChild
                            size="lg"
                            className="mt-8 rounded-full bg-white px-7 text-[var(--pavol-ink)] hover:bg-white/90"
                        >
                            <Link href="#contact">
                                {content.footer.primaryAction}
                                <Send className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <FooterLinkColumn title={content.footer.navigationTitle} links={content.header.navItems} />
                    <FooterLinkColumn title={content.footer.connectTitle} links={content.contact.links} />
                </div>

                <div className="mt-12 border-t border-white/10 pt-6">
                    <p className="text-sm text-slate-400">© Pavol Hejný. {content.footer.rightsReservedText}</p>
                </div>
            </div>
        </footer>
    );
}
