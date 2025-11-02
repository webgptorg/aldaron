import { Building, Rocket, Shield } from 'lucide-react';

export const citiesCsPricing = [
    {
        name: 'Standard',
        price: '2 299 Kč',
        period: 'měsíčně',
        description: 'Ideální pro malá a středně velká města a obce.',
        icon: Building,
        features: [
            'Až 20 AI agentů',
            'Znalostní báze specifická pro město',
            'Prioritní podpora',
            'Pokročilá analytika',
        ],
        buttonText: 'Začít',
        popular: false,
        gradient: 'from-gray-500 to-gray-600',
    },
    {
        name: 'Pokročilý',
        price: '5 799 Kč',
        period: 'měsíčně',
        description: 'Pro města vyžadující pokročilejší funkce a podporu.',
        icon: Rocket,
        features: [
            'Vše ve Standardu',
            'Až 50 AI agentů',
            'Vlastní integrace',
            'Dedikovaný manažer účtu',
            'Podpora 24/7',
        ],
        buttonText: 'Spustit pokročilou zkušební verzi',
        popular: true,
        gradient: 'from-purple-500 to-blue-500',
    },
    {
        name: 'Enterprise',
        price: 'Vlastní',
        period: 'kontaktujte nás',
        description: 'Řešení na míru pro rozsáhlé městské aplikace.',
        icon: Shield,
        features: [
            'Vše v Pokročilém',
            'Neomezený počet AI agentů',
            'Nasazení na místě',
            'Vlastní SLA',
            'Prémiové zaškolení',
        ],
        buttonText: 'Kontaktovat prodej',
        popular: false,
        gradient: 'from-emerald-500 to-cyan-500',
    },
];
