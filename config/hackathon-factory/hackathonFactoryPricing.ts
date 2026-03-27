import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Gift, Rocket } from 'lucide-react';

export const hackathonFactoryPricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Organizační podpora pokrývá reálné náklady na přípravu, moderování a dokumentaci. Není to zisk, je to sdílení nákladů.',
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
        buttonText: 'Poslat zadání',
        popular: false,
    },
    {
        name: 'Organizační podpora',
        priceMonthly: 'Sdílení',
        priceYearly: 'Sdílení',
        currency: 'nákladů',
        period: 'dle rozsahu*',
        description:
            'Pro firmy, které chtějí mít své zadání plně připravené, odmoderované a zdokumentované. Pokrýváme reálné náklady, ne zisk.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Příprava a vyladění zadání',
            'Prezentace problému účastníkům',
            'Moderování a mentoring během sprintu',
            'Přístup ke všem výstupům a prezentacím',
        ],
        buttonText: 'Domluvit rozsah',
        popular: true,
    },
    {
        name: 'Účast pro vývojáře',
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
        buttonText: 'Chci se zapojit',
        popular: false,
    },
];
