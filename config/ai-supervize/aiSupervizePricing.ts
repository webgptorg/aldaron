import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Shield } from 'lucide-react';

export const aiSupervizePricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Pokud zjistíme, že pro vás AI Supervize není vhodná, discovery workshop neúčtujeme. Pokud pokračujeme, započteme ho do balíčku AI Supervize.',
    },
    {
        id: '**',
        text: 'Zatím nejsme plátci DPH, uvedené ceny jsou konečné.',
    },
];

export const aiSupervizePricing: PricingPlan[] = [
    {
        name: 'Discovery workshop',
        priceMonthly: '5 000',
        priceYearly: '5 000',
        currency: 'Kč',
        period: 'za workshop',
        description: '2-3 hodiny online s CTO, CEO nebo Tech Leadem.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Mapování současného delivery workflow a use-caseů pro AI',
            'Identifikace rizik, bezpečnosti a omezení',
            'Doporučení dalšího postupu a rozhodnutí, zda pokračovat',
        ],
        buttonText: 'Domluvit workshop',
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
            'Discovery workshop, pokud nebyl zvlášť fakturován',
            'Adoption Plan + Playbook + Tool & Model Matrix',
            'Repo/PR šablony a 30/60/90 implementační plán',
            'Workshop nad výsledky a doladění do reality týmu',
            'Krátká async podpora během zavádění',
        ],
        buttonText: 'Chci návrh Supervize',
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
            '1x měsíční review v délce 60-90 minut',
            'Průběžné konzultace v domluveném kanálu',
            'Úpravy playbooku a šablon podle reality týmu',
            'Vyhodnocování nových nástrojů, workflow a dopadu',
        ],
        buttonText: 'Chci follow-up',
        popular: false,
    },
];
