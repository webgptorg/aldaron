'use client';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { CalendarClock, Loader2, RotateCcw } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

type CommunityMembershipSubscriptionManagementProps = {
    readonly membership: CommunityMembershipRoomState;
    readonly isMembershipCancellationChanging: boolean;
    readonly errorMessage: string | null;
    readonly onScheduleCancellation: () => Promise<boolean>;
    readonly onReactivate: () => Promise<boolean>;
};

function createPaidAccessEndDescription(currentPeriodEndsAt: string | null): string {
    return currentPeriodEndsAt === null
        ? 'po dobu již zaplaceného období'
        : `do ${formatCzechWorkshopDay(currentPeriodEndsAt)}`;
}

/**
 * Lets a paying member stop or restore automatic renewal without turning the already-paid part of their membership
 * into a second, confusing lifecycle.
 */
export function CommunityMembershipSubscriptionManagement({
    membership,
    isMembershipCancellationChanging,
    errorMessage,
    onScheduleCancellation,
    onReactivate,
}: CommunityMembershipSubscriptionManagementProps) {
    const [isCancellationConfirmationOpen, setIsCancellationConfirmationOpen] = useState(false);
    const paidAccessEndDescription = createPaidAccessEndDescription(membership.currentPeriodEndsAt);

    const handleCancellationConfirmation = async (event: MouseEvent<HTMLButtonElement>) => {
        // Wait for the server before closing the confirmation so a second click cannot create another cancellation
        // request. The main membership modal shows any refusal once this confirmation closes.
        event.preventDefault();
        await onScheduleCancellation();
        setIsCancellationConfirmationOpen(false);
    };

    if (!membership.isSubscriptionManagementOffered) {
        return null;
    }

    if (membership.isCancellationScheduled) {
        return (
            <section className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-4">
                <div className="flex items-start gap-3">
                    <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
                    <div>
                        <h3 className="font-semibold text-amber-50">Ukončení je naplánované</h3>
                        <p className="mt-1 text-sm leading-6 text-amber-100/85">
                            Další platbu už nestrhneme. Placené výhody vám zůstanou {paidAccessEndDescription}; potom
                            se členství automaticky přepne na Free členství.
                        </p>
                    </div>
                </div>

                {errorMessage !== null && (
                    <p
                        role="alert"
                        className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
                    >
                        {errorMessage}
                    </p>
                )}

                <Button
                    type="button"
                    disabled={isMembershipCancellationChanging}
                    onClick={() => void onReactivate()}
                    className="mt-4 rounded-full bg-amber-200 font-bold text-slate-950 hover:bg-amber-100"
                >
                    {isMembershipCancellationChanging ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    Obnovit placené členství
                </Button>
            </section>
        );
    }

    return (
        <section className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <h3 className="font-semibold text-white">Správa členství</h3>
            <p className="mt-1 text-sm leading-6 text-slate-300">
                Členství se obnovuje každý měsíc. Když jeho obnovení zrušíte, placené výhody vám zůstanou{' '}
                {paidAccessEndDescription}.
            </p>

            {errorMessage !== null && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
                >
                    {errorMessage}
                </p>
            )}

            <AlertDialog open={isCancellationConfirmationOpen} onOpenChange={setIsCancellationConfirmationOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isMembershipCancellationChanging}
                        className="mt-4 rounded-full border-rose-300/35 bg-transparent text-rose-100 hover:bg-rose-300/10 hover:text-rose-50"
                    >
                        Zrušit placené členství
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-white/10 bg-[#0a1d27] text-slate-100 sm:rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Opravdu chcete zrušit placené členství?</AlertDialogTitle>
                        <AlertDialogDescription className="leading-6 text-slate-300">
                            Další platbu už nestrhneme. Placené výhody vám přesto zůstanou {paidAccessEndDescription}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isMembershipCancellationChanging}
                            className="border-white/20 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"
                        >
                            Nechat aktivní
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isMembershipCancellationChanging}
                            onClick={(event) => void handleCancellationConfirmation(event)}
                            className="bg-rose-500 text-white hover:bg-rose-400"
                        >
                            {isMembershipCancellationChanging && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            )}
                            Ano, zrušit obnovu
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
