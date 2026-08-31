'use client';

import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
    getCommunityMembershipFeature,
    type CommunityMembershipFeatureId,
} from '@/businesses/community/membership/communityMembershipConfig';
import {
    createCommunityMembershipPrice,
    formatCommunityMembershipPrice,
} from '@/businesses/community/membership/communityMembershipPrice';
import { CommunityMembershipPriceDisplay } from '@/businesses/community/membership/CommunityMembershipPriceDisplay';
import { CommunityMembershipTestModeNote } from '@/businesses/community/membership/CommunityMembershipTestModeNote';
import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import {
    isDiscountCodeReadyForSubmission,
    useDiscountCodeValidation,
} from '@/lib/discounts/useDiscountCodeValidation';
import { getLegalLink } from '@/lib/legal/legalLinks';
import {
    BookOpenCheck,
    Check,
    CreditCard,
    Crown,
    FolderGit2,
    Loader2,
    MessageSquareText,
    Rss,
    ShieldCheck,
    Sparkles,
    Video,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

const MONTHLY_BILLING_PERIOD = 'monthly' as const;

/**
 * No code is prefilled inside the room, so the same empty answer is reused instead of a new object on every render.
 */
const NO_INITIAL_ACTIVE_DISCOUNTS: ActiveDiscountByPlaceId = {};

/** The offer keeps its feature names in the shared membership registry; this only gives each current benefit a visual cue. */
const PAID_MEMBERSHIP_FEATURE_ICON_BY_ID: Readonly<Partial<Record<CommunityMembershipFeatureId, LucideIcon>>> = {
    'paid-discord': MessageSquareText,
    'workshop-recordings': Video,
    'exclusive-content': BookOpenCheck,
    'creation-showcase': Sparkles,
    'workshop-question-priority': Crown,
    'materials-rss': Rss,
};

type CommunityMembershipPurchasePanelProps = {
    readonly isPaymentInTestMode: boolean;
    readonly isCheckoutStarting: boolean;
    readonly errorMessage: string | null;
    readonly onPay: (discountCode: string) => void;
};

function getPaidMembershipFeatureIcon(featureId: CommunityMembershipFeatureId): LucideIcon {
    return PAID_MEMBERSHIP_FEATURE_ICON_BY_ID[featureId] ?? FolderGit2;
}

function CommunityMembershipFeatureGrid() {
    const featureIds = CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.addedFeatureIds;

    return (
        <section
            aria-labelledby="community-membership-benefits-title"
            className="relative overflow-hidden rounded-[1.75rem] border border-cyan-100/15 bg-gradient-to-br from-cyan-300/[0.12] via-[#0d2733] to-[#071923] p-4 shadow-2xl shadow-cyan-950/20 sm:p-5"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-200/10 blur-3xl"
            />
            <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">Členství zahrnuje</p>
                        <h3 id="community-membership-benefits-title" className="mt-1 text-lg font-bold text-white">
                            Vše, co využijete i po vysílání
                        </h3>
                    </div>
                    <span className="rounded-full border border-cyan-100/15 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {featureIds.length} výhod v ceně
                    </span>
                </div>

                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {featureIds.map((featureId) => {
                        const feature = getCommunityMembershipFeature(featureId);
                        const FeatureIcon = getPaidMembershipFeatureIcon(featureId);

                        return (
                            <li
                                key={featureId}
                                className="group flex min-h-20 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/30 hover:bg-white/[0.08]"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-200/10 text-cyan-200 ring-1 ring-cyan-100/15">
                                    <FeatureIcon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="flex-1 text-sm font-semibold leading-5 text-slate-100">{feature.label}</span>
                                <Check className="h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

/**
 * The offer of the paid membership as a connected member meets it: what it adds, what it costs them, and the one
 * button which opens the payment gate.
 *
 * Note: Neither a name nor an address is asked for again. The room already knows who is reading it, which is exactly
 *       what buying the membership here instead of on a public page is for.
 */
export function CommunityMembershipPurchasePanel({
    isPaymentInTestMode,
    isCheckoutStarting,
    errorMessage,
    onPay,
}: CommunityMembershipPurchasePanelProps) {
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);
    const [isValidationShown, setIsValidationShown] = useState(false);
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode: '',
        initialActiveDiscountByPlaceId: NO_INITIAL_ACTIVE_DISCOUNTS,
        discountPlaceId: COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    });
    // The button asks for exactly what the card will be charged, discount included, rather than for the list price.
    const price = createCommunityMembershipPrice(
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
        MONTHLY_BILLING_PERIOD,
        discountCodeValidation.activeDiscount,
    );

    const isDiscountCodeReady = isDiscountCodeReadyForSubmission(discountCodeValidation);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!areTermsAccepted || !isDiscountCodeReady) {
            setIsValidationShown(true);
            return;
        }

        setIsValidationShown(false);
        onPay(discountCodeValidation.discountCode);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" noValidate>
            <CommunityMembershipFeatureGrid />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-cyan-100/15 bg-[#06141d] p-4 shadow-2xl shadow-slate-950/30">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl"
                />
                <div className="relative">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-cyan-200">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-200/10 text-cyan-100">
                                <Crown className="h-4 w-4" aria-hidden="true" />
                            </span>
                            Placené členství
                        </div>
                        <CommunityMembershipPriceDisplay
                            className="mt-4"
                            planId={CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID}
                            billingPeriod={MONTHLY_BILLING_PERIOD}
                            activeDiscount={discountCodeValidation.activeDiscount}
                            appearance="dark"
                        />
                    </div>

                    <div className="mt-4">
                        <DiscountCodeField
                            inputId="community-room-membership-discount-code"
                            validation={discountCodeValidation}
                            appearance="dark"
                        />
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-3 text-sm leading-6 text-slate-300">
                        <Checkbox
                            checked={areTermsAccepted}
                            onCheckedChange={(checked) => setAreTermsAccepted(checked === true)}
                            className="mt-1 border-white/25 data-[state=checked]:border-cyan-300 data-[state=checked]:bg-cyan-300 data-[state=checked]:text-slate-950"
                            aria-label="Souhlasím s obchodními podmínkami"
                        />
                        <span>
                            Souhlasím s{' '}
                            <Link
                                href={getLegalLink('termsAndConditions', 'cs').href}
                                className="font-semibold text-cyan-200 underline underline-offset-4"
                            >
                                obchodními podmínkami
                            </Link>{' '}
                            a beru na vědomí, že platba se opakuje každý měsíc.
                        </span>
                    </label>
                    {isValidationShown && (!areTermsAccepted || !isDiscountCodeReady) && (
                        <p className="mt-1 text-xs text-rose-300">
                            {areTermsAccepted
                                ? COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotUsable
                                : COMMUNITY_MEMBERSHIP_MESSAGES.termsNotAccepted}
                        </p>
                    )}

                    {errorMessage !== null && (
                        <p
                            role="alert"
                            className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
                        >
                            {errorMessage}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isCheckoutStarting || discountCodeValidation.isValidationPending}
                        className="mt-4 h-12 w-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-200 to-sky-300 text-base font-bold text-slate-950 shadow-lg shadow-cyan-400/15 hover:from-cyan-200 hover:via-cyan-100 hover:to-sky-200"
                    >
                        {isCheckoutStarting ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        {isCheckoutStarting
                            ? 'Otevírám platbu…'
                            : `Zaplatit ${formatCommunityMembershipPrice(price.finalMonthlyEquivalentCzk)} / měsíc`}
                    </Button>
                    <p className="mt-3 flex gap-2 text-xs leading-5 text-slate-400">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
                        Platíte přes zabezpečenou bránu Stripe, kartu nikdy nevidíme. Zrušit můžete kdykoli přímo v
                        komunitě.
                    </p>

                    <CommunityMembershipTestModeNote isPaymentInTestMode={isPaymentInTestMode} />
                </div>
            </div>
        </form>
    );
}
