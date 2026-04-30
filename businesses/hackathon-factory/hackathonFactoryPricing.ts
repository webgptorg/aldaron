import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Gift, Rocket } from 'lucide-react';

export const hackathonFactoryPricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Cena partnerství se odvíjí od rozsahu podpory, formátu akce a náročnosti briefu. Úvodní konzultace je vždy zdarma.',
    },
];

export const hackathonFactoryPricing: PricingPlan[] = [
    {
        name: 'Zveřejnění zadání',
        priceMonthly: 'Zdarma',
        priceYearly: 'Zdarma',
        currency: '',
        period: 'bez závazků',
        description: 'Pro firmy a organizace, které chtějí nejdřív ověřit, jestli je jejich problém vhodný pro sprint.',
        icon: Gift,
        iconName: 'Gift',
        features: [
            'Krátká úvodní konzultace',
            'Posouzení vhodnosti zadání',
            'Zpřesnění scope a očekávaného výstupu',
            'Schválený brief pro účastníky',
        ],
        buttonText: 'Poslat problém',
        popular: false,
    },
    {
        name: 'Partnerství na hackathonu',
        priceMonthly: 'od 10 000',
        priceYearly: 'od 10 000',
        currency: 'Kč',
        period: 'dle rozsahu*',
        description:
            'Pro firmy, které chtějí mít své zadání plně připravené, odmoderované a zdokumentované.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Příprava a vyladění zadání',
            'Prezentace problému účastníkům',
            'Moderování a mentoring během sprintu',
            'Přístup ke všem výstupům a prezentacím',
        ],
        buttonText: 'Domluvit partnerství',
        popular: true,
    },
    {
        name: 'Účast na hackathonu',
        priceMonthly: 'Zdarma',
        priceYearly: 'Zdarma',
        currency: '',
        period: 'za účast',
        description: 'Pro developery, designéry a technology, kteří chtějí řešit konkrétní zadání z praxe.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Výběr ze schválených zadání',
            'Reálný brief místo umělé výzvy',
            'Možnost ukázat práci na funkčním výstupu',
            'Potenciál navazující spolupráce',
        ],
        buttonText: 'Registrovat se',
        popular: false,
    },
];
