'use client';

import { formatCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { CommunityMembershipPurchasePanel } from '@/businesses/community/membership/CommunityMembershipPurchasePanel';
import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { CommunityMembershipSubscriptionManagement } from '@/businesses/community/membership/CommunityMembershipSubscriptionManagement';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    isPaidCommunityMembershipStatus,
    type CommunityMembershipRoomState,
} from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { CheckCircle2, Crown, Info, LoaderCircle, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';

function createPaidMembershipDescription(membership: CommunityMembershipRoomState): string {
    const priceDescription =
        membership.monthlyPriceCzk === null
            ? 'Členství je aktivní.'
            : `Platíte ${formatCommunityMembershipPrice(membership.monthlyPriceCzk)} měsíčně.`;
    const periodDescription = membership.currentPeriodEndsAt === null ? '' : ` Zaplaceno do ${formatCzechWorkshopDay(membership.currentPeriodEndsAt)}.`;
    const cancellationDescription = membership.isCancellationScheduled ? ' Další platbu jste zrušili.' : '';
    const overdueDescription =
        membership.status === 'past-due'
            ? ' Poslední platba neprošla – zkontrolujte prosím kartu, přístup vám zatím zůstává.'
            : '';

    return `${priceDescription}${periodDescription}${cancellationDescription}${overdueDescription}`;
}

/**
 * The status, offer, and Stripe gate of one member's community membership.
 *
 * Note: This owns the only membership request in the connected room. The header badge deliberately only reflects the
 *       shared state, so opening a modal never creates a second identity or payment flow.
 */
export function CommunityMembershipModal() {
    const membershipRoom = useCommunityMembershipRoom();
    const ensureMembershipLoaded = membershipRoom?.ensureMembershipLoaded;

    useEffect(() => {
        ensureMembershipLoaded?.();
    }, [ensureMembershipLoaded]);

    if (membershipRoom === null) {
        return null;
    }

    const {
        membership,
        isMembershipLoading,
        isCheckoutStarting,
        isMembershipCancellationChanging,
        isMembershipPortalOpening,
        errorMessage,
        checkoutResult,
    } = membershipRoom;
    const isPaid = membership !== null && isPaidCommunityMembershipStatus(membership.status);
    const isCancellationScheduled = isPaid && membership?.isCancellationScheduled === true;
    const isPurchasePanelShown = membership !== null && !isPaid && membership.isPurchaseOffered;
    const isMembershipDetailsShown = isPaid || isPurchasePanelShown;

    return (
        <Dialog open={membershipRoom.isMembershipModalOpen} onOpenChange={membershipRoom.setIsMembershipModalOpen}>
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl gap-0 overflow-y-auto rounded-[2rem] border-cyan-100/15 bg-[#061923] p-0 text-slate-100 shadow-[0_32px_100px_rgba(2,16,24,0.7)] [&>button]:right-5 [&>button]:top-5 [&>button]:z-20 [&>button]:rounded-full [&>button]:text-slate-300 [&>button]:hover:bg-white/10 [&>button]:hover:text-white">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-28 -top-36 h-80 w-80 rounded-full bg-cyan-300/[0.08] blur-3xl" />
                    <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-sky-300/[0.06] blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(180,245,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(180,245,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>

                <div className="relative border-b border-white/10 bg-white/[0.015] px-5 py-5 pr-12 sm:px-7 sm:py-6">
                    <DialogHeader className="gap-2">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-100/15 bg-cyan-200/10 text-cyan-100 shadow-inner shadow-cyan-100/10">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Členství</p>
                        </div>
                        <DialogTitle className="flex items-center gap-2 text-2xl tracking-tight text-white">
                            <Crown className="h-5 w-5 text-amber-200" aria-hidden="true" />
                            {isPaid
                                ? isCancellationScheduled
                                    ? 'Placené členství končí'
                                    : 'Placené členství je aktivní'
                                : 'Placené členství komunity'}
                        </DialogTitle>
                        <DialogDescription className="max-w-2xl leading-6 text-slate-400">
                            {isPaid && membership !== null
                                ? createPaidMembershipDescription(membership)
                                : 'Živé webináře zůstávají zdarma. Placené členství přidává záznamy, archiv, praktické materiály a přednost pro vaše dotazy.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {checkoutResult !== null && (
                    <div
                        role="status"
                        className={`relative mx-5 mt-5 flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-slate-950/10 sm:mx-7 ${
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

                <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-7">
                    {isMembershipLoading && membership === null && (
                        <div className="flex min-h-24 items-center justify-center text-sm text-slate-400">
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-cyan-300" /> Načítám členství…
                        </div>
                    )}

                    {isPurchasePanelShown && membership !== null && (
                        <CommunityMembershipPurchasePanel
                            isPaymentInTestMode={membership.isPaymentInTestMode}
                            isCheckoutStarting={isCheckoutStarting}
                            errorMessage={errorMessage}
                            onPay={(discountCode) => void membershipRoom.startCheckout(discountCode)}
                        />
                    )}

                    {isPaid && membership !== null && (
                        <CommunityMembershipSubscriptionManagement
                            membership={membership}
                            isMembershipCancellationChanging={isMembershipCancellationChanging}
                            isMembershipPortalOpening={isMembershipPortalOpening}
                            errorMessage={errorMessage}
                            onScheduleCancellation={membershipRoom.scheduleCancellation}
                            onReactivate={membershipRoom.reactivateMembership}
                            onOpenMembershipPortal={membershipRoom.openMembershipPortal}
                        />
                    )}

                    {!isMembershipLoading && !isMembershipDetailsShown && errorMessage !== null && (
                        <p
                            role="alert"
                            className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
                        >
                            {errorMessage}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
