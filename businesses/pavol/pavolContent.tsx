import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LucideIcon } from 'lucide-react';
import { BrainCircuit, Facebook, FileText, Github, Linkedin, Presentation, Youtube } from 'lucide-react';

export type PavolLink = {
    label: string;
    href: string;
    icon?: LucideIcon;
};

type PavolService = {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    buttonLabel: string;
    prefillMessage: string;
};

type PavolPageContent = {
    header: {
        navItems: PavolLink[];
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
        highlightsLabel: string;
        restLabel: string;
        moreLabel: string;
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
        links: PavolLink[];
    };
    footer: {
        description: string;
        navigationTitle: string;
        connectTitle: string;
        primaryAction: string;
        rightsReservedText: string;
    };
};

const cvLink = 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing';

export const pavolPageContent: Record<SupportedHomepageLanguage, PavolPageContent> = {
    cs: {
        header: {
            navItems: [
                { label: 'Jak vám pomohu', href: '#services' },
                { label: 'Reference', href: '#testimonials' },
                { label: 'Projekty', href: '#projects' },
                { label: 'Čísla', href: '#numbers' },
                { label: 'Média', href: '#media' },
                { label: 'Kontakt', href: '#contact' },
            ],
            primaryAction: 'Napište mi',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Přepnout jazyk',
        },
        hero: {
            eyebrow: 'AI konzultace, workshopy a vývoj',
            title: 'Pavol Hejný',
            description:
                'Pomáhám firmám a týmům nasadit AI do vývoje, produktů a interních procesů tak, aby jim v praxi přinášela užitek. Bez dalšího hype.',
            badges: ['AI konzultace', 'Workshopy a přednášky', '15+ let vývoje'],
            primaryAction: 'Probrat AI',
            secondaryAction: 'Moje projekty',
        },
        services: {
            eyebrow: 'S čím pomohu',
            title: 'S čím vám pomohu',
            description:
                'Každý tým řeší něco jiného. Pomohu vám najít konkrétní použití AI, nastavit proces a vybrat způsob práce, který sedne vašemu produktu.',
            items: [
                {
                    id: 'ai-consulting',
                    icon: BrainCircuit,
                    title: 'AI konzultace',
                    description:
                        'Strategie, výběr nástrojů, vendor lock-in, bezpečnost dat, práce s AI agenty a cesta od dema k běžnému provozu.',
                    buttonLabel: 'Domluvit AI konzultaci',
                    prefillMessage: 'Dobrý den, Pavle. Mám zájem o AI konzultaci. Prosím, ozvěte se mi.',
                },
                {
                    id: 'ai-workshops-talks',
                    icon: Presentation,
                    title: 'Workshopy a přednášky',
                    description:
                        'Přednášky a praktické workshopy pro firmy, produktové týmy a vývojáře. Zaměříme se na to, co můžete hned použít, jak udržet kvalitu a která rozhodnutí je potřeba udělat.',
                    buttonLabel: 'Domluvit workshop nebo přednášku',
                    prefillMessage: 'Dobrý den, Pavle. Mám zájem o AI workshop nebo přednášku. Prosím, ozvěte se mi.',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Reference',
            title: 'Lidé, se kterými jsem pracoval',
            description: 'Reference z projektů, školení, workshopů i delší spolupráce.',
        },
        projects: {
            eyebrow: 'Projekty',
            title: 'Od aplikací po AI agenty',
            description:
                'Vyvíjím už více než polovinu života. Pracoval jsem na webových aplikacích, vzdělávacích produktech i AI agentech. Tady jsou projekty, které nejlépe ukazují, čemu se věnuji dnes.',
        },
        numbers: {
            eyebrow: 'Čísla',
            title: 'Praxe v číslech',
            description: 'Zajímá mě, co funguje v praxi. V týmu, v produktu i po delší době.',
        },
        media: {
            eyebrow: 'Média',
            title: 'Rozhovory, podcasty a přednášky',
            description: 'O AI, vývoji a digitálních produktech mluvím v rozhovorech, podcastech a na přednáškách.',
            highlightsLabel: 'Vybrané výstupy',
            restLabel: 'Další výstupy',
            moreLabel: 'Více',
        },
        contact: {
            eyebrow: 'Kontakt',
            title: 'Napište mi, co řešíte',
            description: 'Napište stručně, co řešíte. Ozvu se do 24 hodin.',
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
            successDescription: 'Ozvu se na uvedený e-mail co nejdřív.',
            errorMessage: 'Vyplňte prosím jméno, e-mail a zprávu.',
            otherContactsTitle: 'Další odkazy',
            links: [
                { label: 'CV', href: cvLink, icon: FileText },
                { label: 'GitHub', href: 'https://github.com/hejny', icon: Github },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/', icon: Linkedin },
                { label: 'Facebook', href: 'https://www.facebook.com/hejny', icon: Facebook },
                { label: 'YouTube', href: 'https://www.youtube.com/@pavolhejny', icon: Youtube },
            ],
        },
        footer: {
            description:
                'Pomáhám firmám a týmům používat AI v praxi, od strategie a workshopů po konkrétní produktové a vývojové workflow.',
            navigationTitle: 'Navigace',
            connectTitle: 'Spojte se se mnou',
            primaryAction: 'Napište mi',
            rightsReservedText: 'Všechna práva vyhrazena.',
        },
    },
    en: {
        header: {
            navItems: [
                { label: 'How I help', href: '#services' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Projects', href: '#projects' },
                { label: 'Numbers', href: '#numbers' },
                { label: 'Media', href: '#media' },
                { label: 'Contact', href: '#contact' },
            ],
            primaryAction: 'Contact me',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Switch language',
        },
        hero: {
            eyebrow: 'AI consulting, workshops, and development',
            title: 'Pavol Hejný',
            description:
                'I help companies and teams bring AI into development, products, and internal processes where it can do useful work. No extra hype.',
            badges: ['AI consulting', 'Workshops and talks', '15+ years building software'],
            primaryAction: 'Talk about AI',
            secondaryAction: 'See my projects',
        },
        services: {
            eyebrow: 'How I can help',
            title: 'What I can help you with',
            description:
                'Every team has a different problem. I help you find a concrete use for AI, set up the process, and choose a way of working that fits your product.',
            items: [
                {
                    id: 'ai-consulting',
                    icon: BrainCircuit,
                    title: 'AI consulting',
                    description:
                        'Strategy, tool selection, vendor lock-in, data security, working with AI agents, and moving from a demo to everyday use.',
                    buttonLabel: 'Talk about AI consulting',
                    prefillMessage: 'Hello Pavol. I am interested in AI consulting. Please get in touch.',
                },
                {
                    id: 'ai-workshops-talks',
                    icon: Presentation,
                    title: 'Workshops and talks',
                    description:
                        'Talks and hands-on workshops for companies, product teams, and developers. We focus on what you can use right away, how to keep the quality up, and which decisions need to be made.',
                    buttonLabel: 'Arrange a workshop or talk',
                    prefillMessage: 'Hello Pavol. I am interested in an AI workshop or talk. Please get in touch.',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Testimonials',
            title: 'People I have worked with',
            description: 'A few words from people I have worked with on projects, trainings, workshops, and longer collaborations.',
        },
        projects: {
            eyebrow: 'Projects',
            title: 'From apps to AI agents',
            description:
                'I have been building software for more than half my life. I have worked on web applications, education products, and AI agents. These are the projects that best represent what I do today.',
        },
        numbers: {
            eyebrow: 'Numbers',
            title: 'The work behind the numbers',
            description: 'I care about what works in practice, inside a team, in a product, and over time.',
        },
        media: {
            eyebrow: 'Media',
            title: 'Interviews, podcasts, and talks',
            description: 'I talk about AI, development, and digital products in interviews, podcasts, and talks.',
            highlightsLabel: 'Highlights',
            restLabel: 'Other appearances',
            moreLabel: 'More',
        },
        contact: {
            eyebrow: 'Contact',
            title: 'Tell me what you are working on',
            description: 'Tell me briefly what you are working on. I will get back to you within 24 hours.',
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
                { label: 'CV', href: cvLink, icon: FileText },
                { label: 'GitHub', href: 'https://github.com/hejny', icon: Github },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/', icon: Linkedin },
                { label: 'Facebook', href: 'https://www.facebook.com/hejny', icon: Facebook },
                { label: 'YouTube', href: 'https://www.youtube.com/@pavolhejny', icon: Youtube },
            ],
        },
        footer: {
            description:
                'I help companies and teams use AI in their day-to-day work, from strategy and workshops to concrete product and engineering workflows.',
            navigationTitle: 'Navigation',
            connectTitle: 'Connect with me',
            primaryAction: 'Contact me',
            rightsReservedText: 'All rights reserved.',
        },
    },
};
