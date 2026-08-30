import type Stripe from 'stripe';

const MILLISECONDS_IN_SECOND = 1_000;

/**
 * When the period a member has already paid for runs out, or `null` while the gate names no period at all.
 *
 * Note: The gate records that period on every item of a subscription rather than on the subscription itself, so the
 *       last of them is the moment the whole membership is paid up to.
 */
export function readSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
    const periodEndSeconds = subscription.items.data.reduce<number | null>(
        (latestPeriodEndSeconds, subscriptionItem) =>
            latestPeriodEndSeconds === null || subscriptionItem.current_period_end > latestPeriodEndSeconds
                ? subscriptionItem.current_period_end
                : latestPeriodEndSeconds,
        null,
    );

    return periodEndSeconds === null ? null : new Date(periodEndSeconds * MILLISECONDS_IN_SECOND).toISOString();
}

/**
 * Reads the subscription of a finished checkout, whether the gate sent it whole or only named it
 */
export function readSubscriptionOrNull(
    subscription: string | Stripe.Subscription | null | undefined,
    stripe: Stripe,
): Promise<Stripe.Subscription> | null {
    if (subscription === null || subscription === undefined) {
        return null;
    }

    return typeof subscription === 'string' ? stripe.subscriptions.retrieve(subscription) : Promise.resolve(subscription);
}
