import { getStripeConfigurationOrNull, type StripeConfiguration } from '@/lib/payments/stripeConfiguration';
import Stripe from 'stripe';

export type StripeGateway = {
    readonly stripe: Stripe;
    readonly configuration: StripeConfiguration;
};

let cachedGateway: StripeGateway | null = null;

/**
 * The payment gate this server talks to, or `null` when it was given no key at all.
 *
 * Note: One client is kept for one key, because it holds the connections the gate is reached over. A key replaced
 *       while the server runs, which is how the test gate and the live one are switched between, builds a new client
 *       instead of keeping the previous one alive.
 */
export function getStripeGatewayOrNull(): StripeGateway | null {
    const configuration = getStripeConfigurationOrNull();
    if (configuration === null) {
        cachedGateway = null;
        return null;
    }

    if (cachedGateway === null || cachedGateway.configuration.secretKey !== configuration.secretKey) {
        cachedGateway = { stripe: new Stripe(configuration.secretKey), configuration };
    }

    return { stripe: cachedGateway.stripe, configuration };
}
