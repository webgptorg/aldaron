'use client';

import { COMMUNITY_MEMBERSHIP_PATH, COMMUNITY_PATH } from '@/businesses/community/config';
import {
    COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT,
    COMMUNITY_MEMBERSHIP_PAID_PLANS,
    COMMUNITY_MEMBERSHIP_PLANS,
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    formatCommunityMembershipPrice,
    getCommunityMembershipPaidPlan,
    type CommunityMembershipBillingCycle,
    type CommunityMembershipPlan,
    type CommunityMembershipPaidPlanId,
    type CommunityMembershipPrice,
} from '@/businesses/community/membership/membershipConfig';
import {
    CommunityMembershipRegistrationError,
    submitCommunityMembershipRegistration,
} from '@/businesses/community/membership/membershipRegistrationApi';
import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { Footer } from '@/components/footer';
import { FAQSection, type FAQ } from '@/components/faq-section';
import { Header } from '@/components/header';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { SectionIntro } from '@/components/section-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    BookOpenCheck,
    CalendarDays,
    Check,
    CircleCheck,
    Crown,
    Loader2,
    MessageCircleHeart,
    Rocket,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';

type CommunityMembershipPageProps = {
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
};

type SubmittedMembership = {
    readonly planName: string;
    readonly trialDays: number;
    readonly membershipPrice: CommunityMembershipPrice;
};

const premiumBenefits = [
    {
        icon: BookOpenCheck,
        title: 'Obsah, který nezůstane na povrchu',
        description: 'Návody, záznamy a postupy z reálné práce s AI — vždy s jasným dalším krokem.',
    },
    {
        icon: CalendarDays,
        title: 'Workshopy a Q&A pro členy',
        description: 'Přijďte s vlastním problémem, podívejte se na živé ukázky a ptejte se bez ostychu.',
    },
    {
        icon: UsersRound,
        title: 'Networking, který má kontext',
        description: 'Potkejte lidi, kteří řeší podobné věci — od prvního AI workflow až po nasazení v týmu.',
    },
] as const;

const membershipFaqs: FAQ[] = [
    {
        question: 'Co dostanu v Premium?',
        answer:
            'Exkluzivní obsah, členské workshopy a Q&A, networking s komunitou a dřívější přístup k novým materiálům. Premium je navržené jako praktický měsíční rytmus, ne jako další nepročtený newsletter.',
    },
    {
        question: 'Jak funguje zkušební doba?',
        answer: `Každé placené členství má ${COMMUNITY_MEMBERSHIP_TRIAL_DAYS} dní zdarma. Po odeslání přihlášky pošleme odkaz k dokončení aktivace; zkušební doba začne až tímto krokem.`,
    },
    {
        question: 'Jak se sčítá roční sleva a slevový kód?',
        answer: `Při platbě na rok odečteme nejdřív ${COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} % z roční ceny. Platný slevový kód pak použijeme i na takto sníženou cenu. Souhrn v přihlášce ukáže obě slevy zvlášť.`,
    },
    {
        question: 'V čem se liší Premium+?',
        answer:
            'Premium+ obsahuje vše z Premium a navíc individuální 1:1 konzultace, přednostní přístup k novým funkcím a více prostoru pro konkrétní zpětnou vazbu.',
    },
    {
        question: 'Můžu zůstat ve Free?',
        answer: (
            <>
                Ano. Free členství zůstává otevřené pro každého a vede přímo do{' '}
                <Link href={COMMUNITY_PATH} className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
                    komunitní místnosti
                </Link>
                . Premium si můžete vyzkoušet, až budete chtít jít víc do hloubky.
            </>
        ),
    },
];

function getContactFieldErrors({ fullname, email }: { fullname: string; email: string }) {
    return {
        fullnameError: fullname.trim() ? null : 'Vyplňte jméno a příjmení.',
        emailError: email.trim()
            ? isEmailAddressValid(email.trim())
                ? null
                : 'Zadejte prosím platný e-mail.'
            : 'Vyplňte e-mail.',
    };
}

function getBillingCycleLabel(billingCycle: CommunityMembershipBillingCycle): string {
    return billingCycle === 'yearly' ? 'ročně' : 'měsíčně';
}

function scrollToRegistration() {
    document.getElementById(REGISTRATION_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function MembershipPrice({
    plan,
    billingCycle,
}: {
    readonly plan: CommunityMembershipPlan;
    readonly billingCycle: CommunityMembershipBillingCycle;
}) {
    if (plan.monthlyPriceCzk === 0) {
        return (
            <>
                <span className="text-4xl font-bold tracking-tight text-slate-950">Zdarma</span>
                <p className="mt-2 text-sm text-slate-500">Bez časového omezení</p>
            </>
        );
    }

    const paidPlan = getCommunityMembershipPaidPlan(plan.id);
    if (paidPlan === null) {
        return null;
    }

    const price = createCommunityMembershipPrice(paidPlan, billingCycle, null);

    return billingCycle === 'monthly' ? (
        <>
            <span className="text-4xl font-bold tracking-tight text-slate-950">
                {formatCommunityMembershipPrice(price.finalPriceCzk)}
            </span>
            <span className="ml-2 text-sm font-medium text-slate-500">/ měsíc</span>
        </>
    ) : (
        <>
            <span className="text-4xl font-bold tracking-tight text-slate-950">
                {formatCommunityMembershipPrice(price.finalPriceCzk)}
            </span>
            <span className="ml-2 text-sm font-medium text-slate-500">/ rok</span>
            <p className="mt-2 text-sm text-emerald-700">
                {formatCommunityMembershipPrice(price.annualDiscountAmountCzk)} ušetříte za rok
            </p>
        </>
    );
}

function PriceSummary({
    price,
    billingCycle,
}: {
    readonly price: CommunityMembershipPrice;
    readonly billingCycle: CommunityMembershipBillingCycle;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold text-slate-950">Cena za {getBillingCycleLabel(billingCycle)}</p>
                <p className="text-xl font-bold text-slate-950">{formatCommunityMembershipPrice(price.finalPriceCzk)}</p>
            </div>
            <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                    <dt>Základní cena</dt>
                    <dd>{formatCommunityMembershipPrice(price.basePriceCzk)}</dd>
                </div>
                {price.annualDiscountAmountCzk > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-700">
                        <dt>Roční sleva {COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} %</dt>
                        <dd>− {formatCommunityMembershipPrice(price.annualDiscountAmountCzk)}</dd>
                    </div>
                )}
                {price.discountCodeAmountCzk > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-700">
                        <dt>Slevový kód {price.discountCodePercent} %</dt>
                        <dd>− {formatCommunityMembershipPrice(price.discountCodeAmountCzk)}</dd>
                    </div>
                )}
            </dl>
        </div>
    );
}

/**
 * A focused sales page for the paid community tiers. The plan catalogue and price calculation
 * deliberately come from the same modules as the endpoint, so visual changes cannot invent a
 * price or a discount the server will not honour.
 */
export function CommunityMembershipPage({
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
}: CommunityMembershipPageProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<CommunityMembershipPaidPlanId>('premium');
    const [billingCycle, setBillingCycle] = useState<CommunityMembershipBillingCycle>('yearly');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [submittedMembership, setSubmittedMembership] = useState<SubmittedMembership | null>(null);
    const selectedPlan = getCommunityMembershipPaidPlan(selectedPlanId) ?? COMMUNITY_MEMBERSHIP_PAID_PLANS[0]!;
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode,
        initialActiveDiscountByPlaceId,
        discountPlaceId: selectedPlan.discountPlaceId,
    });
    const membershipPrice = useMemo(
        () => createCommunityMembershipPrice(selectedPlan, billingCycle, discountCodeValidation.activeDiscount),
        [billingCycle, discountCodeValidation.activeDiscount, selectedPlan],
    );
    const { fullnameError, emailError } = getContactFieldErrors({ fullname, email });
    const canSubmit = !fullnameError && !emailError;

    const choosePaidPlan = (planId: CommunityMembershipPaidPlanId) => {
        setSelectedPlanId(planId);
        setErrorMessage(null);
        scrollToRegistration();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            setShowValidation(true);
            setErrorMessage('Vyplňte prosím jméno a platný e-mail.');
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const result = await submitCommunityMembershipRegistration({
                planId: selectedPlan.id,
                billingCycle,
                fullname: fullname.trim(),
                email: email.trim(),
                discountCode: discountCodeValidation.discountCode,
            });
            setSubmittedMembership(result);
        } catch (error) {
            setErrorMessage(
                error instanceof CommunityMembershipRegistrationError
                    ? error.message
                    : 'Odeslání se nepovedlo. Zkuste to prosím znovu.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-white text-slate-950">
            <Header
                language="cs"
                brandHref={COMMUNITY_MEMBERSHIP_PATH}
                hideCenterContent
                navItems={[
                    { href: '#benefity', label: 'Co získáte' },
                    { href: '#clenstvi', label: 'Členství' },
                    { href: '#registrace', label: 'Vyzkoušet' },
                ]}
                secondaryAction={{ href: COMMUNITY_PATH, label: 'Komunita' }}
                primaryAction={{ href: `#${REGISTRATION_SECTION_ID}`, label: '7 dní zdarma' }}
            />

            <section className="relative overflow-hidden bg-[#061b2a] pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
                <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                    <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] bg-[size:22px_22px] opacity-30" />
                </div>
                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <Badge className="border border-cyan-200/25 bg-cyan-300/10 px-3 py-1 text-cyan-100 hover:bg-cyan-300/10">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Komunita Promptbooku
                        </Badge>
                        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
                            Nezůstávejte na AI sami.{' '}
                            <span className="bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
                                Posouvejte se každý týden.
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
                            Premium členství propojuje exkluzivní obsah, praktické workshopy a lidi, kteří AI používají
                            v reálné práci — ne jen v bookmarkech.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-medium text-cyan-50">
                            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">7 dní zdarma</span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
                                Premium od 150 Kč / měsíc
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
                                Při platbě ročně −20 %
                            </span>
                        </div>
                        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button
                                type="button"
                                size="lg"
                                onClick={() => choosePaidPlan('premium')}
                                className="rounded-full bg-cyan-300 px-7 font-semibold text-slate-950 hover:bg-cyan-200"
                            >
                                Vyzkoušet Premium zdarma <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                asChild
                                type="button"
                                size="lg"
                                variant="outline"
                                className="rounded-full border-white/25 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href={COMMUNITY_PATH}>Prohlédnout komunitu</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="benefity" className="bg-slate-50 py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <SectionIntro
                        eyebrow="Proč Premium"
                        title={
                            <>
                                Víc než obsah. <span className="text-cyan-700">Místo, kde se věci hýbou.</span>
                            </>
                        }
                        description="Premium je pro chvíli, kdy už nechcete další obecný seznam nástrojů, ale pravidelný kontakt s praxí a lidmi kolem ní."
                    />
                    <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
                        {premiumBenefits.map((benefit) => (
                            <article
                                key={benefit.title}
                                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                    <benefit.icon className="h-6 w-6" />
                                </div>
                                <h2 className="mt-5 text-xl font-bold text-slate-950">{benefit.title}</h2>
                                <p className="mt-3 leading-relaxed text-slate-600">{benefit.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="clenstvi" className="scroll-mt-24 bg-white py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <SectionIntro
                        eyebrow="Vyberte si rytmus"
                        title={
                            <>
                                Členství, které roste <span className="text-cyan-700">s vámi.</span>
                            </>
                        }
                        description="Začněte zdarma, pokračujte Premium a sáhněte po Premium+, když chcete i osobní zpětnou vazbu."
                    />

                    <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-slate-600">
                        <span className={billingCycle === 'monthly' ? 'text-slate-950' : undefined}>Měsíčně</span>
                        <Switch
                            id="membership-billing-cycle"
                            checked={billingCycle === 'yearly'}
                            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                            aria-label="Platba ročně"
                        />
                        <label
                            htmlFor="membership-billing-cycle"
                            className={cn(billingCycle === 'yearly' ? 'text-slate-950' : undefined, 'cursor-pointer')}
                        >
                            Ročně <span className="text-emerald-700">−{COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} %</span>
                        </label>
                    </div>

                    <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3 lg:items-stretch">
                        {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => {
                            const paidPlan = getCommunityMembershipPaidPlan(plan.id);
                            const isSelected = paidPlan?.id === selectedPlan.id;

                            return (
                                <article
                                    key={plan.id}
                                    className={cn(
                                        'relative flex flex-col rounded-3xl border bg-white p-7 shadow-sm transition-all',
                                        plan.isRecommended
                                            ? 'border-cyan-400 shadow-xl shadow-cyan-900/10 ring-1 ring-cyan-300/60 lg:-translate-y-3'
                                            : 'border-slate-200 hover:shadow-lg',
                                        isSelected && 'ring-2 ring-cyan-500',
                                    )}
                                >
                                    {plan.isRecommended && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 px-3 py-1 text-white hover:bg-cyan-600">
                                            <Crown className="mr-1.5 h-3.5 w-3.5" />
                                            Doporučujeme
                                        </Badge>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-950">{plan.name}</h2>
                                        <p className="mt-3 min-h-14 text-sm leading-relaxed text-slate-600">{plan.description}</p>
                                        <div className="mt-7 min-h-20">
                                            <MembershipPrice
                                                plan={plan}
                                                billingCycle={billingCycle}
                                            />
                                        </div>
                                        {paidPlan !== null && (
                                            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                                <CircleCheck className="h-4 w-4" />
                                                {COMMUNITY_MEMBERSHIP_TRIAL_DAYS} dní zdarma
                                            </p>
                                        )}
                                    </div>
                                    <ul className="mt-8 flex-1 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {paidPlan === null ? (
                                        <Button asChild variant="outline" className="mt-8 rounded-xl border-slate-300">
                                            <Link href={COMMUNITY_PATH}>Vstoupit zdarma</Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={() => choosePaidPlan(paidPlan.id)}
                                            className={cn(
                                                'mt-8 rounded-xl',
                                                plan.isRecommended
                                                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                                                    : 'bg-slate-950 text-white hover:bg-slate-800',
                                            )}
                                        >
                                            {plan.isRecommended ? 'Vyzkoušet Premium' : 'Vybrat Premium+'}
                                        </Button>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                    <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-slate-500">
                        Roční sleva a platný slevový kód se sčítají. V přihlášce vždy uvidíte, jak se výsledná cena
                        skládá.
                    </p>
                </div>
            </section>

            <section id={REGISTRATION_SECTION_ID} className="scroll-mt-24 bg-slate-950 py-20 text-white sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(420px,1fr)] lg:items-start">
                        <div className="lg:pt-7">
                            <Badge className="border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/10">
                                <Rocket className="mr-1.5 h-3.5 w-3.5" />
                                Bez závazku první týden
                            </Badge>
                            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                                Vyzkoušejte {selectedPlan.name}. <span className="text-cyan-200">Prvních 7 dní zdarma.</span>
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                                Vyberte si plán, způsob platby a případně vložte slevový kód. Přihlášku uložíme s přesnou
                                cenou a pošleme vám odkaz k dokončení aktivace.
                            </p>
                            <div className="mt-8 space-y-4">
                                <div className="flex gap-3 text-slate-200">
                                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                                    <p>Žádná platba během zkušební doby.</p>
                                </div>
                                <div className="flex gap-3 text-slate-200">
                                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                                    <p>Roční sleva {COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} % i slevový kód v jednom souhrnu.</p>
                                </div>
                                <div className="flex gap-3 text-slate-200">
                                    <MessageCircleHeart className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                                    <p>Do komunity můžete vstoupit zdarma už teď — Premium aktivujeme po dokončení přihlášky.</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-6 text-slate-950 shadow-2xl sm:p-8">
                            {submittedMembership === null ? (
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                                                Vaše členství
                                            </p>
                                            <h3 className="mt-2 text-2xl font-bold">{selectedPlan.name}</h3>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => document.getElementById('clenstvi')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
                                        >
                                            Změnit
                                        </Button>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                                        <span className={billingCycle === 'monthly' ? 'font-semibold text-slate-950' : 'text-slate-500'}>
                                            Měsíčně
                                        </span>
                                        <Switch
                                            id="registration-billing-cycle"
                                            checked={billingCycle === 'yearly'}
                                            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                                            aria-label="Platba ročně"
                                        />
                                        <label
                                            htmlFor="registration-billing-cycle"
                                            className={cn(
                                                billingCycle === 'yearly' ? 'font-semibold text-slate-950' : 'text-slate-500',
                                                'cursor-pointer',
                                            )}
                                        >
                                            Ročně −{COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} %
                                        </label>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="membership-fullname" className="text-sm font-semibold text-slate-700">
                                                Jméno a příjmení
                                            </label>
                                            <Input
                                                id="membership-fullname"
                                                name="fullname"
                                                value={fullname}
                                                onChange={(event) => setFullname(event.target.value)}
                                                placeholder="Jana Nováková"
                                                autoComplete="name"
                                                aria-invalid={showValidation && fullnameError !== null}
                                                className={cn(
                                                    'mt-2 h-11',
                                                    showValidation && fullnameError && 'border-red-300 bg-red-50 focus-visible:ring-red-200',
                                                )}
                                            />
                                            {showValidation && fullnameError && (
                                                <p className="mt-1 text-xs text-red-600">{fullnameError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="membership-email" className="text-sm font-semibold text-slate-700">
                                                E-mail
                                            </label>
                                            <Input
                                                id="membership-email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                placeholder="jana@firma.cz"
                                                autoComplete="email"
                                                aria-invalid={showValidation && emailError !== null}
                                                className={cn(
                                                    'mt-2 h-11',
                                                    showValidation && emailError && 'border-red-300 bg-red-50 focus-visible:ring-red-200',
                                                )}
                                            />
                                            {showValidation && emailError && (
                                                <p className="mt-1 text-xs text-red-600">{emailError}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <DiscountCodeField inputId="membership-discount" validation={discountCodeValidation} />
                                    </div>

                                    <div className="mt-6">
                                        <PriceSummary price={membershipPrice} billingCycle={billingCycle} />
                                    </div>

                                    {errorMessage && (
                                        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {errorMessage}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="mt-6 w-full rounded-xl bg-cyan-600 text-white hover:bg-cyan-700"
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Odeslat přihlášku k členství
                                    </Button>
                                    <PersonalDataConsentNote language="cs" className="mt-4 text-slate-500" />
                                </form>
                            ) : (
                                <div className="py-3 text-center" role="status">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <CircleCheck className="h-7 w-7" />
                                    </div>
                                    <h3 className="mt-5 text-2xl font-bold">Přihlášku k členství máme</h3>
                                    <p className="mt-3 leading-relaxed text-slate-600">
                                        Na <strong>{email}</strong> pošleme odkaz k dokončení aktivace {submittedMembership.planName}.
                                        Teprve potom začne {submittedMembership.trialDays}denní zkušební doba.
                                    </p>
                                    <div className="mt-6 text-left">
                                        <PriceSummary price={submittedMembership.membershipPrice} billingCycle={billingCycle} />
                                    </div>
                                    <Button asChild variant="outline" className="mt-6 w-full rounded-xl">
                                        <Link href={COMMUNITY_PATH}>Podívat se do komunity zdarma</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <FAQSection
                faqs={membershipFaqs}
                eyebrow="Otázky k členství"
                title={
                    <>
                        Všechno důležité <span className="text-cyan-700">na jednom místě.</span>
                    </>
                }
                description="Pokud vám něco stále chybí, napište nám — komunitu stavíme společně s jejími členy."
            />

            <Footer language="cs" />
        </main>
    );
}
