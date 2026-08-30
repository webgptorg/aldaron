'use client';

import { COMMUNITY_MEMBERSHIP_SECTION_ID } from '@/businesses/community/config';
import { formatCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { CommunityMembershipPurchasePanel } from '@/businesses/community/membership/CommunityMembershipPurchasePanel';
import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import {
    isPaidCommunityMembershipStatus,
    type CommunityMembershipRoomState,
} from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { CheckCircle2, Crown, Info, LoaderCircle, X } from 'lucide-react';
import { useEffect } from 'react';

function createPaidMembershipDescription(membership: CommunityMembershipRoomState): string {
    const priceDescription =
        membership.monthlyPriceCzk === null
            ? 'Členství je aktivní.'
            : `Platíte ${formatCommunityMembershipPrice(membership.monthlyPriceCzk)} měsíčně.`;
    const periodDescription =
        membership.currentPeriodEndsAt === null
            ? ''
            : ` Zaplaceno do ${formatCzechWorkshopDay(membership.currentPeriodEndsAt)}.`;
    const overdueDescription =
        membership.status === 'past-due'
            ? ' Poslední platba neprošla – zkontrolujte prosím kartu, přístup vám zatím zůstává.'
            : '';

    return `${priceDescription}${periodDescription}${overdueDescription}`;
}

/**
 * The paid membership as it is offered, bought, and confirmed inside the community room itself.
 *
 * Note: A member who already pays is not sold anything again, and a room whose server has no payment gate says
 *       nothing about a membership at all rather than offering a button which cannot work.
 */
export function CommunityMembershipSection() {
    const membershipRoom = useCommunityMembershipRoom();
    const ensureMembershipLoaded = membershipRoom?.ensureMembershipLoaded;

    useEffect(() => {
        ensureMembershipLoaded?.();
    }, [ensureMembershipLoaded]);

    if (membershipRoom === null) {
        return null;
    }

    const { membership, isMembershipLoading, isCheckoutStarting, errorMessage, checkoutResult } = membershipRoom;
    const isPaid = membership !== null && isPaidCommunityMembershipStatus(membership.status);
    const isPurchasePanelShown = membership !== null && !isPaid && membership.isPurchaseOffered;
    const isSectionShown =
        isPaid || isPurchasePanelShown || isMembershipLoading || checkoutResult !== null || errorMessage !== null;

    if (!isSectionShown) {
        return null;
    }

    return (
        <section
            id={COMMUNITY_MEMBERSHIP_SECTION_ID}
            aria-labelledby="community-membership-title"
            className="mt-5 scroll-mt-24 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"
        >
            {checkoutResult !== null && (
                <div
                    role="status"
                    className={`mb-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                        checkoutResult === 'paid'
                            ? 'border-emerald-300/25 bg-emerald-300/[0.09] text-emerald-100'
                            : 'border-amber-300/25 bg-amber-300/[0.08] text-amber-100'
                    }`}
                >
                    <span className="flex min-w-0 items-start gap-2">
                        {checkoutResult === 'paid' ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        ) : (
                            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                        <span className="min-w-0">
                            {checkoutResult === 'paid'
                                ? 'Platba proběhla. Placené členství je vaše, díky!'
                                : 'Platba nebyla dokončena. Členství si můžete pořídit kdykoli později.'}
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={membershipRoom.dismissCheckoutResult}
                        className="shrink-0 rounded-full p-1 transition hover:bg-white/10"
                        aria-label="Skrýt zprávu o platbě"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Členství</p>
                <h2
                    id="community-membership-title"
                    className="mt-1 flex items-center gap-2 text-xl font-bold text-white"
                >
                    {isPaid && <Crown className="h-5 w-5 text-amber-300" aria-hidden="true" />}
                    {isPaid ? 'Placené členství je aktivní' : 'Placené členství komunity'}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                    {isPaid && membership !== null
                        ? createPaidMembershipDescription(membership)
                        : 'Živé webináře zůstávají zdarma. Placené členství přidává záznamy, archiv, praktické materiály a přednost pro vaše dotazy.'}
                </p>
            </div>

            {isMembershipLoading && membership === null && (
                <div className="flex min-h-24 items-center justify-center text-sm text-slate-400">
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-cyan-300" /> Načítám členství…
                </div>
            )}

            {isPurchasePanelShown && membership !== null ? (
                <CommunityMembershipPurchasePanel
                    isPaymentInTestMode={membership.isPaymentInTestMode}
                    isCheckoutStarting={isCheckoutStarting}
                    errorMessage={errorMessage}
                    onPay={(discountCode) => void membershipRoom.startCheckout(discountCode)}
                />
            ) : (
                errorMessage !== null && (
                    <p
                        role="alert"
                        className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
                    >
                        {errorMessage}
                    </p>
                )
            )}
        </section>
    );
}
