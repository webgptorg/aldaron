'use client';

import {
    AI_TA_KRAJTA_MESSAGE_FIELD_ID,
    AiTaKrajtaCollaborationForm,
} from '@/businesses/ai-ta-krajta/AiTaKrajtaCollaborationForm';
import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { formatAiTaKrajtaPrice } from '@/businesses/ai-ta-krajta/aiTaKrajtaFormatting';
import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_SECTION_IDS,
    AI_TA_KRAJTA_SPONSORSHIP_PACKAGES,
    type AiTaKrajtaCollaborationKind,
} from '@/businesses/ai-ta-krajta/config';
import { cn } from '@/lib/utils';
import { Check, Linkedin } from 'lucide-react';

/**
 * What a package costs, or the promise to say it, until the price is written into the configuration
 */
function AiTaKrajtaPackagePrice({ priceInCzechCrowns }: { readonly priceInCzechCrowns: number | null }) {
    if (priceInCzechCrowns === null) {
        return <p className="mt-1 text-sm text-white/45">Cenu pošleme v první odpovědi.</p>;
    }

    return (
        <p className="mt-1 text-2xl font-bold text-white">
            {formatAiTaKrajtaPrice(priceInCzechCrowns)}
            <span className="ml-1.5 text-sm font-normal text-white/45">bez DPH</span>
        </p>
    );
}

/**
 * How to work with the show, what a partner gets for their money, and the one form which reaches the editors
 */
export function AiTaKrajtaCollaborationSection() {
    const { viewState, setCollaborationKind } = useAiTaKrajtaPageState();

    const handleOptionClick = (collaborationKind: AiTaKrajtaCollaborationKind) => {
        setCollaborationKind(collaborationKind);
        document.getElementById(AI_TA_KRAJTA_MESSAGE_FIELD_ID)?.focus({ preventScroll: false });
    };

    return (
        <section
            id={AI_TA_KRAJTA_SECTION_IDS.COLLABORATION}
            className="scroll-mt-28 md:scroll-mt-20 border-t border-white/10 py-16 sm:py-20"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Pojďme do toho spolu</h2>
                <p className="mt-3 max-w-2xl text-white/60">
                    Témata i hosty sháníme průběžně a většina dobrých dílů vznikla z toho, že nám někdo napsal.
                    Vyberte, o co jde, a napište to rovnou dolů. Čte to člověk, ne robot.
                </p>

                <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                    {AI_TA_KRAJTA_COLLABORATION_OPTIONS.map((option) => {
                        const isChosen = viewState.collaborationKind === option.id;

                        return (
                            <li key={option.id}>
                                <button
                                    type="button"
                                    onClick={() => handleOptionClick(option.id)}
                                    aria-pressed={isChosen}
                                    className={cn(
                                        'h-full w-full rounded-2xl border p-6 text-left transition-colors',
                                        isChosen
                                            ? 'border-[#ff6b6b]/60 bg-[#ff6b6b]/[0.08]'
                                            : 'border-white/10 bg-white/[0.03] hover:border-white/25',
                                    )}
                                >
                                    <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-white/60">{option.description}</p>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Co si u nás firma může koupit</h3>
                        <p className="mt-2 text-sm text-white/50">
                            Žádné balíčky na tři schůzky. Tady je, co dostanete.
                        </p>

                        <ul className="mt-6 grid gap-4">
                            {AI_TA_KRAJTA_SPONSORSHIP_PACKAGES.map((sponsorshipPackage) => (
                                <li
                                    key={sponsorshipPackage.id}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                                >
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                        <h4 className="text-base font-semibold text-white">
                                            {sponsorshipPackage.title}
                                        </h4>
                                        <AiTaKrajtaPackagePrice
                                            priceInCzechCrowns={sponsorshipPackage.priceInCzechCrowns}
                                        />
                                    </div>

                                    <ul className="mt-4 grid gap-2">
                                        {sponsorshipPackage.deliverables.map((deliverable) => (
                                            <li
                                                key={deliverable}
                                                className="flex gap-2.5 text-sm leading-relaxed text-white/65"
                                            >
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8fa4ff]" />
                                                {deliverable}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-6 text-sm leading-relaxed text-white/45">
                            Radši napíšete na sítě? Jsme na{' '}
                            <a
                                href={AI_TA_KRAJTA_LINKEDIN_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-white/70 underline underline-offset-4 transition-colors hover:text-white"
                            >
                                <Linkedin className="h-3.5 w-3.5" />
                                LinkedInu
                            </a>{' '}
                            a čteme si tam zprávy.
                        </p>
                    </div>

                    <AiTaKrajtaCollaborationForm />
                </div>
            </div>
        </section>
    );
}
