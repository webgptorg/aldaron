import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Shield } from 'lucide-react';

/**
 * Footnotes for agronomy pricing plans.
 */
export const forAgroPricingFootnotes: Array<PricingFootnote> = [
    {
        id: '*',
        text: '1 AI agronomický úvazek představuje orientační kapacitu jednoho full-time specialisty.',
    },
];

/**
 * Pricing plans for agronomy landing page.
 */
export const forAgroPricing: Array<PricingPlan> = [
    {
        name: 'Základní',
        priceMonthly: '3 900',
        priceYearly: '39 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro menší agronomické týmy a pilotní nasazení.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Až 5 AI agentů',
            'Až 2 000 normostran znalostí',
            'Až 200 dokumentů',
            '1 AI agronomický úvazek*',
            'Základní podpora',
        ],
        buttonText: 'Začít',
        popular: false,
    },
    {
        name: 'Provozní',
        priceMonthly: '9 900',
        priceYearly: '99 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro firmy, které potřebují AI napříč lokalitami i odděleními.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Vše v Základním',
            'Až 25 AI agentů',
            'Až 15 000 normostran znalostí',
            'Až 2 000 dokumentů',
            '5 AI agronomických úvazků*',
            'Prioritní podpora',
        ],
        buttonText: 'Vyzkoušet provozní plán',
        popular: true,
    },
    {
        name: 'Enterprise',
        priceMonthly: 'Dohodou',
        priceYearly: 'Dohodou',
        currency: '',
        period: 'na vyžádání',
        description: 'Pro rozsáhlé zemědělské skupiny s pokročilými požadavky.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            'Vše v Provozním',
            'Neomezený počet AI agentů',
            'Nasazení on-premise',
            'Vlastní SLA a governance',
            'Pokročilé integrace',
            'Dedikovaný onboarding',
        ],
        buttonText: 'Kontaktovat obchod',
        popular: false,
    },
];

