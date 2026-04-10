import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Search, Shield, Users } from 'lucide-react';

export const aiSupervizePricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Cena školení ve firmě, online workshopu i discovery workshopu se při navazující AI Supervizi odečítá z ceny balíčku 80 000 Kč.',
    },
    {
        id: 'Discovery',
        text: 'Pokud u discovery workshopu zjistíme, že pro vás AI Supervize není vhodná, discovery neúčtujeme.',
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
        period: 'za 3 hodiny',
        description: 'Intenzivní blok přímo u vás pro širší tým a společný AI základ.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Přijedeme do firmy a projdeme AI workflow na vašich reálných situacích',
            'Sjednotíme tým kolem pravidel, bezpečnosti a očekávání',
            'Vhodné jako rychlý společný start před AI Supervizí',
        ],
        buttonText: 'Domluvit školení',
        popular: false,
    },
    {
        name: 'Online workshop',
        priceMonthly: '500',
        priceYearly: '500',
        currency: 'Kč',
        period: 'za hodinu / účastníka',
        description: 'Online workshop pro tým nad konkrétním tématem, workflow nebo nástrojem.',
        icon: Users,
        iconName: 'Users',
        features: [
            'Cena se počítá podle skutečného počtu účastníků a délky workshopu',
            'Hands-on formát nad konkrétním use-casem, workflow nebo rolí',
            'Vhodné, když chcete rychle sladit konkrétní téma bez onsite návštěvy',
        ],
        buttonText: 'Domluvit workshop',
        popular: false,
    },
    {
        name: 'Discovery workshop',
        priceMonthly: '5 000',
        priceYearly: '5 000',
        currency: 'Kč',
        period: 'za workshop',
        description: '2-3 hodiny online s CTO nebo Tech Leadem.',
        icon: Search,
        iconName: 'Search',
        features: [
            'Mapování současného delivery workflow a use-caseů pro AI',
            'Identifikace rizik, bezpečnosti a omezení',
            'Rozhodnutí, zda a jak navázat AI Supervizí',
        ],
        buttonText: 'Domluvit discovery',
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
            'Odečtení ceny předchozího školení, workshopu nebo discovery',
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
