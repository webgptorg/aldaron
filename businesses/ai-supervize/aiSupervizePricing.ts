import { PricingFootnote, PricingPlan } from '@/components/pricing-section';
import { Building, Rocket, Search, Shield, Users } from 'lucide-react';

export const aiSupervizePricingFootnotes: PricingFootnote[] = [
    {
        id: '*',
        text: 'Při navazující AI Supervizi odečteme cenu školení ve firmě, online workshopu i discovery workshopu z balíčku 80 000 Kč.',
    },
    {
        id: 'Discovery',
        text: 'Když během discovery workshopu zjistíme, že se pro vás AI Supervize nehodí, discovery neúčtujeme.',
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
        description: 'Intenzivní tříhodinový blok pro širší tým a společný základ práce s AI.',
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
        description: 'Online workshop pro tým, zaměřený na konkrétní téma, workflow nebo nástroj.',
        icon: Users,
        iconName: 'Users',
        features: [
            'Cena se počítá podle skutečného počtu účastníků a délky workshopu',
            'Prakticky si projdeme konkrétní use case, workflow nebo roli',
            'Hodí se, když chcete rychle sladit konkrétní téma bez návštěvy firmy',
        ],
        buttonText: 'Domluvit workshop',
        popular: false,
    },
    {
        name: 'Discovery workshop',
        priceMonthly: '10 000',
        priceYearly: '10 000',
        currency: 'Kč',
        period: 'za workshop',
        description: 'Dvě až tři hodiny online s CTO nebo Tech Leadem.',
        icon: Search,
        iconName: 'Search',
        features: [
            'Zmapujeme současné delivery workflow a use-cases pro AI',
            'Najdeme rizika, bezpečnostní otázky a omezení',
            'Rozhodneme, zda a jak navázat AI Supervizí',
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
        description: 'Navrhneme a nastavíme postup práce včetně výstupů pro váš tým.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Odečteme cenu předchozího školení, workshopu nebo discovery',
            'Adoption Plan + Playbook + Tool & Model Matrix',
            'Repo/PR šablony a 30/60/90 implementační plán',
            'Workshop nad výsledky a jejich doladění podle reality týmu',
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
        description: 'Průběžná supervize a úpravy playbooku i pravidel.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            'Jedno měsíční review v délce 1 až 3 hodiny',
            'Průběžné konzultace v domluveném kanálu',
            'Úpravy playbooku a šablon podle reality týmu',
            'Vyhodnocování nových nástrojů, workflow a jejich dopadu',
        ],
        buttonText: 'Chci follow-up',
        popular: false,
    },
];
