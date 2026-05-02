import type { Testimonial } from '@/components/testimonials-section';
import bobKartous from '@/public/people/bob-kartous-transparent.png';
import janSedo from '@/public/people/jan-sedo-transparent.png';
import maxKozlov from '@/public/people/max-kozlov-transparent.png';
import terezaTexlova from '@/public/people/tereza-texlova-transparent.png';
import tomasStudenik from '@/public/people/tomas-studenik-transparent.png';

export const PAVOL_CV_URL =
    'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing';

export type PavolLanguage = 'en' | 'cs';

type PavolContent = {
    metadata: {
        title: string;
        description: string;
        locale: string;
        canonical: string;
    };
    header: {
        contact: string;
        languageSwitch: string;
        centerLinks: { href: string; label: string }[];
    };
    hero: {
        eyebrow: string;
        title: string;
        highlightedTitle: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        badges: string[];
    };
    services: {
        eyebrow: string;
        title: string;
        description: string;
        items: {
            title: string;
            description: string;
            bullets: string[];
            highlight: string;
        }[];
    };
    testimonials: {
        eyebrow: string;
        title: string;
        description: string;
        metrics: { value: string; label: string }[];
        items: Testimonial[];
    };
    projects: {
        eyebrow: string;
        title: string;
        description: string;
        visit: string;
        items: {
            title: string;
            description: string;
            href: string;
            image: string;
            imageAlt: string;
            badge: string;
        }[];
    };
    media: {
        eyebrow: string;
        title: string;
        description: string;
        items: {
            title: string;
            source: string;
            href: string;
            type: 'youtube' | 'podcast' | 'article';
        }[];
    };
    contact: {
        eyebrow: string;
        title: string;
        description: string;
        formTitle: string;
        nameLabel: string;
        namePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        companyLabel: string;
        companyPlaceholder: string;
        topicLabel: string;
        topicOptions: string[];
        messageLabel: string;
        messagePlaceholder: string;
        submit: string;
        submitting: string;
        successTitle: string;
        successDescription: string;
        genericError: string;
        requiredError: string;
        contactsTitle: string;
        contacts: { label: string; href: string }[];
    };
    footer: {
        copyright: string;
        links: { label: string; href: string }[];
    };
};

const mediaItems: PavolContent['media']['items'] = [
    {
        title: 'AI ta Krajta TV',
        source: 'YouTube channel',
        href: 'https://www.youtube.com/@aitakrajta_tv',
        type: 'youtube',
    },
    {
        title: 'Data Talk #157: Podcastový průřez feat. AI ta Krajta',
        source: 'Data Talk podcast',
        href: 'https://www.datatalk.cz/podcast/epizoda-157',
        type: 'podcast',
    },
    {
        title: 'Pavol Hejný: Vývoj modulárních aplikací pro online vzdělávání',
        source: 'YouTube',
        href: 'https://www.youtube.com/watch?v=K0eMvbSID44',
        type: 'youtube',
    },
    {
        title: 'PODCAST: Pavol Hejný a Collboard',
        source: 'YouTube',
        href: 'https://www.youtube.com/watch?v=V9Jd2VfMZoA',
        type: 'youtube',
    },
    {
        title: 'LinuxDays 2018 - Užitečná browser APIs - Pavol Hejný',
        source: 'YouTube',
        href: 'https://www.youtube.com/watch?v=i7gQtatWSKc',
        type: 'youtube',
    },
    {
        title: 'Digitální škamny. Pandemie rozpohybovala zkostnatělé české školství',
        source: 'Euro.cz',
        href: 'https://www.euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi/',
        type: 'article',
    },
];

const contactLinksEn = [
    { label: 'Email', href: 'mailto:pavol@hejny.org' },
    { label: 'GitHub', href: 'https://github.com/hejny/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/' },
    { label: 'Booking calendar', href: 'https://cal.com/hejny/meet' },
    { label: 'Blog', href: 'https://blog.pavolhejny.com' },
    { label: 'CV', href: PAVOL_CV_URL },
];

const contactLinksCs = [
    { label: 'E-mail', href: 'mailto:pavol@hejny.org' },
    { label: 'GitHub', href: 'https://github.com/hejny/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/' },
    { label: 'Rezervace termínu', href: 'https://cal.com/hejny/meet' },
    { label: 'Blog', href: 'https://blog.pavolhejny.com' },
    { label: 'CV', href: PAVOL_CV_URL },
];

export const pavolContent: Record<PavolLanguage, PavolContent> = {
    en: {
        metadata: {
            title: 'Pavol Hejný | AI consulting, workshops and product prototyping',
            description:
                'Personal page of Pavol Hejný, founder and CTO of Promptbook, focused on practical AI consulting, workshops, talks and product prototyping.',
            locale: 'en_US',
            canonical: '/pavol/en',
        },
        header: {
            contact: 'Contact',
            languageSwitch: 'Česky',
            centerLinks: [
                { href: '#services', label: 'Help' },
                { href: '#testimonials', label: 'References' },
                { href: '#projects', label: 'Projects' },
                { href: '#media', label: 'Media' },
            ],
        },
        hero: {
            eyebrow: 'AI that actually helps',
            title: 'Pavol Hejný',
            highlightedTitle: 'AI consultant and product builder',
            description:
                'I help companies deploy AI agents, AI coding and company-wide AI processes that create value in real operations, not only in the first demo.',
            primaryCta: 'Get in touch',
            secondaryCta: 'Open CV',
            badges: ['Founder & CTO of Promptbook', '15+ years building software', 'Open-source contributor'],
        },
        services: {
            eyebrow: 'How can I help you?',
            title: 'Practical AI for teams that need results',
            description:
                'AI is not one tool and not one workshop. It needs the right use cases, rules, context and quality control.',
            items: [
                {
                    title: 'AI Consulting',
                    description:
                        'I help you evaluate where AI truly makes sense, which tools to choose and how to handle data, permissions, vendor lock-in and internal processes.',
                    bullets: [
                        'AI strategy and use-case prioritization',
                        'Agent workflows, rulesets and context design',
                        'Data safety, permissions and vendor lock-in review',
                    ],
                    highlight: 'From vague AI ideas to a concrete operating model',
                },
                {
                    title: 'AI Workshop / Talks',
                    description:
                        'I speak and run workshops about AI in companies, AI coding, agent workflows and the point where hype turns into a production process.',
                    bullets: [
                        'Workshops for developers, product people and leadership',
                        'AI coding with PRDs, Git, tests, CI/CD and code review',
                        'Clear language for teams that need shared judgment',
                    ],
                    highlight: 'Czech or English, onsite or online',
                },
            ],
        },
        testimonials: {
            eyebrow: 'References',
            title: 'What people say about working with Pavol',
            description:
                'The references come from the older personal page and focus on rapid prototyping, education projects and turning ideas into working products.',
            metrics: [
                { value: '15+', label: 'years building software' },
                { value: '24/48 h', label: 'hackathon prototype mindset' },
                { value: 'Open', label: 'source-first portfolio' },
            ],
            items: [
                {
                    name: 'Tomáš Studeník',
                    role: 'Startupper',
                    testimonial:
                        "I've known Pavol for 6 years, especially from hackathons and other innovation projects. If you are with his team, you can bet he'll be in the top three. Pavol is an innovator who knows the latest technologies and can find quick solutions to challenges in industry, education and urban development.",
                    avatar: tomasStudenik,
                },
                {
                    name: 'Jan Šedo',
                    role: 'Founder of H-edu',
                    testimonial:
                        'Pavol built a prototype of our H-edu app so that we could get immediate investment. He then designed the architecture of the system and the use of the technology, which proved to be the right choice for our purposes.',
                    avatar: janSedo,
                },
                {
                    name: 'Max Kozlov',
                    role: 'Founder & CEO, Undout',
                    testimonial:
                        "Pavol is an absolute beast when it comes to creating digital products. I've seen him literally overnight create an integrated chatbot that won us the 1st place at Startup Weekend Prague.",
                    avatar: maxKozlov,
                },
                {
                    name: 'Bob Kartous',
                    role: 'Vice-Rector VŠEM, advisor and author',
                    testimonial:
                        'Pavol is a highly capable innovator whose potential ranges across digital technologies and socially prioritized themes. In projects we collaborated on, he brought new visions and approaches to education.',
                    avatar: bobKartous,
                },
                {
                    name: 'Tereza Texlová',
                    role: 'Co-founder of Czech.events',
                    testimonial:
                        "I've worked with many developers before, but Pavol's combination of technical skills, public speaking and the ability to kick-start new ideas is imposing.",
                    avatar: terezaTexlova,
                },
            ],
        },
        projects: {
            eyebrow: 'Projects',
            title: 'Selected work',
            description:
                'Promptbook is one of Pavol’s projects. The wider track record includes collaborative tools, education platforms and open-source software.',
            visit: 'Open project',
            items: [
                {
                    title: 'Promptbook',
                    description:
                        'An ecosystem for persistent AI agents that work with goals, knowledge, rules and company context instead of one-off chats.',
                    href: '/',
                    image: '/logo/promptbook-logo-blue-white-1024.png',
                    imageAlt: 'Promptbook logo',
                    badge: 'AI agents',
                },
                {
                    title: 'Collboard',
                    description: 'A modular online virtual whiteboard for education, collaboration and visual thinking.',
                    href: 'https://collboard.com/',
                    image: '/pavol/projects/collboard-whiteboard.png',
                    imageAlt: 'Collboard whiteboard',
                    badge: 'Online whiteboard',
                },
                {
                    title: 'H-edu',
                    description: 'An online platform for schools and teachers with interactive materials and tools.',
                    href: 'https://www.h-edu.cz/',
                    image: '/pavol/projects/hedu-screenshot.png',
                    imageAlt: 'H-edu platform screenshot',
                    badge: 'Education',
                },
            ],
        },
        media: {
            eyebrow: 'Media',
            title: 'Media appearances and talks',
            description: 'Podcasts, videos and articles where Pavol talks about AI, development and education.',
            items: mediaItems,
        },
        contact: {
            eyebrow: 'Contact',
            title: 'Tell me what you are trying to solve',
            description:
                'Use the form for consulting, workshops, talks or a first discussion about a practical AI workflow.',
            formTitle: 'Send a message',
            nameLabel: 'Name',
            namePlaceholder: 'Jane Smith',
            emailLabel: 'Email',
            emailPlaceholder: 'jane@company.com',
            companyLabel: 'Company / organization',
            companyPlaceholder: 'Company name',
            topicLabel: 'Topic',
            topicOptions: ['AI consulting', 'AI workshop / talk', 'Product or prototype', 'Other'],
            messageLabel: 'Message',
            messagePlaceholder: 'What are you working on, what do you need to decide, and what would be useful next?',
            submit: 'Send message',
            submitting: 'Sending...',
            successTitle: 'Message sent',
            successDescription: 'Thank you. Pavol will get back to you soon.',
            genericError: 'Something went wrong. Please try again.',
            requiredError: 'Please fill in your name, a valid email and a message.',
            contactsTitle: 'Direct links',
            contacts: contactLinksEn,
        },
        footer: {
            copyright: '© 2026 Pavol Hejný',
            links: [
                { label: 'Promptbook', href: '/' },
                { label: 'GitHub', href: 'https://github.com/hejny/' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/' },
                { label: 'CV', href: PAVOL_CV_URL },
            ],
        },
    },
    cs: {
        metadata: {
            title: 'Pavol Hejný | AI konzultace, workshopy a produktové prototypy',
            description:
                'Osobní stránka Pavola Hejného, foundera a CTO Promptbooku, zaměřená na praktické AI konzultace, workshopy, přednášky a produktové prototypy.',
            locale: 'cs_CZ',
            canonical: '/pavol/cs',
        },
        header: {
            contact: 'Kontakt',
            languageSwitch: 'English',
            centerLinks: [
                { href: '#services', label: 'Pomoc' },
                { href: '#testimonials', label: 'Reference' },
                { href: '#projects', label: 'Projekty' },
                { href: '#media', label: 'Média' },
            ],
        },
        hero: {
            eyebrow: 'AI, které opravdu pomáhá',
            title: 'Pavol Hejný',
            highlightedTitle: 'AI konzultant a produktový vývojář',
            description:
                'Pomáhám firmám zavádět AI agenty, AI coding a firemní AI procesy tak, aby přinášely skutečnou hodnotu v provozu, nejen v první demoverzi.',
            primaryCta: 'Spojme se',
            secondaryCta: 'Otevřít CV',
            badges: ['Founder & CTO Promptbooku', '15+ let vývoje softwaru', 'Open-source contributor'],
        },
        services: {
            eyebrow: 'Jak vám pomohu?',
            title: 'Praktická AI pro týmy, které potřebují výsledky',
            description:
                'AI není jeden nástroj ani jedno školení. Potřebuje dobrý výběr use-casů, pravidla, kontext a kontrolu kvality.',
            items: [
                {
                    title: 'AI konzultace',
                    description:
                        'Pomohu vám vyhodnotit, kde AI skutečně dává smysl, jaké nástroje zvolit a jak ošetřit data, oprávnění, vendor lock-in a interní procesy.',
                    bullets: [
                        'AI strategie a prioritizace use-casů',
                        'Agentní workflow, rulesety a návrh kontextu',
                        'Kontrola bezpečnosti dat, oprávnění a vendor lock-inu',
                    ],
                    highlight: 'Od vágního AI zadání ke konkrétnímu provoznímu modelu',
                },
                {
                    title: 'AI workshop / přednáška',
                    description:
                        'Přednáším a vedu workshopy o AI ve firmách, AI codingu, agentních workflow i o tom, kde končí hype a začíná použitelný produkční proces.',
                    bullets: [
                        'Workshopy pro vývojáře, produktové lidi i vedení',
                        'AI coding s PRD, Gitem, testy, CI/CD a code review',
                        'Srozumitelný jazyk pro týmy, které potřebují společný úsudek',
                    ],
                    highlight: 'Česky nebo anglicky, onsite nebo online',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Reference',
            title: 'Co říkají lidé, kteří s Pavolem spolupracovali',
            description:
                'Reference vycházejí ze starší osobní stránky a týkají se rychlého prototypování, vzdělávacích projektů a převádění nápadů do funkčních produktů.',
            metrics: [
                { value: '15+', label: 'let vývoje softwaru' },
                { value: '24/48 h', label: 'prototypovací mindset' },
                { value: 'Open', label: 'source-first portfolio' },
            ],
            items: [
                {
                    name: 'Tomáš Studeník',
                    role: 'Startupper',
                    testimonial:
                        'Pavola znám už 6 let, zejména z hackathonů a dalších inovačních projektů. Pokud se se svým týmem zúčastnil, mohli byste si vsadit, že bude mezi nejlepšími třemi. Pavol je inovátor, který se orientuje v nejnovějších technologiích a dokáže nacházet rychlá řešení výzev v průmyslu, vzdělávání či rozvoji měst.',
                    avatar: tomasStudenik,
                },
                {
                    name: 'Jan Šedo',
                    role: 'Zakladatel H-edu',
                    testimonial:
                        'Pavol vytvořil prototyp naší aplikace H-edu tak, že jsme okamžitě získali investici. Následně navrhl architekturu systému a využití technologií, které se v testu času ukázaly jako správně zvolené pro naše účely.',
                    avatar: janSedo,
                },
                {
                    name: 'Max Kozlov',
                    role: 'Founder & CEO, Undout',
                    testimonial:
                        'Pavol je naprosto špičkový v tvorbě digitálních produktů. Viděl jsem ho doslova přes noc vytvořit integrovaného chatbota, který nám zajistil první místo na Startup Weekendu v Praze.',
                    avatar: maxKozlov,
                },
                {
                    name: 'Bob Kartous',
                    role: 'Prorektor VŠEM, poradce a autor',
                    testimonial:
                        'Pavol je velmi schopný inovátor, jehož potenciál sahá napříč digitálními technologiemi a společenskými tématy. V projektech, na kterých jsme spolupracovali, přinesl do světa vzdělávání nové vize a přístupy.',
                    avatar: bobKartous,
                },
                {
                    name: 'Tereza Texlová',
                    role: 'Spoluzakladatelka Czech.events',
                    testimonial:
                        'Pracovala jsem už s mnoha vývojáři, ale Pavolova kombinace technických dovedností, veřejného vystupování a schopnosti nastartovat nové nápady je impozantní.',
                    avatar: terezaTexlova,
                },
            ],
        },
        projects: {
            eyebrow: 'Projekty',
            title: 'Vybraná práce',
            description:
                'Promptbook je jeden z Pavolových projektů. Širší stopa zahrnuje nástroje pro spolupráci, vzdělávací platformy a open-source software.',
            visit: 'Otevřít projekt',
            items: [
                {
                    title: 'Promptbook',
                    description:
                        'Ekosystém pro persistentní AI agenty, kteří pracují s cíli, znalostmi, pravidly a firemním kontextem místo jednorázového chatování.',
                    href: '/',
                    image: '/logo/promptbook-logo-blue-white-1024.png',
                    imageAlt: 'Logo Promptbooku',
                    badge: 'AI agenti',
                },
                {
                    title: 'Collboard',
                    description: 'Modulární online virtuální tabule pro vzdělávání, spolupráci a vizuální myšlení.',
                    href: 'https://collboard.com/',
                    image: '/pavol/projects/collboard-whiteboard.png',
                    imageAlt: 'Virtuální tabule Collboard',
                    badge: 'Online tabule',
                },
                {
                    title: 'H-edu',
                    description: 'Online platforma pro učitele a školy s interaktivními materiály a nástroji.',
                    href: 'https://www.h-edu.cz/',
                    image: '/pavol/projects/hedu-screenshot.png',
                    imageAlt: 'Ukázka platformy H-edu',
                    badge: 'Vzdělávání',
                },
            ],
        },
        media: {
            eyebrow: 'Média',
            title: 'Mediální výstupy a přednášky',
            description: 'Podcasty, videa a články, kde Pavol mluví o AI, vývoji a vzdělávání.',
            items: mediaItems,
        },
        contact: {
            eyebrow: 'Kontakt',
            title: 'Napište, co řešíte',
            description:
                'Formulář je pro konzultace, workshopy, přednášky nebo první rozhovor o praktickém AI workflow.',
            formTitle: 'Poslat zprávu',
            nameLabel: 'Jméno',
            namePlaceholder: 'Jana Nováková',
            emailLabel: 'E-mail',
            emailPlaceholder: 'jana@firma.cz',
            companyLabel: 'Firma / organizace',
            companyPlaceholder: 'Název firmy',
            topicLabel: 'Téma',
            topicOptions: ['AI konzultace', 'AI workshop / přednáška', 'Produkt nebo prototyp', 'Jiné'],
            messageLabel: 'Zpráva',
            messagePlaceholder: 'Co řešíte, jaké rozhodnutí potřebujete udělat a co by vám teď pomohlo?',
            submit: 'Odeslat zprávu',
            submitting: 'Odesílám...',
            successTitle: 'Zpráva odeslána',
            successDescription: 'Děkuji. Pavol se vám brzy ozve.',
            genericError: 'Nastala chyba. Zkuste to prosím znovu.',
            requiredError: 'Vyplňte prosím jméno, platný e-mail a zprávu.',
            contactsTitle: 'Přímé odkazy',
            contacts: contactLinksCs,
        },
        footer: {
            copyright: '© 2026 Pavol Hejný',
            links: [
                { label: 'Promptbook', href: '/' },
                { label: 'GitHub', href: 'https://github.com/hejny/' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/' },
                { label: 'CV', href: PAVOL_CV_URL },
            ],
        },
    },
};
