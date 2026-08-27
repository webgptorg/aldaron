'use client';

import { ScrollToRegistrationSection } from '@/components/discounts/ScrollToRegistrationSection';
import { Header } from '@/components/header';
import { MinimalFooter } from '@/components/minimal-footer';
import { Button } from '@/components/ui/button';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    BookOpenCheck,
    Check,
    Code2,
    Crown,
    FolderGit2,
    LockKeyhole,
    MessageSquareText,
    ShieldCheck,
    Video,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
    getCommunityMembershipFeature,
    type CommunityMembershipFeatureId,
} from './communityMembershipConfig';
import { CommunityMembershipIllustration } from './CommunityMembershipIllustration';
import { CommunityMembershipRegistrationForm } from './CommunityMembershipRegistrationForm';
import { formatCommunityMembershipPrice } from './communityMembershipPrice';

type CommunityMembershipPageProps = {
    readonly initialFullname: string;
    readonly initialEmail: string;
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
};

type BenefitCard = {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
};

type MembershipOption = {
    readonly id: 'free' | 'paid';
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
    readonly price: string;
    readonly priceDetail: string;
    readonly featureIds: readonly CommunityMembershipFeatureId[];
    readonly isHighlighted: boolean;
};

const BENEFIT_CARDS: readonly BenefitCard[] = [
    {
        icon: Video,
        title: 'Záznamy všech webinářů',
        description: 'K novým záznamům i k archivu předchozích webinářů se vrátíte, kdy se vám to hodí.',
    },
    {
        icon: FolderGit2,
        title: 'Materiály do praxe',
        description: 'Praktické návody, repozitáře, checklisty a další obsah na jednom místě.',
    },
    {
        icon: MessageSquareText,
        title: 'Dotazy předem i během',
        description: 'Pošlete otázku před webinářem; během živého vysílání mají placení členové přednost.',
    },
    {
        icon: Code2,
        title: 'Discord pro členy',
        description: 'Přístup do Discordu a k funkcím komunity určeným pro placené členy.',
    },
];

const SPECIALIZED_WEBINARS = ['Git do hloubky', 'AI a databáze', 'Testování', 'Práce s kontextem'] as const;

const FREE_MEMBERSHIP_FEATURE_IDS = [
    'live-workshops',
    'community-materials',
    'member-discussion',
] as const satisfies readonly CommunityMembershipFeatureId[];

const PAID_MEMBERSHIP_FEATURE_IDS = [
    'workshop-recordings',
    'exclusive-content',
    'workshop-question-priority',
    'paid-discord',
] as const satisfies readonly CommunityMembershipFeatureId[];

const MEMBERSHIP_OPTIONS: readonly MembershipOption[] = [
    {
        id: 'free',
        icon: Code2,
        title: 'Free komunita',
        description: 'Pro účast na živých AI webinářích a základní přístup do komunity.',
        price: '0 Kč',
        priceDetail: 'bez platebních údajů',
        featureIds: FREE_MEMBERSHIP_FEATURE_IDS,
        isHighlighted: false,
    },
    {
        id: 'paid',
        icon: Crown,
        title: 'Placené členství',
        description: 'Pro záznamy, materiály a další obsah kolem bezplatných živých webinářů.',
        price: formatCommunityMembershipPrice(CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK),
        priceDetail: 'kdykoli zrušíte',
        featureIds: PAID_MEMBERSHIP_FEATURE_IDS,
        isHighlighted: true,
    },
];

function createCommunityRoomHref(fullname: string, email: string): string {
    const searchParameters = new URLSearchParams();
    if (fullname) {
        searchParameters.set('fullname', fullname);
    }
    if (email) {
        searchParameters.set('email', email);
    }

    const query = searchParameters.toString();
    return query ? `/cs/komunita?${query}` : '/cs/komunita';
}

function MembershipOptionCard({
    option,
    basicHref,
    onSelectPaidMembership,
}: {
    option: MembershipOption;
    basicHref: string;
    onSelectPaidMembership: () => void;
}) {
    return (
        <article
            className={cn(
                'relative flex h-full flex-col rounded-[2rem] border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7',
                option.isHighlighted ? 'border-cyan-400 ring-4 ring-cyan-100/70' : 'border-slate-200',
            )}
        >
            {option.isHighlighted && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <Check className="h-3.5 w-3.5 text-cyan-300" /> 199 Kč měsíčně
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-950">{option.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500">{option.description}</p>
                </div>
                <div
                    className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                        option.isHighlighted ? 'bg-slate-950 text-cyan-200' : 'bg-slate-100 text-slate-600',
                    )}
                >
                    <option.icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-950">{option.price}</span>
                    {option.id === 'paid' && <span className="text-sm text-slate-500">/ měsíc</span>}
                </div>
                <p className="mt-2 text-xs text-slate-500">{option.priceDetail}</p>
            </div>

            <div className="mt-6 flex-1 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {option.id === 'paid' ? 'Vše z Free a navíc' : 'Ve Free komunitě'}
                </p>
                <ul className="mt-4 space-y-3">
                    {option.featureIds.map((featureId) => (
                        <li key={featureId} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{getCommunityMembershipFeature(featureId).label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {option.id === 'free' ? (
                <Button asChild variant="outline" className="mt-7 h-11 rounded-full border-slate-300">
                    <Link href={basicHref}>Vstoupit zdarma</Link>
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={onSelectPaidMembership}
                    className="mt-7 h-11 rounded-full bg-slate-950 text-white hover:bg-slate-800"
                >
                    Stát se placeným členem <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </article>
    );
}

function SimpleMembershipComparison({
    basicHref,
    onSelectPaidMembership,
}: {
    basicHref: string;
    onSelectPaidMembership: () => void;
}) {
    return (
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
            {MEMBERSHIP_OPTIONS.map((option) => (
                <MembershipOptionCard
                    key={option.id}
                    option={option}
                    basicHref={basicHref}
                    onSelectPaidMembership={onSelectPaidMembership}
                />
            ))}
        </div>
    );
}

export function CommunityMembershipPage({
    initialFullname,
    initialEmail,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
}: CommunityMembershipPageProps) {
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode,
        initialActiveDiscountByPlaceId,
        discountPlaceId: COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    });
    const basicHref = useMemo(
        () => createCommunityRoomHref(initialFullname, initialEmail),
        [initialEmail, initialFullname],
    );
    const personalizedHeroTitle = initialFullname
        ? `${initialFullname}, živé AI webináře zůstávají zdarma.`
        : 'Živé AI webináře zůstávají zdarma.';
    const personalizedRegistrationTitle = initialFullname
        ? `${initialFullname}, placené členství za 199 Kč měsíčně.`
        : 'Placené členství za 199 Kč měsíčně.';

    const selectPaidMembership = () => {
        window.requestAnimationFrame(() => {
            document.getElementById(REGISTRATION_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <ScrollToRegistrationSection
                isScrollRequested={initialDiscountCode !== ''}
                registrationSectionId={REGISTRATION_SECTION_ID}
            />
            <Header
                language="cs"
                brandHref="/cs"
                brandContext={{ label: 'Komunita', href: '/cs/komunita' }}
                centerContent={
                    <>
                        <Video className="h-4 w-4 text-emerald-600" />
                        <span>Živé AI webináře zdarma</span>
                    </>
                }
                secondaryAction={{ label: 'Otevřít komunitu', href: basicHref }}
                primaryAction={{
                    label: 'Členství · 199 Kč',
                    mobileLabel: '199 Kč / měs.',
                    href: `#${REGISTRATION_SECTION_ID}`,
                }}
            />

            <section className="relative overflow-hidden bg-[#071923] pt-24 text-white sm:pt-28">
                <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    aria-hidden="true"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 12% 20%, rgba(54, 211, 238, 0.18), transparent 30%), radial-gradient(circle at 84% 25%, rgba(167, 139, 250, 0.16), transparent 27%), linear-gradient(rgba(122, 235, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(122, 235, 255, 0.035) 1px, transparent 1px)',
                        backgroundSize: 'auto, auto, 44px 44px, 44px 44px',
                    }}
                />
                <div className="container relative mx-auto grid items-center gap-14 px-4 pb-20 pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:pb-28 lg:pt-16">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                            <Video className="h-4 w-4" /> Živé AI webináře zdarma
                        </div>
                        <h1 className="mt-6 text-4xl font-bold leading-[1.07] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            {personalizedHeroTitle}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                            Za 199 Kč měsíčně získáte záznamy, materiály a další obsah, díky kterému se můžete k
                            tématům vracet a jít více do hloubky.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-13 rounded-full bg-cyan-300 px-7 text-base font-bold text-slate-950 hover:bg-cyan-200"
                            >
                                <Link href={`#${REGISTRATION_SECTION_ID}`}>
                                    Stát se členem za 199 Kč <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-13 rounded-full border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="#ceny">Porovnat Free a placené</Link>
                            </Button>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                            {[
                                'Živé webináře zdarma',
                                `${formatCommunityMembershipPrice(CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK)} / měsíc`,
                                'Kdykoli zrušíte',
                            ].map((item) => (
                                <span key={item} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-300" /> {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <CommunityMembershipIllustration />
                </div>
            </section>

            <section id="vyhody" className="bg-white py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Placené členství</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Obsah, který vám zůstane i po živém vysílání.
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Živý webinář si můžete pustit zdarma. Členství dává smysl ve chvíli, kdy se chcete k
                            tématu vracet, projít materiály nebo položit otázku s předstihem.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {BENEFIT_CARDS.map((benefit) => (
                            <article
                                key={benefit.title}
                                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200">
                                    <benefit.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-slate-950">{benefit.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
                <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                            <BookOpenCheck className="h-6 w-6" />
                        </div>
                        <h2 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
                            Záznamy i archiv na jednom místě
                        </h2>
                        <p className="mt-4 leading-relaxed text-slate-600">
                            Živé online webináře zůstávají zdarma. Placené členství zpřístupní jejich záznamy po
                            skončení i archiv předchozích témat.
                        </p>
                    </div>
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                            Témata, ke kterým se můžete vracet
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {SPECIALIZED_WEBINARS.map((webinar, index) => (
                                <div
                                    key={webinar}
                                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-mono text-xs font-bold text-cyan-200">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-semibold text-slate-800">{webinar}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="ceny" className="bg-white py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Jednoduchá volba</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Free komunita, nebo obsah navíc.
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Živé AI webináře jsou zdarma pro každého. Placené členství stojí 199 Kč měsíčně a můžete
                            ho kdykoli zrušit.
                        </p>
                    </div>
                    <SimpleMembershipComparison basicHref={basicHref} onSelectPaidMembership={selectPaidMembership} />
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#081c27] py-20 text-white sm:py-24">
                <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/20">
                            <BookOpenCheck className="h-6 w-6" />
                        </div>
                        <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-cyan-200">
                            Bez dlouhého závazku
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                            Připojte se živě. Vracejte se, kdy potřebujete.
                        </h2>
                        <p className="mt-4 max-w-xl leading-relaxed text-slate-300 sm:text-lg">
                            Za členství platíte po měsících. Je tu pro záznamy, materiály a dotazy navíc — ne proto,
                            abyste platili za samotné živé webináře.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { value: 'Zdarma', label: 'živé AI webináře' },
                            { value: '199 Kč', label: 'za měsíc' },
                            { value: 'Archiv', label: 'předchozích záznamů' },
                            { value: 'Předem', label: 'můžete poslat dotaz' },
                        ].map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                            >
                                <Check className="h-5 w-5 text-cyan-200" />
                                <p className="mt-4 text-xl font-bold">{metric.value}</p>
                                <p className="mt-1 text-sm text-slate-400">{metric.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id={REGISTRATION_SECTION_ID} className="scroll-mt-20 bg-white py-20 sm:py-24">
                <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(430px,1fr)] lg:items-start">
                    <div className="lg:sticky lg:top-28">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Aktivace</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            {personalizedRegistrationTitle}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Po odeslání vám pošleme potvrzení, platební údaje a další krok k aktivaci. Členství můžete
                            kdykoli zrušit.
                        </p>
                        <div className="mt-8 space-y-4">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: '199 Kč za měsíc',
                                    text: 'Platíte měsíčně, bez roční platby předem.',
                                },
                                {
                                    icon: LockKeyhole,
                                    title: 'Kdykoli zrušíte',
                                    text: 'Není potřeba zůstávat déle, než vám členství dává smysl.',
                                },
                                {
                                    icon: BookOpenCheck,
                                    title: 'Záznamy a materiály',
                                    text: 'Po aktivaci se k nim dostanete vedle živých webinářů zdarma.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-950">{item.title}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <CommunityMembershipRegistrationForm
                        initialFullname={initialFullname}
                        initialEmail={initialEmail}
                        discountCodeValidation={discountCodeValidation}
                    />
                </div>
            </section>

            <section className="border-t border-slate-200 bg-slate-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto flex max-w-4xl items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
                        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                        <div>
                            <h2 className="font-bold text-slate-950">Členství bez dlouhého závazku</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Placené členství stojí 199 Kč za měsíc. Kdykoli ho můžete zrušit e-mailem; skončí po
                                právě zaplaceném období. Podrobnosti najdete v obchodních podmínkách.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <MinimalFooter />
        </main>
    );
}
