'use client';

import { COMMUNITY_MEMBERSHIP_PATH, COMMUNITY_PATH } from '@/businesses/community/config';
import {
    COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT,
    COMMUNITY_MEMBERSHIP_DEFAULT_BILLING_CYCLE,
    COMMUNITY_MEMBERSHIP_FEATURES,
    COMMUNITY_MEMBERSHIP_PLANS,
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    formatCommunityMembershipPrice,
    getCommunityMembershipFeature,
    getCommunityMembershipMonthlyEquivalent,
    getCommunityMembershipPaidPlan,
    getInitialCommunityMembershipPaidPlanId,
    type CommunityMembershipBillingCycle,
    type CommunityMembershipPaidPlanId,
    type CommunityMembershipPlan,
    type CommunityMembershipPrice,
} from '@/businesses/community/membership/membershipConfig';
import {
    CommunityMembershipRegistrationError,
    submitCommunityMembershipRegistration,
    type CommunityMembershipRegistrationResponse,
} from '@/businesses/community/membership/membershipRegistrationApi';
import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { ScrollToRegistrationSection } from '@/components/discounts/ScrollToRegistrationSection';
import { FAQSection, type FAQ } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { SectionIntro } from '@/components/section-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    BookOpenCheck,
    BriefcaseBusiness,
    Check,
    CircleCheck,
    Code2,
    Crown,
    GitBranch,
    Loader2,
    LockKeyhole,
    MessageCircleMore,
    Mic2,
    Radio,
    ReceiptText,
    Rocket,
    Rss,
    Sparkles,
    TestTube2,
    UsersRound,
    Video,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';

type CommunityMembershipPageProps = {
    readonly initialFullname: string;
    readonly initialEmail: string;
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
};

type SubmittedMembership = CommunityMembershipRegistrationResponse & {
    readonly email: string;
};

const audienceCards = [
    {
        icon: Code2,
        title: 'Vývojáři',
        description: 'Produkční postupy, repozitáře a hlubší debaty o Gitu, databázích, testech i kontextu.',
    },
    {
        icon: Sparkles,
        title: 'Tvůrci',
        description: 'Místo, kde rozpracovaný nápad ukážete lidem, kteří umí dát konkrétní a užitečnou odezvu.',
    },
    {
        icon: BriefcaseBusiness,
        title: 'Malí podnikatelé',
        description: 'Praktické AI workflow, která šetří čas dnes — bez čekání na velký transformační projekt.',
    },
] as const;

const deepDiveTopics = [
    { icon: GitBranch, label: 'Deep dive do Gitu', detail: 'Historie, větve, konflikty a práce AI agenta bez chaosu.' },
    { icon: Code2, label: 'AI a databáze', detail: 'Migrace, data a bezpečné změny schématu v reálném projektu.' },
    {
        icon: TestTube2,
        label: 'Testování',
        detail: 'Jak poznat, že změna funguje, a nenechat si od AI jen slíbit výsledek.',
    },
    {
        icon: BookOpenCheck,
        label: 'Práce s kontextem',
        detail: 'Co agent potřebuje vědět a jak mu to předat bez informačního šumu.',
    },
] as const;

function createCommunityRoomHref(fullname: string, email: string): string {
    const searchParameters = new URLSearchParams();
    if (fullname.trim()) {
        searchParameters.set('fullname', fullname.trim());
    }
    if (email.trim()) {
        searchParameters.set('email', email.trim());
    }

    const query = searchParameters.toString();
    return query ? `${COMMUNITY_PATH}?${query}` : COMMUNITY_PATH;
}

function BillingCycleSelector({
    billingCycle,
    onChange,
    tone = 'light',
}: {
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly onChange: (billingCycle: CommunityMembershipBillingCycle) => void;
    readonly tone?: 'light' | 'dark';
}) {
    return (
        <div
            className={cn(
                'grid w-full max-w-sm grid-cols-2 rounded-full border p-1 shadow-sm',
                tone === 'dark' ? 'border-white/15 bg-white/10' : 'border-slate-200 bg-white',
            )}
            role="group"
            aria-label="Frekvence platby"
        >
            <button
                type="button"
                onClick={() => onChange('yearly')}
                aria-pressed={billingCycle === 'yearly'}
                className={cn(
                    'flex min-h-10 items-center justify-center gap-2 rounded-full px-2 text-sm font-semibold transition sm:px-5',
                    billingCycle === 'yearly'
                        ? 'bg-slate-950 text-white shadow-sm'
                        : tone === 'dark'
                          ? 'text-white/65 hover:text-white'
                          : 'text-slate-500 hover:text-slate-950',
                )}
            >
                Ročně
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] text-emerald-300">
                    −{COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} %
                </span>
            </button>
            <button
                type="button"
                onClick={() => onChange('monthly')}
                aria-pressed={billingCycle === 'monthly'}
                className={cn(
                    'min-h-10 rounded-full px-2 text-sm font-semibold transition sm:px-5',
                    billingCycle === 'monthly'
                        ? 'bg-slate-950 text-white shadow-sm'
                        : tone === 'dark'
                          ? 'text-white/65 hover:text-white'
                          : 'text-slate-500 hover:text-slate-950',
                )}
            >
                Měsíčně
            </button>
        </div>
    );
}

function MonthlyPrice({
    plan,
    billingCycle,
    className,
}: {
    readonly plan: CommunityMembershipPlan;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly className?: string;
}) {
    const paidPlan = getCommunityMembershipPaidPlan(plan.id);
    if (paidPlan === null) {
        return (
            <div className={className}>
                <span className="text-4xl font-bold tracking-tight">0 Kč</span>
                <span className="ml-2 text-sm font-medium text-slate-500">/ měsíc</span>
                <p className="mt-2 text-sm text-slate-500">Bez platební karty a bez omezení</p>
            </div>
        );
    }

    const price = createCommunityMembershipPrice(paidPlan, billingCycle, null);
    const monthlyEquivalent = getCommunityMembershipMonthlyEquivalent(price, billingCycle);

    return (
        <div className={className}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {billingCycle === 'yearly' && (
                    <span className="text-lg font-semibold text-slate-400 line-through decoration-slate-400">
                        {formatCommunityMembershipPrice(plan.monthlyPriceCzk)}
                    </span>
                )}
                <span className="text-4xl font-bold tracking-tight text-slate-950">
                    {formatCommunityMembershipPrice(monthlyEquivalent)}
                </span>
                <span className="text-sm font-medium text-slate-500">/ měsíc</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
                {billingCycle === 'yearly'
                    ? `účtováno ${formatCommunityMembershipPrice(price.finalPriceCzk)} jednou ročně`
                    : 'účtováno každý měsíc'}
            </p>
        </div>
    );
}

function ComparisonMonthlyPrice({
    plan,
    billingCycle,
}: {
    readonly plan: CommunityMembershipPlan;
    readonly billingCycle: CommunityMembershipBillingCycle;
}) {
    const paidPlan = getCommunityMembershipPaidPlan(plan.id);
    if (paidPlan === null) {
        return <span>0 Kč / měsíc</span>;
    }

    const monthlyEquivalent = getCommunityMembershipMonthlyEquivalent(
        createCommunityMembershipPrice(paidPlan, billingCycle, null),
        billingCycle,
    );

    return (
        <span className="flex flex-wrap items-baseline justify-center gap-x-1">
            {billingCycle === 'yearly' && (
                <span className="text-slate-400 line-through">
                    {formatCommunityMembershipPrice(plan.monthlyPriceCzk)}
                </span>
            )}
            <span>{formatCommunityMembershipPrice(monthlyEquivalent)} / měsíc</span>
        </span>
    );
}

function PricingCard({
    plan,
    billingCycle,
    isSelected,
    communityRoomHref,
    onSelect,
}: {
    readonly plan: CommunityMembershipPlan;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly isSelected: boolean;
    readonly communityRoomHref: string;
    readonly onSelect: (planId: CommunityMembershipPaidPlanId) => void;
}) {
    const isPaid = plan.id !== 'basic';

    return (
        <article
            className={cn(
                'relative flex h-full flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm transition sm:p-7',
                plan.isFeatured
                    ? 'border-cyan-400 shadow-xl shadow-cyan-950/10 ring-1 ring-cyan-300'
                    : isSelected
                      ? 'border-slate-400 ring-1 ring-slate-300'
                      : 'border-slate-200 hover:-translate-y-1 hover:shadow-lg',
            )}
        >
            {plan.isFeatured && (
                <Badge className="absolute -top-3 left-6 border-0 bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-white shadow-sm">
                    <Crown className="mr-1.5 h-3.5 w-3.5" /> Doporučené členství
                </Badge>
            )}

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">{plan.eyebrow}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">{plan.name}</h3>
            <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-slate-600">{plan.description}</p>

            <MonthlyPrice plan={plan} billingCycle={billingCycle} className="mt-6" />

            {isPaid && (
                <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" /> {COMMUNITY_MEMBERSHIP_TRIAL_DAYS} dní zdarma
                </div>
            )}

            <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6">
                {plan.highlightedFeatureIds.map((featureId) => {
                    const feature = getCommunityMembershipFeature(featureId);
                    return (
                        <li key={feature.id} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                            <span>{feature.label}</span>
                        </li>
                    );
                })}
            </ul>

            {plan.id === 'basic' ? (
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="mt-7 h-auto min-h-11 w-full whitespace-normal rounded-xl px-4 py-3 text-center leading-tight"
                >
                    <Link href={communityRoomHref}>Vstoupit do Basic zdarma</Link>
                </Button>
            ) : (
                <Button
                    type="button"
                    size="lg"
                    variant={plan.isFeatured ? 'default' : 'outline'}
                    onClick={() => onSelect(plan.id as CommunityMembershipPaidPlanId)}
                    className={cn(
                        'mt-7 h-auto min-h-11 w-full whitespace-normal rounded-xl px-4 py-3 text-center leading-tight',
                        plan.isFeatured && 'bg-slate-950 text-white hover:bg-slate-800',
                    )}
                >
                    Vyzkoušet {plan.name} zdarma
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </article>
    );
}

function ComparisonTable({ billingCycle }: { readonly billingCycle: CommunityMembershipBillingCycle }) {
    return (
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
            <div className="border-b border-slate-100 px-5 py-3 text-xs text-slate-500 sm:hidden">
                Tabulku můžete posunout do strany.
            </div>
            <Table containerClassName="max-w-full">
                <caption className="sr-only">Porovnání benefitů členství Basic, Standard a Premium</caption>
                <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="sticky left-0 z-20 min-w-[175px] bg-slate-50 px-3 text-slate-700 sm:min-w-[230px] sm:px-5">
                            Co členství obsahuje
                        </TableHead>
                        {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => (
                            <TableHead
                                key={plan.id}
                                className={cn(
                                    'min-w-[130px] px-3 text-center sm:min-w-[155px] sm:px-4',
                                    plan.isFeatured && 'bg-cyan-50',
                                )}
                            >
                                <span className="block text-base font-bold text-slate-950">{plan.name}</span>
                                <span className="mt-1 block text-xs font-medium text-slate-500">
                                    <ComparisonMonthlyPrice plan={plan} billingCycle={billingCycle} />
                                </span>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {COMMUNITY_MEMBERSHIP_FEATURES.map((feature) => (
                        <TableRow key={feature.id} className="hover:bg-cyan-50/30">
                            <TableCell className="sticky left-0 z-10 bg-white px-3 py-4 sm:px-5">
                                <span className="block font-semibold text-slate-800">{feature.label}</span>
                                <span className="mt-1 block max-w-sm text-xs leading-relaxed text-slate-500">
                                    {feature.description}
                                </span>
                            </TableCell>
                            {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => {
                                const isIncluded = plan.featureIds.includes(feature.id);
                                return (
                                    <TableCell
                                        key={plan.id}
                                        className={cn('text-center', plan.isFeatured && 'bg-cyan-50/50')}
                                    >
                                        {isIncluded ? (
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                <Check className="h-4 w-4" aria-hidden />
                                                <span className="sr-only">Ano</span>
                                            </span>
                                        ) : (
                                            <span className="text-slate-300" aria-label="Ne">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function PriceSummary({
    plan,
    price,
    billingCycle,
}: {
    readonly plan: CommunityMembershipPlan;
    readonly price: CommunityMembershipPrice;
    readonly billingCycle: CommunityMembershipBillingCycle;
}) {
    const monthlyEquivalent = getCommunityMembershipMonthlyEquivalent(price, billingCycle);

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Vždy měsíční cena
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        {billingCycle === 'yearly' && (
                            <span className="font-semibold text-slate-400 line-through">
                                {formatCommunityMembershipPrice(plan.monthlyPriceCzk)}
                            </span>
                        )}
                        <strong className="text-2xl text-slate-950">
                            {formatCommunityMembershipPrice(monthlyEquivalent)}
                        </strong>
                        <span className="text-sm text-slate-500">/ měsíc</span>
                    </div>
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {COMMUNITY_MEMBERSHIP_TRIAL_DAYS} dní zdarma
                </Badge>
            </div>

            <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                    <dt>Základní cena</dt>
                    <dd>{formatCommunityMembershipPrice(price.basePriceCzk)}</dd>
                </div>
                {price.annualDiscountAmountCzk > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-700">
                        <dt>Roční sleva {COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} %</dt>
                        <dd>−{formatCommunityMembershipPrice(price.annualDiscountAmountCzk)}</dd>
                    </div>
                )}
                {price.discountCodeAmountCzk > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-700">
                        <dt>Slevový kód {price.discountCodePercent} %</dt>
                        <dd>−{formatCommunityMembershipPrice(price.discountCodeAmountCzk)}</dd>
                    </div>
                )}
                <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-3 text-slate-950">
                    <dt className="font-semibold">Po trialu {billingCycle === 'yearly' ? 'ročně' : 'měsíčně'}</dt>
                    <dd className="text-lg font-bold">{formatCommunityMembershipPrice(price.finalPriceCzk)}</dd>
                </div>
            </dl>
        </div>
    );
}

function PersonalizedHeading({
    name,
    children,
    tone = 'light',
}: {
    readonly name: string;
    readonly children: ReactNode;
    readonly tone?: 'light' | 'dark';
}) {
    return (
        <>
            {name && (
                <span className={cn('[overflow-wrap:anywhere]', tone === 'dark' ? 'text-cyan-300' : 'text-cyan-700')}>
                    {name},{' '}
                </span>
            )}
            {children}
        </>
    );
}

export function CommunityMembershipPage({
    initialFullname,
    initialEmail,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
}: CommunityMembershipPageProps) {
    const personalizedName = initialFullname.trim();
    const [selectedPlanId, setSelectedPlanId] = useState<CommunityMembershipPaidPlanId>(() =>
        getInitialCommunityMembershipPaidPlanId(initialActiveDiscountByPlaceId),
    );
    const [billingCycle, setBillingCycle] = useState<CommunityMembershipBillingCycle>(
        COMMUNITY_MEMBERSHIP_DEFAULT_BILLING_CYCLE,
    );
    const [fullname, setFullname] = useState(initialFullname);
    const [email, setEmail] = useState(initialEmail);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [submittedMembership, setSubmittedMembership] = useState<SubmittedMembership | null>(null);

    const selectedPlan = getCommunityMembershipPaidPlan(selectedPlanId)!;
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode,
        initialActiveDiscountByPlaceId,
        discountPlaceId: selectedPlan.discountPlaceId,
    });
    const membershipPrice = useMemo(
        () => createCommunityMembershipPrice(selectedPlan, billingCycle, discountCodeValidation.activeDiscount),
        [billingCycle, discountCodeValidation.activeDiscount, selectedPlan],
    );
    const fullnameError = fullname.trim() ? null : 'Vyplňte jméno a příjmení.';
    const emailError = email.trim()
        ? isEmailAddressValid(email.trim())
            ? null
            : 'Zadejte prosím platný e-mail.'
        : 'Vyplňte e-mail.';
    const discountCodeError =
        discountCodeValidation.discountCode.trim() &&
        !discountCodeValidation.isValidationPending &&
        discountCodeValidation.validationError === null &&
        discountCodeValidation.activeDiscount === null;
    const communityRoomHref = createCommunityRoomHref(fullname, email);
    const submittedPlan =
        submittedMembership === null ? null : getCommunityMembershipPaidPlan(submittedMembership.planId);
    const registrationPlan = submittedPlan ?? selectedPlan;

    const selectPaidPlan = (planId: CommunityMembershipPaidPlanId) => {
        setSelectedPlanId(planId);
        setSubmittedMembership(null);
        window.requestAnimationFrame(() => {
            document.getElementById(REGISTRATION_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowValidation(true);
        setErrorMessage(null);

        if (
            fullnameError !== null ||
            emailError !== null ||
            !termsAccepted ||
            discountCodeError ||
            discountCodeValidation.isValidationPending
        ) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await submitCommunityMembershipRegistration({
                planId: selectedPlan.id,
                billingCycle,
                fullname: fullname.trim(),
                email: email.trim(),
                discountCode: discountCodeValidation.discountCode,
                termsAccepted,
            });
            setSubmittedMembership({ ...response, email: email.trim() });
        } catch (error) {
            setErrorMessage(
                error instanceof CommunityMembershipRegistrationError || error instanceof Error
                    ? error.message
                    : 'Přihlášku se nepodařilo odeslat.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const membershipFaqs: FAQ[] = [
        {
            question: 'Jsou živé workshopy pořád zdarma?',
            answer: 'Ano. Připojení k živému vysílání zůstává součástí Basic. Záznam po skončení je součástí Standard a Premium.',
        },
        {
            question: 'Jak funguje sedmidenní zkušební doba?',
            answer: 'Po odeslání přihlášky vám pošleme aktivační odkaz. Trial začne až dokončením aktivace; tento formulář nic nestrhává.',
        },
        {
            question: 'Lze roční slevu spojit se slevovým kódem?',
            answer: `Ano. Nejdříve se odečte ${COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT}% sleva za roční platbu a potom se platný kód uplatní na už sníženou částku. Přesný rozpad vidíte před odesláním.`,
        },
        {
            question: 'Zůstane mi dnešní cena?',
            answer: 'Ano. Základní měsíční cenu zvoleného plánu držíme po celou dobu nepřerušeného členství, i kdyby se veřejná cena zvýšila. Při přerušení nebo změně plánu se použije tehdy aktuální ceník.',
        },
        {
            question: 'Mohou se plány a benefity změnit?',
            answer: (
                <>
                    Ano, komunitu průběžně rozvíjíme a její názvy, obsah i benefity se mohou měnit. Významnou změnu
                    oznámíme předem a postupujeme podle{' '}
                    <Link
                        href={getLegalPagePath('termsAndConditions', 'cs')}
                        className="font-semibold text-cyan-700 underline underline-offset-4"
                    >
                        obchodních podmínek
                    </Link>
                    . Vaše zákonná práva tím nejsou dotčena.
                </>
            ),
        },
        {
            question: 'Pro koho je Premium nejlepší?',
            answer: 'Pro vývojáře, tvůrce a majitele menších firem, kteří nechtějí jen sledovat obsah, ale pravidelně probírat vlastní práci, setkávat se osobně a ovlivňovat další témata komunity.',
        },
    ];

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <ScrollToRegistrationSection
                isScrollRequested={initialDiscountCode !== ''}
                registrationSectionId={REGISTRATION_SECTION_ID}
            />

            <Header
                language="cs"
                brandHref={COMMUNITY_PATH}
                brandLogo={
                    <Image
                        src="/logo/promptbook-logo-blue-transparent-128.png"
                        alt=""
                        aria-hidden
                        width={32}
                        height={32}
                        className="hidden h-8 w-8 sm:block"
                    />
                }
                brandName={
                    <span
                        aria-label="Promptbook > Komunita"
                        className="flex min-w-0 items-center gap-1 text-[13px] text-slate-900 min-[360px]:text-sm sm:gap-1.5 sm:text-xl"
                    >
                        <span className="shrink-0">Promptbook</span>
                        <span aria-hidden className="shrink-0 text-slate-400">
                            &gt;
                        </span>
                        <strong className="truncate">Komunita</strong>
                    </span>
                }
                navItems={[
                    { label: 'Pro koho', href: '#pro-koho' },
                    { label: 'Členství', href: '#clenstvi' },
                    { label: 'Porovnání', href: '#porovnani' },
                ]}
                primaryAction={{
                    label: `Vyzkoušet ${selectedPlan.name}`,
                    mobileLabel: selectedPlan.name,
                    href: `#${REGISTRATION_SECTION_ID}`,
                }}
                containerClassName="max-w-7xl"
            />

            <section className="relative overflow-hidden bg-[#071827] pb-20 pt-32 text-white sm:pb-24 sm:pt-36">
                <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(103,232,249,.38) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="container relative mx-auto max-w-7xl px-4">
                    <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                                <Crown className="h-4 w-4" /> Premium členství komunity
                            </div>
                            <h1 className="mt-7 max-w-4xl break-words text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
                                {personalizedName && (
                                    <span className="text-cyan-300 [overflow-wrap:anywhere]">{personalizedName}, </span>
                                )}
                                posuňte svou práci s AI mezi lidmi, kteří také tvoří.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                                Exkluzivní materiály, každý záznam workshopu, prioritní otázky a u Premium i pravidelná
                                setkání naživo. Pro vývojáře, tvůrce a malé podnikatele, kteří chtějí méně teorie a více
                                hotové práce.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-auto min-h-12 w-full whitespace-normal rounded-full bg-cyan-400 px-5 py-3 text-center leading-tight text-slate-950 hover:bg-cyan-300 sm:w-auto sm:px-7"
                                >
                                    <Link href={`#${REGISTRATION_SECTION_ID}`}>
                                        Vyzkoušet {selectedPlan.name} 7 dní zdarma
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="h-auto min-h-12 w-full whitespace-normal rounded-full border-white/20 bg-white/5 px-5 py-3 text-center leading-tight text-white hover:bg-white/10 hover:text-white sm:w-auto sm:px-7"
                                >
                                    <Link href="#porovnani">Porovnat všechny plány</Link>
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                                {[
                                    `${COMMUNITY_MEMBERSHIP_TRIAL_DAYS} dní zdarma`,
                                    `−${COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT} % při roční platbě`,
                                    'Dnešní základní cena vám zůstane',
                                ].map((item) => (
                                    <span key={item} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-cyan-300" /> {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 to-violet-500/20 blur-2xl" />
                            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-950/75 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                    </div>
                                    <span className="font-mono text-xs text-slate-400">promptbook/community</span>
                                </div>
                                <div className="space-y-4 p-5 sm:p-6">
                                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                                    Tento měsíc v Premium
                                                </p>
                                                <h2 className="mt-2 text-xl font-bold">Od nápadu k produkční změně</h2>
                                            </div>
                                            <Radio className="h-5 w-5 shrink-0 text-cyan-300" />
                                        </div>
                                        <div className="mt-5 grid gap-3">
                                            {[
                                                ['Workshop', 'Deep dive: AI a databáze'],
                                                ['Materiál', 'Checklist bezpečné migrace'],
                                                ['Meetup', 'Praha · diskuze nad projekty'],
                                            ].map(([label, value]) => (
                                                <div key={label} className="flex gap-3 rounded-xl bg-black/20 p-3">
                                                    <span className="w-16 shrink-0 text-xs font-semibold text-cyan-200">
                                                        {label}
                                                    </span>
                                                    <span className="text-sm text-slate-200">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <Video className="h-5 w-5 text-violet-300" />
                                            <p className="mt-3 text-2xl font-bold">Všechny</p>
                                            <p className="mt-1 text-xs text-slate-400">záznamy workshopů</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <UsersRound className="h-5 w-5 text-cyan-300" />
                                            <p className="mt-3 text-2xl font-bold">1× měsíčně</p>
                                            <p className="mt-1 text-xs text-slate-400">setkání naživo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pro-koho" className="scroll-mt-24 bg-slate-50 py-20 sm:py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <SectionIntro
                        eyebrow="Komunita kolem skutečné práce"
                        title={
                            <PersonalizedHeading name={personalizedName}>
                                najděte svůj pracovní kruh.
                            </PersonalizedHeading>
                        }
                        description="Nezáleží, zda píšete kód, tvoříte obsah nebo vedete malou firmu. Důležité je, že chcete AI používat prakticky a otevřeně sdílet, co funguje i co ne."
                    />
                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {audienceCards.map(({ icon: Icon, title, description }) => (
                            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="clenstvi" className="scroll-mt-24 py-20 sm:py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <SectionIntro
                        eyebrow="Tři úrovně, jedna komunita"
                        title="Vyberte si, jak blízko chcete být."
                        description={
                            <span className="[overflow-wrap:anywhere]">
                                {personalizedName
                                    ? `${personalizedName}, začít můžete zdarma. Standard otevře celý archiv a Premium vás dostane i k osobním setkáním a nejvyšší prioritě.`
                                    : 'Začít můžete zdarma. Standard otevře celý archiv a Premium vás dostane i k osobním setkáním a nejvyšší prioritě.'}
                            </span>
                        }
                    />

                    <div className="mt-8 flex justify-center">
                        <BillingCycleSelector billingCycle={billingCycle} onChange={setBillingCycle} />
                    </div>

                    <div className="mt-12 grid gap-6 lg:grid-cols-3">
                        {COMMUNITY_MEMBERSHIP_PLANS.map((plan) => (
                            <PricingCard
                                key={plan.id}
                                plan={plan}
                                billingCycle={billingCycle}
                                isSelected={plan.id === selectedPlanId}
                                communityRoomHref={communityRoomHref}
                                onSelect={selectPaidPlan}
                            />
                        ))}
                    </div>

                    <div className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">
                        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <p>
                            Ceny, názvy plánů a benefity se mohou do budoucna změnit. Když členství aktivujete teď,
                            základní měsíční cenu vybraného plánu vám držíme po celou dobu nepřerušeného členství, i
                            kdyby veřejná cena vzrostla. Rozsah služby se může přiměřeně měnit podle{' '}
                            <Link
                                href={getLegalPagePath('termsAndConditions', 'cs')}
                                className="font-semibold underline underline-offset-4"
                            >
                                obchodních podmínek
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid min-w-0 items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
                        <div className="min-w-0 lg:sticky lg:top-28">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                Záznam není vedlejší produkt
                            </p>
                            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                                Živě zdarma. Do hloubky kdykoli ve Standard a Premium.
                            </h2>
                            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                                Aktuální online workshopy jsou ještě výjimečně dostupné i po odvysílání. Další záznamy
                                už zůstanou členům Standard a Premium. Připojit se živě ale může dál každý člen Basic.
                            </p>
                            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <Rss className="h-5 w-5 shrink-0 text-cyan-300" />
                                <p className="text-sm text-slate-300">
                                    Standard i Premium dostanou také vlastní RSS kanál s novými materiály.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {deepDiveTopics.map(({ icon: Icon, label, detail }, index) => (
                                <article
                                    key={label}
                                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-mono text-xs text-slate-500">0{index + 1}</span>
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold">{label}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="porovnani" className="scroll-mt-24 bg-slate-50 py-20 sm:py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <SectionIntro
                        eyebrow="Bez drobného písma"
                        title="Porovnejte všechny benefity vedle sebe."
                        description="Každý vyšší plán automaticky obsahuje všechno z plánů pod ním."
                    />
                    <ComparisonTable billingCycle={billingCycle} />
                </div>
            </section>

            <section className="py-20 sm:py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-7 ring-1 ring-slate-200 sm:p-10 lg:p-14">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
                        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_.8fr]">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                                    <Crown className="h-3.5 w-3.5 text-cyan-300" /> Proč právě Premium
                                </div>
                                <h2 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
                                    Online komunita je užitečná. Osobní vztahy ji mění v síť.
                                </h2>
                                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                    Jednou měsíčně se potkáme naživo nad konkrétními projekty, slepými uličkami a tím,
                                    co právě funguje. Premium členové mají zároveň nejvyšší prioritu při volbě dalších
                                    materiálů a v odborné diskuzi.
                                </p>
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={() => selectPaidPlan('premium')}
                                    className="mt-7 rounded-full bg-slate-950 px-7 text-white hover:bg-slate-800"
                                >
                                    Chci být u toho
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                {[
                                    {
                                        icon: UsersRound,
                                        title: 'Setkání 1× měsíčně',
                                        text: 'Osobně, v malé skupině a s prostorem pro vaše téma.',
                                    },
                                    {
                                        icon: MessageCircleMore,
                                        title: 'Nejvyšší priorita',
                                        text: 'V otázkách, diskuzi i výběru materiálů, které vzniknou dál.',
                                    },
                                ].map(({ icon: Icon, title, text }) => (
                                    <div
                                        key={title}
                                        className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm"
                                    >
                                        <Icon className="h-5 w-5 text-cyan-700" />
                                        <h3 className="mt-3 font-bold text-slate-950">{title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id={REGISTRATION_SECTION_ID}
                className="scroll-mt-20 overflow-hidden bg-[#071827] py-20 text-white sm:py-24"
            >
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid min-w-0 items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
                        <div className="min-w-0 lg:sticky lg:top-28">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                Začněte bez rizika
                            </p>
                            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                                <PersonalizedHeading name={personalizedName} tone="dark">
                                    vyzkoušejte {registrationPlan.name} sedm dní zdarma.
                                </PersonalizedHeading>
                            </h2>
                            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                                Přihlášku teď uložíme a na e-mail pošleme aktivační odkaz. Teprve jeho dokončením začne
                                trial; tento formulář nic nestrhává a nechce údaje z platební karty.
                            </p>

                            <div className="mt-8 space-y-4">
                                {[
                                    {
                                        icon: Sparkles,
                                        text: `${COMMUNITY_MEMBERSHIP_TRIAL_DAYS} dní plného přístupu zdarma`,
                                    },
                                    {
                                        icon: LockKeyhole,
                                        text: 'Zamknutá základní cena po dobu nepřerušeného členství',
                                    },
                                    { icon: ReceiptText, text: 'Roční sleva i slevový kód se ukážou zvlášť' },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="min-w-0 rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-2xl sm:p-8">
                            {submittedMembership === null ? (
                                <form onSubmit={handleSubmit} noValidate className="min-w-0">
                                    <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
                                                Vybrané členství
                                            </p>
                                            <h3 className="mt-2 text-2xl font-bold text-slate-950">
                                                {selectedPlan.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">{selectedPlan.description}</p>
                                        </div>
                                        <div className="grid shrink-0 grid-cols-2 rounded-xl bg-slate-100 p-1">
                                            {(['standard', 'premium'] as const).map((planId) => (
                                                <button
                                                    key={planId}
                                                    type="button"
                                                    onClick={() => setSelectedPlanId(planId)}
                                                    className={cn(
                                                        'rounded-lg px-3 py-2 text-xs font-semibold transition',
                                                        selectedPlanId === planId
                                                            ? 'bg-white text-slate-950 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800',
                                                    )}
                                                    aria-pressed={selectedPlanId === planId}
                                                >
                                                    {planId === 'standard' ? 'Standard' : 'Premium'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <BillingCycleSelector billingCycle={billingCycle} onChange={setBillingCycle} />
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="membership-fullname"
                                                className="text-sm font-semibold text-slate-700"
                                            >
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
                                                    showValidation &&
                                                        fullnameError &&
                                                        'border-red-300 bg-red-50 focus-visible:ring-red-200',
                                                )}
                                            />
                                            {showValidation && fullnameError && (
                                                <p className="mt-1 text-xs text-red-600">{fullnameError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="membership-email"
                                                className="text-sm font-semibold text-slate-700"
                                            >
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
                                                    showValidation &&
                                                        emailError &&
                                                        'border-red-300 bg-red-50 focus-visible:ring-red-200',
                                                )}
                                            />
                                            {showValidation && emailError && (
                                                <p className="mt-1 text-xs text-red-600">{emailError}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <DiscountCodeField
                                            inputId="membership-discount"
                                            validation={discountCodeValidation}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <PriceSummary
                                            plan={selectedPlan}
                                            price={membershipPrice}
                                            billingCycle={billingCycle}
                                        />
                                    </div>

                                    <div
                                        className={cn(
                                            'mt-5 flex items-start gap-3 rounded-xl border p-4',
                                            showValidation && !termsAccepted
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-slate-200 bg-white',
                                        )}
                                    >
                                        <Checkbox
                                            id="membership-terms"
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                            className="mt-0.5"
                                            aria-invalid={showValidation && !termsAccepted}
                                        />
                                        <label
                                            htmlFor="membership-terms"
                                            className="text-xs leading-relaxed text-slate-600"
                                        >
                                            Seznámil/a jsem se s{' '}
                                            <Link
                                                href={getLegalPagePath('termsAndConditions', 'cs')}
                                                target="_blank"
                                                className="font-semibold text-cyan-700 underline underline-offset-4"
                                            >
                                                obchodními podmínkami
                                            </Link>{' '}
                                            a beru na vědomí sedmidenní trial, navazující zvolenou frekvenci platby,
                                            garanci základní ceny i pravidla změny či ukončení členství.
                                        </label>
                                    </div>
                                    {showValidation && !termsAccepted && (
                                        <p className="mt-2 text-xs text-red-600">Potvrďte prosím obchodní podmínky.</p>
                                    )}

                                    {errorMessage && (
                                        <p
                                            role="alert"
                                            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                                        >
                                            {errorMessage}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting || discountCodeValidation.isValidationPending}
                                        className="mt-6 h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-600 px-4 py-3 text-sm leading-tight text-white hover:bg-cyan-700 sm:text-base"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Rocket className="mr-2 h-4 w-4" />
                                        )}
                                        Odeslat přihlášku a získat 7 dní zdarma
                                    </Button>
                                    <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                                        Odesláním ještě nevzniká platba. Aktivační krok vám přijde e-mailem.
                                    </p>
                                    <PersonalDataConsentNote
                                        language="cs"
                                        className="mt-3 text-center text-slate-500"
                                    />
                                </form>
                            ) : submittedPlan !== null ? (
                                <div className="py-4 text-center" role="status">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <CircleCheck className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-5 text-2xl font-bold text-slate-950">
                                        Přihlášku k členství máme
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-600">
                                        Na <strong>{submittedMembership.email}</strong> pošleme aktivační odkaz pro{' '}
                                        {submittedMembership.planName}. Teprve jeho dokončením začne{' '}
                                        {submittedMembership.trialDays}denní zkušební doba.
                                    </p>
                                    <div className="mx-auto mt-6 max-w-lg text-left">
                                        <PriceSummary
                                            plan={submittedPlan}
                                            price={submittedMembership.membershipPrice}
                                            billingCycle={submittedMembership.billingCycle}
                                        />
                                    </div>
                                    <Button asChild variant="outline" className="mt-6 rounded-xl">
                                        <Link href={communityRoomHref}>Mezitím otevřít komunitu Basic</Link>
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>

            <FAQSection
                faqs={membershipFaqs}
                eyebrow="Otázky k členství"
                title="Všechno důležité před prvním dnem."
                description="Jasná cena, jasné rozdíly a žádná platba při odeslání formuláře."
            />

            <Footer
                language="cs"
                isTechnologyIncubationShown={false}
                productLinks={[
                    { href: '#clenstvi', text: 'Členství komunity' },
                    { href: COMMUNITY_PATH, text: 'Komunitní místnost' },
                    { href: '/cs/online-workshop', text: 'Online workshopy' },
                    { href: '/branding', text: 'Branding' },
                ]}
            />
        </main>
    );
}
