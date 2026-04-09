import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Shield, Zap } from 'lucide-react';

export const aiSupervizePricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Cena školení ve firmě i online workshopu se při navazující AI Supervizi započítává do ceny supervize.',
    },
    {
        id: '**',
        text: 'Zatím nejsme plátci DPH, uvedené ceny jsou konečné.',
    },
];

export const aiSupervizePricing: PricingPlan[] = [
    {
        name: 'Školení ve firmě',
        priceMonthly: '40 000',
        priceYearly: '40 000',
        currency: 'Kč',
        period: '3 hodiny',
        description: 'Přijedeme k vám a srovnáme v týmu očekávání, pravidla i praktické použití AI.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Tříhodinové školení přímo u vás ve firmě',
            'Společný základ pro vývojáře, leady i management',
            'Praktické příklady nad vaším stackem, workflow a riziky',
            'Při pokračování se cena započítá do AI Supervize*',
        ],
        buttonText: 'Chci školení',
        popular: false,
    },
    {
        name: 'Online workshop',
        priceMonthly: '500',
        priceYearly: '500',
        currency: 'Kč',
        period: 'účastník / hodina',
        description: 'Lehčí vstup pro tým, který chce řešit konkrétní use-casy a rychle si srovnat další krok.',
        icon: Zap,
        iconName: 'Zap',
        features: [
            'Online formát podle velikosti a seniority týmu',
            'Práce nad konkrétními situacemi, které ve vývoji řešíte',
            'Vhodné jako první krok před plnou AI Supervizí',
            'Při pokračování se cena započítá do AI Supervize*',
        ],
        buttonText: 'Chci workshop',
        popular: false,
    },
    {
        name: 'AI Supervize',
        priceMonthly: '80 000',
        priceYearly: '80 000',
        currency: 'Kč',
        period: 'jednorázově',
        description: 'Návrh, nastavení a konkrétní výstupy pro váš tým.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Započtení předchozího školení nebo workshopu*',
            'Adoption Plan + Playbook + Tool & Model Matrix',
            'Repo/PR šablony a 30/60/90 implementační plán',
            'Workshop nad výsledky a doladění do reality týmu',
            'Krátká async podpora během zavádění',
        ],
        buttonText: 'Chci AI Supervizi',
        popular: true,
    },
    {
        name: 'Follow-up',
        priceMonthly: '15 000',
        priceYearly: '15 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Průběžná supervize, úpravy playbooku a pravidel.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            '1x měsíční review v délce 1-3 hodiny',
            'Průběžné konzultace v domluveném kanálu',
            'Úpravy playbooku a šablon podle reality týmu',
            'Vyhodnocování nových nástrojů, workflow a dopadu',
        ],
        buttonText: 'Chci follow-up',
        popular: false,
    },
];
