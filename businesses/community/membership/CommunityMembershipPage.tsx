'use client';

import { MinimalFooter } from '@/components/minimal-footer';
import { Header } from '@/components/header';
import { ScrollToRegistrationSection } from '@/components/discounts/ScrollToRegistrationSection';
import { Button } from '@/components/ui/button';
import type { ActiveDiscount, ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    BookOpenCheck,
    Check,
    CircleGauge,
    Code2,
    Crown,
    FolderGit2,
    Infinity as InfinityIcon,
    LockKeyhole,
    MessageSquareText,
    Minus,
    Radio,
    Rss,
    ShieldCheck,
    Sparkles,
    UsersRound,
    Video,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CommunityMembershipBillingToggle } from './CommunityMembershipBillingToggle';
import {
    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    COMMUNITY_MEMBERSHIP_FEATURES,
    COMMUNITY_MEMBERSHIP_PLANS,
    COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT,
    COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT,
    getCommunityMembershipFeature,
    getCommunityMembershipFeatureIds,
    getCommunityMembershipPlan,
    isPaidCommunityMembershipPlanId,
    type CommunityMembershipBillingPeriod,
    type CommunityMembershipPlan,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';
import { CommunityMembershipIllustration } from './CommunityMembershipIllustration';
import { CommunityMembershipPriceDisplay } from './CommunityMembershipPriceDisplay';
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

const BENEFIT_CARDS: readonly BenefitCard[] = [
    {
        icon: Video,
        title: 'Záznamy, které nezmizí',
        description: 'Vraťte se ke každému workshopu ve chvíli, kdy řešíte konkrétní problém v projektu.',
    },
    {
        icon: FolderGit2,
        title: 'Materiály rovnou do práce',
        description: 'Repozitáře, checklisty, návody a RSS bez hledání ve starých chatech a e-mailech.',
    },
    {
        icon: MessageSquareText,
        title: 'Lidé se stejnými problémy',
        description: 'Vývojáři, tvůrci a majitelé malých firem, kteří AI opravdu zavádějí do praxe.',
    },
];

const SPECIALIZED_WORKSHOPS = ['Git do hloubky', 'AI a databáze', 'Testování', 'Práce s kontextem'] as const;

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

function PricingPlanCard({
    plan,
    billingPeriod,
    activeDiscount,
    basicHref,
    onSelectPaidPlan,
}: {
    plan: CommunityMembershipPlan;
    billingPeriod: CommunityMembershipBillingPeriod;
    activeDiscount: ActiveDiscount | null;
    basicHref: string;
    onSelectPaidPlan: (planId: PaidCommunityMembershipPlanId) => void;
}) {
    const paidPlanId = isPaidCommunityMembershipPlanId(plan.id) ? plan.id : null;
    const isBasic = paidPlanId === null;
    const isPremium = plan.id === 'premium';
    const previousPlanName = plan.id === 'standard' ? 'Basic' : plan.id === 'premium' ? 'Standard' : null;

    return (
        <article
            className={cn(
                'relative flex h-full flex-col rounded-[2rem] border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7',
                isPremium ? 'border-cyan-400 ring-4 ring-cyan-100/70' : 'border-slate-200',
            )}
        >
            {isPremium && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Doporučeno
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-950">{plan.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500">{plan.description}</p>
                </div>
                <div
                    className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                        isPremium ? 'bg-slate-950 text-cyan-200' : 'bg-slate-100 text-slate-600',
                    )}
                >
                    {isBasic ? (
                        <Code2 className="h-5 w-5" />
                    ) : isPremium ? (
                        <Crown className="h-5 w-5" />
                    ) : (
                        <Radio className="h-5 w-5" />
                    )}
                </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
                {paidPlanId === null ? (
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold tracking-tight text-slate-950">0 Kč</span>
                            <span className="text-sm text-slate-500">/ měsíc</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Bez platebních údajů.</p>
                    </div>
                ) : (
                    <CommunityMembershipPriceDisplay
                        planId={paidPlanId}
                        billingPeriod={billingPeriod}
                        activeDiscount={activeDiscount}
                    />
                )}
            </div>

            <div className="mt-6 flex-1 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {previousPlanName ? `Vše z ${previousPlanName} a navíc` : 'V plánu'}
                </p>
                <ul className="mt-4 space-y-3">
                    {plan.addedFeatureIds.map((featureId) => (
                        <li key={featureId} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{getCommunityMembershipFeature(featureId).label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {paidPlanId === null ? (
                <Button asChild variant="outline" className="mt-7 h-11 rounded-full border-slate-300">
                    <Link href={basicHref}>Vstoupit do Basic</Link>
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={() => onSelectPaidPlan(paidPlanId)}
                    className={cn(
                        'mt-7 h-11 rounded-full',
                        isPremium
                            ? 'bg-slate-950 text-white hover:bg-slate-800'
                            : 'bg-cyan-700 text-white hover:bg-cyan-800',
                    )}
                >
                    Vyzkoušet {plan.name} zdarma <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}

            {paidPlanId !== null && (
                <p className="mt-3 text-center text-xs text-slate-400">
                    {COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT} dní zdarma · poté podle zvolené platby
                </p>
            )}
        </article>
    );
}

function FeatureComparisonTable() {
    const featureIdsByPlan = new Map(
        COMMUNITY_MEMBERSHIP_PLANS.map(
            (plan) => [plan.id, new Set(getCommunityMembershipFeatureIds(plan.id))] as const,
        ),
    );

    return (
        <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">Porovnání funkcí plánů Basic, Standard a Premium</caption>
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="sticky left-0 z-10 w-[42%] bg-white px-5 py-5 text-sm font-semibold text-slate-500 sm:px-7">
                            Součást členství
                        </th>
                        {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => (
                            <th
                                key={plan.id}
                                scope="col"
                                className={cn(
                                    'px-4 py-5 text-center text-base font-bold text-slate-950',
                                    plan.id === 'premium' && 'bg-cyan-50',
                                )}
                            >
                                {plan.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {COMMUNITY_MEMBERSHIP_FEATURES.map((feature, featureIndex) => (
                        <tr key={feature.id} className={featureIndex === 0 ? undefined : 'border-t border-slate-100'}>
                            <th
                                scope="row"
                                className="sticky left-0 z-10 bg-white px-5 py-4 text-sm font-medium text-slate-700 sm:px-7"
                            >
                                {feature.shortLabel}
                            </th>
                            {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => {
                                const isIncluded = featureIdsByPlan.get(plan.id)?.has(feature.id) === true;
                                return (
                                    <td
                                        key={plan.id}
                                        className={cn('px-4 py-4 text-center', plan.id === 'premium' && 'bg-cyan-50')}
                                    >
                                        {isIncluded ? (
                                            <Check aria-label="Ano" className="mx-auto h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <Minus aria-label="Ne" className="mx-auto h-5 w-5 text-slate-300" />
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function CommunityMembershipPage({
    initialFullname,
    initialEmail,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
}: CommunityMembershipPageProps) {
    const [billingPeriod, setBillingPeriod] = useState<CommunityMembershipBillingPeriod>('yearly');
    const [selectedPlanId, setSelectedPlanId] = useState<PaidCommunityMembershipPlanId>('premium');
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
        ? `${initialFullname}, vstupte do Premium komunity, která posouvá práci s AI.`
        : 'Vstupte do Premium komunity, která posouvá práci s AI.';
    const personalizedBenefitLead = initialFullname
        ? `${initialFullname}, nemusíte všechno objevovat sami.`
        : 'Nemusíte všechno objevovat sami.';
    const personalizedComparisonTitle = initialFullname
        ? `${initialFullname}, vyberte si míru zapojení.`
        : 'Vyberte si míru zapojení.';
    const personalizedRegistrationTitle = initialFullname
        ? `${initialFullname}, začněte 7 dny zdarma.`
        : 'Začněte 7 dny zdarma.';

    const selectPaidPlan = (planId: PaidCommunityMembershipPlanId) => {
        setSelectedPlanId(planId);
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
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>7 dní zdarma · cena zůstává</span>
                    </>
                }
                secondaryAction={{ label: 'Otevřít komunitu', href: basicHref }}
                primaryAction={{
                    label: 'Vyzkoušet Premium',
                    mobileLabel: 'Trial zdarma',
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
                            <Crown className="h-4 w-4" /> Premium členství Promptbooku
                        </div>
                        <h1 className="mt-6 text-4xl font-bold leading-[1.07] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            {personalizedHeroTitle}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                            Záznamy všech workshopů, exkluzivní materiály, přednostní dotazy a každý měsíc osobní
                            setkání s lidmi, kteří tvoří produkty a firmy s AI.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-13 rounded-full bg-cyan-300 px-7 text-base font-bold text-slate-950 hover:bg-cyan-200"
                            >
                                <Link href="#ceny">
                                    Porovnat členství <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-13 rounded-full border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href={`#${REGISTRATION_SECTION_ID}`}>7 dní zdarma</Link>
                            </Button>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                            {[
                                'Standard i Premium',
                                `Roční cena = ${COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT} měsíce zdarma`,
                                'Slevové kódy navíc',
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
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">
                            Pro praxi, ne do počtu
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            {personalizedBenefitLead}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Komunita spojuje lidi, kteří vyvíjejí, tvoří a podnikají. Dostanete konkrétní obsah i místo,
                            kde lze rozpracovanou věc ukázat a získat užitečnou reakci.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
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
                        <h2 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">Celá knihovna workshopů</h2>
                        <p className="mt-4 leading-relaxed text-slate-600">
                            Živé workshopy zůstávají zdarma pro připojené účastníky. Jejich záznamy budou po skončení
                            dostupné jen členům Standard a Premium; současná mimořádná dostupnost starších záznamů je
                            dočasná.
                        </p>
                    </div>
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                            Specializované hodiny
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {SPECIALIZED_WORKSHOPS.map((workshop, index) => (
                                <div
                                    key={workshop}
                                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-mono text-xs font-bold text-cyan-200">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-semibold text-slate-800">{workshop}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="ceny" className="bg-white py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Členství</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Premium je nejblíž komunitě.
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Každý vyšší plán obsahuje vše z předchozího. Roční varianta je předvolená a ušetří dvě
                            měsíční platby.
                        </p>
                        <CommunityMembershipBillingToggle
                            billingPeriod={billingPeriod}
                            onChange={setBillingPeriod}
                            className="mt-7"
                        />
                    </div>

                    {discountCodeValidation.activeDiscount !== null && (
                        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center text-sm font-semibold text-emerald-800">
                            <ShieldCheck className="h-4 w-4 shrink-0" /> Kód{' '}
                            {discountCodeValidation.activeDiscount.code}
                            přidává dalších {discountCodeValidation.activeDiscount.percent} % ke všem placeným plánům.
                        </div>
                    )}

                    <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
                        {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => (
                            <PricingPlanCard
                                key={plan.id}
                                plan={plan}
                                billingPeriod={billingPeriod}
                                activeDiscount={discountCodeValidation.activeDiscount}
                                basicHref={basicHref}
                                onSelectPaidPlan={selectPaidPlan}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section id="porovnani" className="bg-slate-50 py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Přímé porovnání</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            {personalizedComparisonTitle}
                        </h2>
                        <p className="mt-4 text-slate-600 sm:text-lg">
                            Na telefonu můžete tabulku posunout do strany. Premium obsahuje celý Standard i Basic.
                        </p>
                    </div>
                    <div className="mt-10">
                        <FeatureComparisonTable />
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#081c27] py-20 text-white sm:py-24">
                <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/20">
                            <UsersRound className="h-6 w-6" />
                        </div>
                        <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-cyan-200">
                            Jen v Premium
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Jednou měsíčně se potkáme osobně.</h2>
                        <p className="mt-4 max-w-xl leading-relaxed text-slate-300 sm:text-lg">
                            Ne konferenční networking. Komorní setkání nad tím, co právě stavíte, kde se AI zasekla a co
                            vám pomohlo. Premium členové mají také nejvyšší prioritu u dotazů, materiálů a diskuze.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { icon: UsersRound, value: '1× měsíčně', label: 'osobní setkání' },
                            { icon: CircleGauge, value: 'Nejvyšší', label: 'priorita odpovědí' },
                            { icon: Rss, value: 'Průběžně', label: 'nové materiály' },
                            { icon: InfinityIcon, value: 'Celá', label: 'knihovna záznamů' },
                        ].map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                            >
                                <metric.icon className="h-5 w-5 text-cyan-200" />
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
                            Vyberte Standard nebo Premium. Během zkušebního období nic neplatíte; další postup a
                            potvrzení členství dostanete e-mailem.
                        </p>
                        <div className="mt-8 space-y-4">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: '7 dní bez platby',
                                    text: 'Trial platí pro Standard i Premium.',
                                },
                                {
                                    icon: LockKeyhole,
                                    title: 'Cena se vám nezvýší',
                                    text: 'Dokud stejné členství běží bez přerušení.',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'Slevy se sčítají',
                                    text: 'Platný kód se přidá i k ročnímu zvýhodnění.',
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
                        selectedPlanId={selectedPlanId}
                        onSelectedPlanIdChange={setSelectedPlanId}
                        billingPeriod={billingPeriod}
                        onBillingPeriodChange={setBillingPeriod}
                        discountCodeValidation={discountCodeValidation}
                    />
                </div>
            </section>

            <section className="border-t border-slate-200 bg-slate-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto flex max-w-4xl items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
                        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                        <div>
                            <h2 className="font-bold text-slate-950">Cenová garance a změny členství</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Ceny, plány a benefity můžeme pro nové registrace změnit. Pokud se přihlásíte nyní,
                                sjednanou cenu vám po dobu nepřerušeného členství ve stejném plánu nezvýšíme, a to ani
                                při zdražení ceníku. Rozsah benefitů a dostupnost členství se mohou měnit za podmínek
                                uvedených v obchodních podmínkách; vaše zákonná práva tím nejsou dotčena.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <MinimalFooter />
        </main>
    );
}
