'use client';

import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
    getCommunityMembershipFeature,
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
import { Check, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

const MONTHLY_BILLING_PERIOD = 'monthly' as const;

/**
 * No code is prefilled inside the room, so the same empty answer is reused instead of a new object on every render.
 */
const NO_INITIAL_ACTIVE_DISCOUNTS: ActiveDiscountByPlaceId = {};

type CommunityMembershipPurchasePanelProps = {
    readonly isPaymentInTestMode: boolean;
    readonly isCheckoutStarting: boolean;
    readonly errorMessage: string | null;
    readonly onPay: (discountCode: string) => void;
};

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
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.addedFeatureIds.map((featureId) => (
                    <li key={featureId} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                        {getCommunityMembershipFeature(featureId).label}
                    </li>
                ))}
            </ul>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <CommunityMembershipPriceDisplay
                    planId={CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID}
                    billingPeriod={MONTHLY_BILLING_PERIOD}
                    activeDiscount={discountCodeValidation.activeDiscount}
                    appearance="dark"
                />

                <div className="mt-4">
                    <DiscountCodeField
                        inputId="community-room-membership-discount-code"
                        validation={discountCodeValidation}
                        appearance="dark"
                    />
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-300">
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
                    className="mt-4 h-12 w-full rounded-full bg-cyan-300 text-base font-bold text-slate-950 hover:bg-cyan-200"
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
                <p className="mt-3 text-xs leading-5 text-slate-500">
                    Platíte přes zabezpečenou bránu Stripe, kartu nikdy nevidíme. Zrušit můžete kdykoli přímo v
                    komunitě.
                </p>

                <CommunityMembershipTestModeNote isPaymentInTestMode={isPaymentInTestMode} />
            </div>
        </form>
    );
}
