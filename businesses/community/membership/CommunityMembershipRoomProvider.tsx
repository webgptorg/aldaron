'use client';

import {
    createUrlWithoutCommunityMembershipCheckoutReturn,
    readCommunityMembershipCheckoutReturn,
    type CommunityMembershipCheckoutResult,
    type CommunityMembershipCheckoutReturn,
} from '@/businesses/community/membership/communityMembershipCheckoutReturn';
import {
    confirmCommunityMembershipCheckout,
    fetchCommunityMembership,
    startCommunityMembershipCheckout,
} from '@/businesses/community/membership/communityMembershipRoomApi';
import { JsonRequestError } from '@/lib/api/requestJson';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type CommunityMembershipRoomController = {
    /**
     * The membership of the connected member, or `null` while it is not known yet
     */
    readonly membership: CommunityMembershipRoomState | null;
    readonly isMembershipLoading: boolean;
    readonly isCheckoutStarting: boolean;
    readonly errorMessage: string | null;

    /**
     * What the payment gate said about the member who has just come back, until they close it
     */
    readonly checkoutResult: CommunityMembershipCheckoutResult | null;

    /**
     * Whether the member has opened the membership details from their room badge.
     */
    readonly isMembershipModalOpen: boolean;

    /**
     * Asks for the membership once, however many surfaces of the room want to know it
     */
    readonly ensureMembershipLoaded: () => void;
    readonly startCheckout: (discountCode: string) => Promise<void>;
    readonly dismissCheckoutResult: () => void;
    readonly openMembershipModal: () => void;
    readonly setIsMembershipModalOpen: (isMembershipModalOpen: boolean) => void;
};

const CommunityMembershipRoomContext = createContext<CommunityMembershipRoomController | null>(null);

const UNAUTHORIZED_STATUS = 401;

/**
 * What a room which is being rendered without a browser around it knows about a return from the gate, which is nothing
 */
const EMPTY_CHECKOUT_RETURN: CommunityMembershipCheckoutReturn = { result: null, checkoutSessionId: null };

function isConnectionRequiredError(error: unknown): boolean {
    return error instanceof JsonRequestError && error.status === UNAUTHORIZED_STATUS;
}

function getMembershipErrorMessage(error: unknown, fallbackMessage: string): string | null {
    // A member whose room session has expired is asked to connect by the room itself, so the membership says nothing.
    if (isConnectionRequiredError(error)) {
        return null;
    }

    return error instanceof Error ? error.message : fallbackMessage;
}

/**
 * Holds the membership of the connected member for the whole community room.
 *
 * Note: The badge in the header and the membership modal are two views of one membership, so they read one state and
 *       cause one request between them.
 */
export function CommunityMembershipRoomProvider({ children }: { readonly children: ReactNode }) {
    // The address the gate returned with is read while the room is still being built, because the surfaces inside it
    // ask for the membership as soon as they appear and that request is what confirms the payment.
    const [checkoutReturn] = useState<CommunityMembershipCheckoutReturn>(() =>
        typeof window === 'undefined'
            ? EMPTY_CHECKOUT_RETURN
            : readCommunityMembershipCheckoutReturn(window.location.search),
    );
    const [membership, setMembership] = useState<CommunityMembershipRoomState | null>(null);
    const [isMembershipLoading, setIsMembershipLoading] = useState(false);
    const [isCheckoutStarting, setIsCheckoutStarting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [checkoutResult, setCheckoutResult] = useState<CommunityMembershipCheckoutResult | null>(
        checkoutReturn.result,
    );
    const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
    const isMembershipRequestedRef = useRef(false);
    const checkoutSessionIdRef = useRef<string | null>(checkoutReturn.checkoutSessionId);

    // What the gate added to the address is taken out of it again, so that reloading the room neither confirms the
    // same payment a second time nor keeps celebrating it.
    useEffect(() => {
        if (checkoutReturn.result === null) {
            return;
        }

        window.history.replaceState(
            window.history.state,
            '',
            createUrlWithoutCommunityMembershipCheckoutReturn(window.location.href),
        );
    }, [checkoutReturn.result]);

    // The result used to be visible in the in-page membership section. Opening the modal for a returning member keeps
    // that confirmation or cancellation visible after moving the surface out of the room layout.
    useEffect(() => {
        if (checkoutResult !== null) {
            setIsMembershipModalOpen(true);
        }
    }, [checkoutResult]);

    const ensureMembershipLoaded = useCallback(() => {
        if (isMembershipRequestedRef.current) {
            return;
        }

        isMembershipRequestedRef.current = true;
        setIsMembershipLoading(true);
        const checkoutSessionId = checkoutSessionIdRef.current;
        checkoutSessionIdRef.current = null;

        // A member coming back from the gate has their payment confirmed in the very request which loads their
        // membership, so a paid membership is theirs immediately instead of when the webhook happens to arrive.
        const loadedMembership =
            checkoutSessionId === null
                ? fetchCommunityMembership()
                : confirmCommunityMembershipCheckout(checkoutSessionId).catch((error: unknown) => {
                      if (isConnectionRequiredError(error)) {
                          throw error;
                      }

                      console.error('Failed to confirm the community membership payment:', error);
                      return fetchCommunityMembership();
                  });

        void loadedMembership
            .then((loadedState) => {
                setMembership(loadedState);
                setErrorMessage(null);
            })
            .catch((error: unknown) => {
                // A member whose room session had expired is asked about again once they connect anew, because the
                // room brings its surfaces back and this is what they ask.
                isMembershipRequestedRef.current = !isConnectionRequiredError(error);
                setErrorMessage(getMembershipErrorMessage(error, COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded));
            })
            .finally(() => setIsMembershipLoading(false));
    }, []);

    const startCheckout = useCallback(async (discountCode: string) => {
        setIsCheckoutStarting(true);
        setErrorMessage(null);

        try {
            const { checkoutUrl } = await startCommunityMembershipCheckout({ discountCode, termsAccepted: true });
            trackGoogleAnalyticsEvent('community_membership_checkout_started', {
                has_discount_code: discountCode.trim() !== '',
            });
            window.location.assign(checkoutUrl);
        } catch (error) {
            // A member who pressed the button is always answered, including when it was their room session which
            // expired, because a button which silently does nothing is the one thing they cannot act on.
            setErrorMessage(
                isConnectionRequiredError(error)
                    ? COMMUNITY_MEMBERSHIP_MESSAGES.connectionExpired
                    : getMembershipErrorMessage(error, COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened),
            );
            setIsCheckoutStarting(false);
        }
    }, []);

    const dismissCheckoutResult = useCallback(() => setCheckoutResult(null), []);
    const openMembershipModal = useCallback(() => setIsMembershipModalOpen(true), []);

    return (
        <CommunityMembershipRoomContext.Provider
            value={{
                membership,
                isMembershipLoading,
                isCheckoutStarting,
                errorMessage,
                checkoutResult,
                isMembershipModalOpen,
                ensureMembershipLoaded,
                startCheckout,
                dismissCheckoutResult,
                openMembershipModal,
                setIsMembershipModalOpen,
            }}
        >
            {children}
        </CommunityMembershipRoomContext.Provider>
    );
}

/**
 * The membership of the connected member, or `null` outside the community room
 */
export function useCommunityMembershipRoom(): CommunityMembershipRoomController | null {
    return useContext(CommunityMembershipRoomContext);
}
