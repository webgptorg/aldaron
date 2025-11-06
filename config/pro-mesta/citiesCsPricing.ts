import { Building, Rocket, Shield } from 'lucide-react';

// TODO: !!! [🌆] `/pro-mesta` Figure out best pricing
// TODO: !!! [🌆] `/pro-mesta` Figure out the features
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsPricing`

export const citiesCsPricing = [
    {
        name: 'Standard',
        priceMonthly: '2 000',
        priceYearly: '20 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Ideální pro malá a středně velká města a obce.',
        icon: Building,
        iconName: 'Building',
        features: [
            'Až 20 AI agentů',
            'Znalostní báze specifická pro město',
            'Prioritní podpora',
            'Pokročilá analytika',
        ],
        buttonText: 'Začněte',
        popular: false,
    },
    {
        name: 'Pokročilý',
        priceMonthly: '5 000',
        priceYearly: '45 000',
        currency: 'Kč',
        period: 'měsíčně',
        description: 'Pro města, která vyžadují pokročilejší funkce a podporu.',
        icon: Rocket,
        iconName: 'Rocket',
        features: [
            'Vše ve Standardu',
            'Až 50 AI agentů',
            'Vlastní integrace',
            'Dedikovaný manažer účtu',
            'Podpora 24/7',
        ],
        buttonText: 'Vyzkoušet pokročilou verzi',
        popular: true,
    },
    {
        name: 'Enterprise',
        priceMonthly: 'Vlastní',
        priceYearly: 'Vlastní',
        currency: '',
        period: 'na vyžádání',
        description: 'Řešení na míru pro rozsáhlé městské aplikace.',
        icon: Shield,
        iconName: 'Shield',
        features: [
            'Vše v Pokročilém',
            'Neomezený počet AI agentů',
            'Nasazení na místě',
            'Vlastní SLA',
            'Prémiové zaškolení',
        ],
        buttonText: 'Kontaktujte prodej',
        popular: false,
    },
];
