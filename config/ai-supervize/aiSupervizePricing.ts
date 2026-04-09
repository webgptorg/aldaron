import type { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Search, Shield, Users } from 'lucide-react';

export interface AiSupervizeJourneyPlan extends PricingPlan {
    stage: 1 | 2 | 3;
}

export const aiSupervizePricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Cena školení ve firmě, online workshopu i discovery workshopu se při pokračování odečítá z ceny AI Supervize 80 000 Kč.',
    },
    {
        id: '**',
        text: 'Pokud zjistíme, že pro vás AI Supervize není vhodná, discovery workshop neúčtujeme.',
    },
    {
        id: '***',
        text: 'Zatím nejsme plátci DPH, uvedené ceny jsou konečné.',
    },
];

export const aiSupervizePricing: AiSupervizeJourneyPlan[] = [
    {
        name: 'Školení ve firmě',
        priceMonthly: '40 000',
        priceYearly: '40 000',
        currency: 'Kč',
        period: 'za 3 hodiny',
        description: 'Tříhodinový blok přímo u vás pro tým, který chce společný základ a bezpečný start s AI.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Společný kick-off pro tým přímo ve firmě',
            'Praktický úvod do workflow, bezpečnosti a práce s AI nástroji',
            'Při pokračování cenu odečítáme z AI Supervize 80 000 Kč',
        ],
        buttonText: 'Chci školení ve firmě',
        popular: false,
        stage: 1,
    },
    {
        name: 'Online workshop',
        priceMonthly: '500',
        priceYearly: '500',
        currency: 'Kč',
        period: 'za hodinu / účastníka',
        description: 'Online workshop pro tým nebo vybranou skupinu nad konkrétními use-casy a workflow.',
        icon: Users,
        iconName: 'Users',
        features: [
            'Hands-on práce nad reálnými scénáři vašeho týmu',
            'Vhodné pro společné nastavení promptů, review a delegace na AI',
            '500 Kč za hodinu online workshopu za účastníka',
            'Při pokračování cenu odečítáme z AI Supervize 80 000 Kč',
        ],
        buttonText: 'Chci online workshop',
        popular: false,
        stage: 1,
    },
    {
        name: 'Discovery workshop',
        priceMonthly: '5 000',
        priceYearly: '5 000',
        currency: 'Kč',
        period: 'za 2-3 hodiny online',
        description: '2-3 hodiny online s CTO nebo Tech Leadem pro rozhodnutí, jak má AI Supervize začít.',
        icon: Search,
        iconName: 'Search',
        features: [
            'Mapování současného delivery workflow a use-caseů pro AI',
            'Identifikace rizik, bezpečnosti a omezení',
            'Doporučení dalšího postupu a rozhodnutí, zda pokračovat',
            'Při pokračování cenu odečítáme z AI Supervize 80 000 Kč',
        ],
        buttonText: 'Chci discovery workshop',
        popular: false,
        stage: 1,
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
            'Na míru navazuje na zvolený první krok a jeho výstupy',
            'Adoption Plan + Playbook + Tool & Model Matrix',
            'Repo/PR šablony a 30/60/90 implementační plán',
            'Workshop nad výsledky a doladění do reality týmu',
            'Krátká async podpora během zavádění',
        ],
        buttonText: 'Chci návrh Supervize',
        popular: true,
        stage: 2,
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
        stage: 3,
    },
];
