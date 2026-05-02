import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { Metadata } from 'next';

type PavolNavItem = {
    label: string;
    href: string;
};

type PavolService = {
    id: string;
    title: string;
    description: string;
    buttonLabel: string;
    prefillMessage: string;
};

type PavolContactLink = {
    label: string;
    href: string;
};

type PavolPageContent = {
    metadata: Metadata;
    header: {
        navItems: PavolNavItem[];
        primaryAction: string;
        secondaryAction: string;
        languageSwitcherLabel: string;
    };
    hero: {
        eyebrow: string;
        title: string;
        description: string;
        badges: string[];
        primaryAction: string;
        secondaryAction: string;
    };
    services: {
        eyebrow: string;
        title: string;
        description: string;
        items: PavolService[];
    };
    testimonials: {
        eyebrow: string;
        title: string;
        description: string;
    };
    projects: {
        eyebrow: string;
        title: string;
        description: string;
    };
    numbers: {
        eyebrow: string;
        title: string;
        description: string;
    };
    media: {
        eyebrow: string;
        title: string;
        description: string;
    };
    contact: {
        eyebrow: string;
        title: string;
        description: string;
        formNameLabel: string;
        formNamePlaceholder: string;
        formEmailLabel: string;
        formEmailPlaceholder: string;
        formCompanyLabel: string;
        formCompanyPlaceholder: string;
        formMessageLabel: string;
        formMessagePlaceholder: string;
        submitLabel: string;
        submittingLabel: string;
        successTitle: string;
        successDescription: string;
        errorMessage: string;
        otherContactsTitle: string;
        links: PavolContactLink[];
    };
};

const cvLink = 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing';

export const pavolPageContent: Record<SupportedHomepageLanguage, PavolPageContent> = {
    cs: {
        metadata: {
            title: 'Pavol Hejný | AI konzultace, workshopy a projekty',
            description:
                'Osobní stránka Pavola Hejného. AI konzultace, workshopy, přednášky a projekty na pomezí vývoje, produktu a vzdělávání.',
            alternates: {
                canonical: '/pavol/cs',
                languages: {
                    cs: '/pavol/cs',
                    en: '/pavol/en',
                },
            },
            openGraph: {
                title: 'Pavol Hejný',
                description: 'AI konzultace, workshopy a projekty na pomezí vývoje, produktu a vzdělávání.',
                locale: 'cs_CZ',
                type: 'website',
                images: ['/people/pavol-hejny-transparent-square.png'],
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Pavol Hejný',
                description: 'AI konzultace, workshopy a projekty na pomezí vývoje, produktu a vzdělávání.',
                images: ['/people/pavol-hejny-transparent-square.png'],
            },
        },
        header: {
            navItems: [
                { label: 'Jak pomohu', href: '#services' },
                { label: 'Reference', href: '#testimonials' },
                { label: 'Projekty', href: '#projects' },
                { label: 'Čísla', href: '#numbers' },
                { label: 'Média', href: '#media' },
                { label: 'Kontakt', href: '#contact' },
            ],
            primaryAction: 'Napsat Pavolovi',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Přepnout jazyk',
        },
        hero: {
            eyebrow: 'AI konzultace, workshopy a produktový vývoj',
            title: 'Pavol Hejný',
            description:
                'Pomáhám firmám a týmům zavádět AI do vývoje, produktového řízení a interních procesů tak, aby přinášela reálnou hodnotu místo dalšího hype.',
            badges: ['AI consulting', 'Workshopy a talks', '15+ let zkušeností s vývojem'],
            primaryAction: 'Spojme se',
            secondaryAction: 'Zjistit více',
        },
        services: {
            eyebrow: 'Jak mohu pomoci',
            title: 'Kde dávám největší smysl',
            description:
                'Neprodávám jednu univerzální AI odpověď. Pomáhám vybrat správný use-case, proces a způsob práce pro konkrétní tým nebo produkt.',
            items: [
                {
                    id: 'ai-consulting',
                    title: 'AI konzultace',
                    description:
                        'Strategie, výběr nástrojů, vendor lock-in, bezpečnost dat, agentní workflow a to, jak dostat AI z demo režimu do běžného provozu.',
                    buttonLabel: 'Chci AI konzultaci',
                    prefillMessage: 'Dobrý den Pavle, mám zájem o AI konzultace, prosím ozvěte se mi.',
                },
                {
                    id: 'ai-workshops-talks',
                    title: 'AI workshopy / talks',
                    description:
                        'Přednášky a hands-on workshopy pro firmy, product týmy i vývojáře. Bez zbytečného hype, s důrazem na praxi, kvalitu a konkrétní rozhodnutí.',
                    buttonLabel: 'Chci workshop nebo talk',
                    prefillMessage: 'Dobrý den Pavle, mám zájem o AI workshopy / talks, prosím ozvěte se mi.',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Reference',
            title: 'Lidé, kteří se mnou opravdu pracovali',
            description: 'Vybrané reference z produktů, hackathonů, vzdělávání a spolupráce na nových nápadech.',
        },
        projects: {
            eyebrow: 'Projekty',
            title: 'Od vzdělávání a produktů až k AI agentům',
            description:
                'Promptbook je dnes důležitou částí mé práce, ale není to jediný projekt. Dlouhodobě propojuji software, produkt a vzdělávání.',
        },
        numbers: {
            eyebrow: 'Čísla',
            title: 'Zkušenost, která má za sebou reálnou práci',
            description:
                'Zajímá mě dopad v praxi. Ne jen to, jak věci znějí v prezentaci, ale co obstojí v týmu, produktu a v dlouhodobém provozu.',
        },
        media: {
            eyebrow: 'Média a vystoupení',
            title: 'Rozhovory, podcasty a přednášky',
            description:
                'Výběr veřejných vystoupení a mediálních výstupů, kde mluvím o AI, vývoji, vzdělávání a stavění digitálních produktů.',
        },
        contact: {
            eyebrow: 'Kontakt',
            title: 'Napište mi, co řešíte',
            description:
                'Pošlete stručný kontext a já se ozvu. Pokud už víte, že jde o konzultaci nebo workshop, klidně použijte jednu z předvyplněných variant výše.',
            formNameLabel: 'Jméno',
            formNamePlaceholder: 'Vaše jméno',
            formEmailLabel: 'E-mail',
            formEmailPlaceholder: 'jmeno@firma.cz',
            formCompanyLabel: 'Firma / organizace',
            formCompanyPlaceholder: 'Firma s.r.o.',
            formMessageLabel: 'Zpráva',
            formMessagePlaceholder: 'Popište stručně, co řešíte a s čím byste potřebovali pomoci.',
            submitLabel: 'Odeslat zprávu',
            submittingLabel: 'Odesílám...',
            successTitle: 'Děkuji, zpráva je odeslaná',
            successDescription: 'Jakmile to bude možné, ozvu se zpět na uvedený e-mail.',
            errorMessage: 'Vyplňte prosím jméno, e-mail a zprávu.',
            otherContactsTitle: 'Další odkazy',
            links: [
                { label: 'CV', href: cvLink },
                { label: 'GitHub', href: 'https://github.com/hejny' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/' },
                { label: 'Facebook', href: 'https://www.facebook.com/hejny' },
                { label: 'YouTube', href: 'https://www.youtube.com/@pavolhejny' },
            ],
        },
    },
    en: {
        metadata: {
            title: 'Pavol Hejný | AI consulting, workshops, and projects',
            description:
                'The personal page of Pavol Hejný. AI consulting, workshops, talks, and projects across software, product, and education.',
            alternates: {
                canonical: '/pavol/en',
                languages: {
                    cs: '/pavol/cs',
                    en: '/pavol/en',
                },
            },
            openGraph: {
                title: 'Pavol Hejný',
                description: 'AI consulting, workshops, and projects across software, product, and education.',
                locale: 'en_US',
                type: 'website',
                images: ['/people/pavol-hejny-transparent-square.png'],
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Pavol Hejný',
                description: 'AI consulting, workshops, and projects across software, product, and education.',
                images: ['/people/pavol-hejny-transparent-square.png'],
            },
        },
        header: {
            navItems: [
                { label: 'How I Help', href: '#services' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Projects', href: '#projects' },
                { label: 'Numbers', href: '#numbers' },
                { label: 'Media', href: '#media' },
                { label: 'Contact', href: '#contact' },
            ],
            primaryAction: 'Contact Pavol',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Switch language',
        },
        hero: {
            eyebrow: 'AI consulting, workshops, and product-minded engineering',
            title: 'Pavol Hejný',
            description:
                'I help companies and teams bring AI into software development, product work, and internal processes in a way that creates real value instead of more hype.',
            badges: ['AI consulting', 'Workshops and talks', '15+ years in product and engineering'],
            primaryAction: 'Let’s talk',
            secondaryAction: 'Open CV',
        },
        services: {
            eyebrow: 'How I can help',
            title: 'Where I am most useful',
            description:
                'I do not sell one universal AI answer. I help teams choose the right use case, process, and operating model for their actual product and context.',
            items: [
                {
                    id: 'ai-consulting',
                    title: 'AI consulting',
                    description:
                        'Strategy, tooling choices, vendor lock-in, data safety, agent workflows, and the move from flashy demos to sustainable daily use.',
                    buttonLabel: 'I want AI consulting',
                    prefillMessage: 'Hello Pavol, I am interested in AI Consulting, please contact me.',
                },
                {
                    id: 'ai-workshops-talks',
                    title: 'AI workshops / talks',
                    description:
                        'Talks and hands-on workshops for companies, product teams, and developers. Less hype, more practical decisions, quality signals, and real workflows.',
                    buttonLabel: 'I want a workshop or talk',
                    prefillMessage: 'Hello Pavol, I am interested in AI Workshop / Talks, please contact me.',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Testimonials',
            title: 'People who have actually worked with me',
            description:
                'A small selection of references across products, hackathons, education, and building new ideas from scratch.',
        },
        projects: {
            eyebrow: 'Projects',
            title: 'From education and product building to AI agents',
            description:
                'Promptbook matters a lot in my current work, but it is only one part of a much longer track record that connects software, product, and education.',
        },
        numbers: {
            eyebrow: 'Numbers',
            title: 'Experience grounded in real delivery',
            description:
                'I care about impact in practice. Not only how something sounds on a slide, but what survives inside a team, a product, and long-term operations.',
        },
        media: {
            eyebrow: 'Media and appearances',
            title: 'Podcasts, interviews, and public talks',
            description:
                'A curated set of public appearances where I talk about AI, software development, education, and building digital products.',
        },
        contact: {
            eyebrow: 'Contact',
            title: 'Tell me what you are working on',
            description:
                'Send a short summary of your context and I will get back to you. If you already know it is about consulting or a workshop, use one of the prefilled options above.',
            formNameLabel: 'Name',
            formNamePlaceholder: 'Your name',
            formEmailLabel: 'Email',
            formEmailPlaceholder: 'you@company.com',
            formCompanyLabel: 'Company / organization',
            formCompanyPlaceholder: 'Awesome Company',
            formMessageLabel: 'Message',
            formMessagePlaceholder: 'Briefly explain your situation and what kind of help would be useful.',
            submitLabel: 'Send message',
            submittingLabel: 'Sending...',
            successTitle: 'Thank you, the message has been sent',
            successDescription: 'I will reply to the email address you provided as soon as I can.',
            errorMessage: 'Please fill in your name, email, and message.',
            otherContactsTitle: 'Other links',
            links: [
                { label: 'CV', href: cvLink },
                { label: 'GitHub', href: 'https://github.com/hejny' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/' },
                { label: 'Facebook', href: 'https://www.facebook.com/hejny' },
                { label: 'YouTube', href: 'https://www.youtube.com/@pavolhejny' },
            ],
        },
    },
};
