import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import {
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_PLATFORM_LINKS,
} from '@/businesses/ai-ta-krajta/config';
import { LegalFooterLinks } from '@/components/legal/LegalFooterLinks';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import Link from 'next/link';

const FOOTER_LINK_CLASS_NAME = 'text-sm text-white/60 transition-colors hover:text-white';

/**
 * Legal footer for the podcast. It deliberately keeps only the podcast's own paths and profiles instead of inheriting
 * a product newsletter which would be confusing here.
 */
export function AiTaKrajtaFooter() {
    return (
        <footer className="border-t border-white/10 bg-[#171d1a] text-white">
            <div className="container mx-auto px-4 py-12 sm:py-14">
                <div className="grid gap-10 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.75fr)]">
                    <div className="max-w-md">
                        <Link href={AI_TA_KRAJTA_PATH} className="inline-flex items-center gap-3 transition-opacity hover:opacity-85">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8f7f1] p-1.5">
                                <AiTaKrajtaMark className="h-full w-full" />
                            </span>
                            <span className="text-xl font-semibold">{AI_TA_KRAJTA_NAME}</span>
                        </Link>
                        <p className="mt-5 text-sm leading-relaxed text-white/60">
                            Český video podcast, ve kterém se AI neuctívá. Probírá se.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">Poslouchat</h2>
                        <ul className="mt-4 space-y-3">
                            {AI_TA_KRAJTA_PLATFORM_LINKS.map((platform) => (
                                <li key={platform.id}>
                                    <a href={platform.href} target="_blank" rel="noreferrer" className={FOOTER_LINK_CLASS_NAME}>
                                        {platform.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">Ozvěte se</h2>
                        <a
                            href={AI_TA_KRAJTA_LINKEDIN_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                        >
                            <Linkedin className="h-4 w-4" />
                            AI ta Krajta na LinkedInu
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        <Link href="#spoluprace" className="mt-3 block text-sm text-white/60 transition-colors hover:text-white">
                            Navrhnout téma nebo spolupráci
                        </Link>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 AI ta Krajta. Provozuje AI Web s.r.o.</p>
                    <LegalFooterLinks language="cs" className="gap-x-5" linkClassName="text-white/55 hover:text-white" />
                </div>
            </div>
        </footer>
    );
}
