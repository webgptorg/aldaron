import {
    AI_TA_KRAJTA_EDITORIAL_PRINCIPLES,
    AI_TA_KRAJTA_PARTNERSHIP_OFFERS,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMediaKitContent';
import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_SECTION_IDS,
    createAiTaKrajtaMediaKitCollaborationPath,
} from '@/businesses/ai-ta-krajta/config';
import { ArrowUpRight, Check } from 'lucide-react';
import Link from 'next/link';

/**
 * A compact entry point to the podcast media kit, where the detailed public offer and the one contact form live
 */
export function AiTaKrajtaCollaborationSection() {
    return (
        <section
            id={AI_TA_KRAJTA_SECTION_IDS.COLLABORATION}
            className="scroll-mt-28 border-t border-white/10 py-16 md:scroll-mt-20 sm:py-20"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9db1ff]">
                            Hosté, témata a spolupráce
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Pojďme do toho spolu
                        </h2>
                        <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
                            Máte hosta, téma, partnerství nebo nápad, který by neměl zapadnout? V media kitu najdete,
                            co hledáme, jak pracujeme a kam nám napsat.
                        </p>
                    </div>

                    <Link
                        href={AI_TA_KRAJTA_MEDIA_KIT_PATH}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.05]"
                    >
                        Otevřít media kit
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

                <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                    {AI_TA_KRAJTA_COLLABORATION_OPTIONS.map((option) => (
                        <li key={option.id}>
                            <Link
                                href={createAiTaKrajtaMediaKitCollaborationPath(option.id)}
                                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/30 hover:bg-white/[0.06]"
                            >
                                <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{option.description}</p>
                                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#b5c2ff]">
                                    Zjistit víc a napsat nám
                                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-10 overflow-hidden rounded-3xl border border-[#6b8cff]/25 bg-gradient-to-br from-[#6b8cff]/15 via-white/[0.04] to-[#ff6b6b]/10 p-6 sm:p-8">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b5c2ff]">
                                Partnerství s AI ta Krajta
                            </p>
                            <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                                Partnerství ano. Koupený názor ne.
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/65">
                                Nabízíme nativní, transparentní a redakčně nezávislé spolupráce pro firmy, které chtějí
                                oslovit české a slovenské publikum kolem AI.
                            </p>
                            <ul className="mt-5 grid gap-2">
                                {AI_TA_KRAJTA_EDITORIAL_PRINCIPLES.slice(0, 2).map((principle) => (
                                    <li key={principle} className="flex gap-2.5 text-sm leading-relaxed text-white/75">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b5c2ff]" />
                                        {principle}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <ul className="grid gap-3 sm:grid-cols-3">
                            {AI_TA_KRAJTA_PARTNERSHIP_OFFERS.map((offer) => (
                                <li key={offer.id} className="rounded-2xl border border-white/10 bg-[#1a201c]/40 p-5">
                                    <h4 className="text-sm font-semibold text-white">{offer.title}</h4>
                                    <p className="mt-2 text-sm font-medium text-[#ffb1a6]">{offer.priceLabel}</p>
                                    <Link
                                        href={createAiTaKrajtaMediaKitCollaborationPath(offer.collaborationKind)}
                                        className="mt-4 inline-flex items-center gap-1 text-sm text-white/65 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                                    >
                                        Detail nabídky
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
