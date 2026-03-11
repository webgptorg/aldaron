import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Shield } from 'lucide-react';

export const aiSupervizePricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Discovery workshop neúčtujeme, pokud společně zjistíme, že pro vás AI Supervize teď není vhodná. Pokud pokračujeme, částku započteme do balíčku.',
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
        period: 'jednorázově',
        description: 'Rychlé ověření, jestli AI Supervize přinese hodnotu právě vašemu týmu.',
        icon: Building,
        iconName: 'Building',
        features: [
            '2-3 h online s CTO nebo Tech Leadem',
            'Mapování aktuálního workflow od požadavku po merge',
            'Doporučení dalšího postupu a prvních priorit',
            'Pokud nepokračujeme, workshop neúčtujeme*',
        ],
        buttonText: 'Poptat workshop',
        popular: false,
    },
    {
        name: 'AI Supervize',
        priceMonthly: '80 000',
        priceYearly: '80 000',
        currency: 'Kč',
        period: 'jednorázově',
        description: 'Návrh, nastavení a konkrétní výstupy pro stabilní AI coding workflow v týmu.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Adoption Plan + Playbook + Tool & Model Matrix',
            'Repo a PR šablony + 30/60/90 plán',
            'Workshop nad výsledky a doladění pro reálný provoz',
            'Krátká async podpora během zavádění',
        ],
        buttonText: 'Domluvit supervizi',
        popular: true,
    },
    {
        name: 'Měsíční follow-up',
        priceMonthly: '15 000',
        priceYearly: '15 000',
        currency: 'Kč',
        period: 'měsíc',
        description: 'Průběžné ladění pravidel, metrik a workflow podle toho, co se děje v praxi.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            '1x měsíčně review na 60-90 minut',
            'Konzultace v domluveném kanálu',
            'Úpravy playbooku a šablon podle reality týmu',
            'Vyhodnocování nových nástrojů a postupů',
        ],
        buttonText: 'Domluvit follow-up',
        popular: false,
    },
];
