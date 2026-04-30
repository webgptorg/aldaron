import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type HomepageLanguage = SupportedHomepageLanguage;

export type HomepageChatMessage = {
    id: number;
    type: 'user' | 'bot';
    text: string;
    startDelay: number;
    static?: boolean;
};

type Question = {
    id: string;
    question: string;
    subtitle?: string;
    type: 'single' | 'contact';
    options?: string[];
    fields?: { id: string; label: string; type: string; placeholder: string; inputMode?: string }[];
};

type HomepageContent = {
    metadata: Metadata;
    loading: string;
    header: {
        fomoBefore: string;
        fomoStrong: string;
        fomoAfter: string;
        ctaMobile: string;
        ctaDesktop: string;
    };
    hero: {
        eyebrow: string;
        heading: ReactNode;
        description: ReactNode;
        cta: string;
        badges: [string, string, string];
        chatTitle: string;
        chatInputPlaceholder: string;
        chatMessages: HomepageChatMessage[];
    };
    socialProof: {
        eyebrow: string;
        industries: string[];
    };
    painPoints: {
        eyebrow: string;
        heading: ReactNode;
        points: {
            title: string;
            description: string;
            consequence: string;
        }[];
        timeAllocation: {
            title: string;
            beforeLabel: string;
            beforePrimary: string;
            beforeSecondary: string;
            beforeNote: string;
            afterLabel: string;
            afterPrimary: string;
            afterSecondary: string;
            afterNote: string;
        };
    };
    solution: {
        eyebrow: string;
        heading: ReactNode;
        description: string;
        benefits: {
            title: string;
            description: string;
            highlight: string;
        }[];
    };
    howItWorks: {
        eyebrow: string;
        heading: ReactNode;
        steps: {
            title: string;
            description: string;
        }[];
        cta: string;
    };
    enemy: {
        eyebrow: string;
        heading: ReactNode;
        chatgptLabel: string;
        promptbookLabel: string;
        comparisons: {
            feature: string;
            chatgpt: string;
            promptbook: string;
        }[];
    };
    testimonials: {
        eyebrow: string;
        heading: ReactNode;
        items: {
            quote: string;
            author: string;
            company: string;
        }[];
        metrics: {
            value: string;
            label: string;
            suffix: string;
        }[];
    };
    team: {
        title: string;
        description: ReactNode;
        jiriDescription: ReactNode;
        pavolDescription: ReactNode;
    };
    finalCta: {
        heading: ReactNode;
        description: string;
        cta: string;
        capacityPrefix: string;
        capacityStrong: string;
        capacitySuffix: string;
        capacityRemaining: string;
        capacityNote: string;
        riskReversal: string;
    };
    qualificationPopup: {
        dialogTitle: string;
        questions: Question[];
        successTitle: (name: string) => string;
        successDescription: ReactNode;
        successEmailPrefix: string;
        close: string;
        stepLabel: (currentStep: number, totalSteps: number) => string;
        remainingSpots: string;
        intro: string;
        submitting: string;
        submit: string;
        back: string;
        privacyPrefix: string;
        privacyLinkText: string;
        privacyHref: string;
    };
    bookingNotification: {
        notifications: { company: string; time: string }[];
        messageSuffix: string;
    };
};

export const homepageContent = {
    cs: {
        metadata: {
            title: 'Promptbook - Okamžitý přístup ke všemu, co vaše firma kdy napsala',
            description:
                'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR. Česká AI platforma.',
            alternates: {
                canonical: '/cs',
                languages: {
                    cs: '/cs',
                    en: '/en',
                },
            },
            openGraph: {
                title: 'Promptbook - Okamžitý přístup ke všemu, co vaše firma kdy napsala',
                description:
                    'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR.',
                locale: 'cs_CZ',
                type: 'website',
            },
            twitter: {
                title: 'Promptbook - Okamžitý přístup ke všemu, co vaše firma kdy napsala',
                description:
                    'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR.',
            },
        },
        loading: 'Načítání...',
        header: {
            fomoBefore: 'Zbývá',
            fomoStrong: '7 míst z 10',
            fomoAfter: 'pro strategický hovor zdarma',
            ctaMobile: 'Chci hovor zdarma',
            ctaDesktop: 'Zarezervovat hovor zdarma',
        },
        hero: {
            eyebrow: 'Česká AI platforma pro firemní data',
            heading: (
                <>
                    Co kdyby každý váš
                    <br />
                    zaměstnanec měl{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        okamžitý
                        <br />
                        přístup
                    </span>{' '}
                    ke všemu, co vaše
                    <br />
                    firma kdy napsala?
                </>
            ),
            description: (
                <>
                    Promptbook přečte až milion normostran vašich dokumentů a&nbsp;odpoví na cokoliv. Nový zaměstnanec.
                    Zkušený manažer. Každý dostane stejně přesnou odpověď.
                </>
            ),
            cta: 'Chci strategický hovor zdarma',
            badges: ['100% GDPR', 'Až 1 000 000 normostran', 'Česká platforma'],
            chatTitle: 'Promptbook - HR Asistent',
            chatInputPlaceholder: 'Napište dotaz...',
            chatMessages: [
                {
                    id: 1,
                    type: 'user',
                    text: 'Ahoj, jsem tu nová zaměstnankyně a potřebuju najít informace o dovolenkové politice firmy. Může mi někdo pomoct?',
                    startDelay: 0,
                    static: true,
                },
                {
                    id: 2,
                    type: 'bot',
                    text: 'Vítejte ve firmě, Anno! Všechny informace o dovolenkové politice najdete v naší interní znalostní bázi. Máte nárok na **25 dní dovolené ročně**.',
                    startDelay: 2000,
                    static: false,
                },
                {
                    id: 3,
                    type: 'bot',
                    text: 'Pošlu vám shrnutí přímo na e-mail, ať to máte po ruce. Potřebujete ještě s něčím pomoct?',
                    startDelay: 1200,
                    static: false,
                },
                {
                    id: 4,
                    type: 'user',
                    text: 'Super, děkuji moc! To je přesně to, co jsem potřebovala. 🙌',
                    startDelay: 1000,
                    static: false,
                },
            ],
        },
        socialProof: {
            eyebrow: 'Navrženo pro firmy, které berou svá data vážně',
            industries: [
                'Výrobní firmy',
                'Advokátní kanceláře',
                'Stavební firmy',
                'Veřejná správa',
                'Zdravotnictví',
                'Vzdělávání',
                'Logistika',
                'Energetika',
                'IT firmy',
                'Pojišťovnictví',
                'Farmaceutický průmysl',
                'E-commerce',
                'Účetní kanceláře',
                'Telekomunikace',
            ],
        },
        painPoints: {
            eyebrow: 'Proč firmy ztrácejí miliony',
            heading: (
                <>
                    Znalosti ve firmě existují.{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        Problém je, že je nikdo nenajde.
                    </span>
                </>
            ),
            points: [
                {
                    title: 'Roztříštěná firemní data',
                    description:
                        'Směrnice na SharePointu, smlouvy v e-mailech, manuály na Google Disku, procesy v hlavách lidí. Informace existují - ale jsou rozházené po desítkách systémů.',
                    consequence: 'Zaměstnanci tráví výraznou část dne hledáním místo práce, za kterou je platíte.',
                },
                {
                    title: 'Klíčoví lidé jako interní helpdesk',
                    description:
                        'Seniorní zaměstnanci zodpovídají stále stejné dotazy od nováčků a kolegů. Místo strategické práce řeší rutinní informační servis.',
                    consequence: 'Vaši nejdražší lidé dělají práci, kterou by měl dělat systém.',
                },
                {
                    title: 'Riziko veřejné AI',
                    description:
                        'Zaměstnanci řeší pracovní úkoly přes veřejný ChatGPT - včetně citlivých firemních dokumentů. Veřejná AI nemá kontext vaší firmy a při neznalosti si odpověď domyslí.',
                    consequence:
                        'Jedno rozhodnutí na základě vymyšlené informace může stát víc než roční rozpočet na nástroje.',
                },
                {
                    title: 'Odcházející know-how',
                    description:
                        'Když z firmy odejde zkušený člověk, odchází s ním znalosti, které nikde nejsou zdokumentované - rozhodovací procesy, kontext klientských vztahů, historické know-how.',
                    consequence: 'Firma přichází o roky budovanou expertízu, kterou nelze jednoduše nahradit.',
                },
            ],
            timeAllocation: {
                title: 'Kam mizí čas vašich lidí?',
                beforeLabel: 'Před',
                beforePrimary: 'Nedůležité',
                beforeSecondary: '20%',
                beforeNote: 'E-maily · Porady · Rutinní úkoly',
                afterLabel: 'Po nasazení Promptbooku',
                afterPrimary: 'Důležité',
                afterSecondary: '20%',
                afterNote: 'Rodina · Kreativita · Strategická práce',
            },
        },
        solution: {
            eyebrow: 'Řešení',
            heading: (
                <>
                    Virtuální zaměstnanec, který{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        zná celou firmu.
                    </span>
                </>
            ),
            description:
                'Nahrajte firemní dokumenty do bezpečného trezoru. Promptbook z nich vytvoří virtuálního zaměstnance - HR-istu, právníka, technika - kterého se kdokoliv zeptá normální češtinou.',
            benefits: [
                {
                    title: 'Bez promptování',
                    description:
                        'Žádné školení. Žádné napiš prompt jako ajťák. Vaši zaměstnanci jsou experti na svůj obor, ne na zaříkávání robotů. Prostě se zeptají - písemně nebo hlasovkou - a dostanou odpověď.',
                    highlight: 'Tak, jak jsou zvyklí komunikovat s lidmi.',
                },
                {
                    title: 'Kontextový trezor',
                    description:
                        'Data nikdy neopustí vaši infrastrukturu. Nepoužíváme je na trénování žádných modelů. Víte, co se stane, když zaměstnanec zkopíruje NDA do veřejného ChatGPT?',
                    highlight: 'My taky. Proto jsme to udělali jinak.',
                },
                {
                    title: 'Nevím je lepší než halucinace',
                    description:
                        'Veřejná AI si vymyslí pět odstavců, které zní důvěryhodně - a mohou vás stát firmu. Promptbook čerpá výhradně z vašich dat. A když odpověď nenajde?',
                    highlight: 'Narovinu řekne: Tuto informaci ve vašich dokumentech nemám.',
                },
            ],
        },
        howItWorks: {
            eyebrow: 'Jak to funguje',
            heading: (
                <>
                    Nasazení,{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        které nebolí.
                    </span>
                </>
            ),
            steps: [
                {
                    title: 'Nahrajete dokumenty',
                    description:
                        'Směrnice, smlouvy, manuály, NDAčka, zápisy z porad - cokoliv, co dnes leží rozházené po SharePointu, Google Disku nebo v šuplíku. Promptbook pojme až milion normostran.',
                },
                {
                    title: 'Vytvoříte virtuálního zaměstnance',
                    description:
                        'HR-istu, který zná pracovní řád. Právníka, který zná všechny smlouvy. Technika, který zná manuály. Každý agent odpovídá přesně podle vašich firemních dat.',
                },
                {
                    title: 'Lidé se ptají',
                    description:
                        'Normální češtinou. Jako by psali zprávu na WhatsApp. Nebo pošlou hlasovku. Bez promptů, bez školení, bez ajťáků.',
                },
            ],
            cta: 'Chci vidět, jak to funguje',
        },
        enemy: {
            eyebrow: 'Proč ne veřejný ChatGPT',
            heading: (
                <>
                    Tak to hodím do ChatGPT{' '}
                    <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                        je firemní sebevražda.
                    </span>
                </>
            ),
            chatgptLabel: 'Veřejný ChatGPT',
            promptbookLabel: 'Promptbook',
            comparisons: [
                {
                    feature: 'Když nezná odpověď',
                    chatgpt: 'Sebevědomě si ji vymyslí',
                    promptbook: 'Řekne: Nevím',
                },
                {
                    feature: 'Vaše firemní data',
                    chatgpt: 'Veřejný cloud. Kdo ví, kdo je čte',
                    promptbook: 'Zamčené ve vašem trezoru',
                },
                {
                    feature: 'Trénink na vašich datech',
                    chatgpt: 'Ano - trénuje na nich další modely',
                    promptbook: 'Ne. Nikdy.',
                },
                {
                    feature: 'Jak se ptáte',
                    chatgpt: '"Act as senior lawyer, temperature 0.2..."',
                    promptbook: '"Hele, kde je NDA z 2021?"',
                },
                {
                    feature: 'Firemní kontext',
                    chatgpt: 'Žádný. Neví nic o vaší firmě',
                    promptbook: 'Zná vaše směrnice, smlouvy, procesy',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Reference',
            heading: (
                <>
                    Co říkají firmy, které{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        přestaly hledat.
                    </span>
                </>
            ),
            items: [
                {
                    quote: 'Promptbook nás od sebe neodstřihl. Naopak - konečně máme čas řešit opravdovou práci, za kterou jsme placeni.',
                    author: 'IT oddělení',
                    company: 'Slezská univerzita v Opavě',
                },
                {
                    quote: 'Nováčci se už nemusí bát zeptat. Mají odpovědi okamžitě a přesně podle našich interních směrnic.',
                    author: 'Městská část',
                    company: 'Praha 13',
                },
            ],
            metrics: [
                { value: '1 000 000', label: 'normostran kapacity', suffix: '' },
                { value: '100%', label: 'GDPR compliance', suffix: '' },
                { value: '0', label: 'halucinací', suffix: '' },
            ],
        },
        team: {
            title: 'Seznamte se s naším týmem',
            description: (
                <>
                    Jsme tým odborníků, kteří pomáhají firmám využívat AI prakticky a bezpečně. Spojujeme zkušenosti z
                    technologií, výzkumu a podnikání:
                </>
            ),
            jiriDescription: (
                <>
                    Ph.D. z matematiky, bývalý výzkumník v{' '}
                    <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>.
                </>
            ),
            pavolDescription: (
                <>
                    Jeden z předních <Link href="https://www.pavolhejny.com/">open-source contributorů</Link> v Česku.
                    Vývojář s 15+ lety zkušeností.
                </>
            ),
        },
        finalCta: {
            heading: (
                <>
                    Přestaňte platit za hledání.
                    <br />
                    Začněte platit za práci.
                </>
            ),
            description:
                'Zarezervujte si 20minutový strategický hovor s naším týmem. Žádný agresivní sales pitch - projdeme vaši konkrétní situaci a ukážeme vám Promptbook přímo na vašich firemních datech.',
            cta: 'Zarezervovat strategický hovor zdarma',
            capacityPrefix: 'Obsazeno',
            capacityStrong: '7',
            capacitySuffix: 'z 10 míst',
            capacityRemaining: 'Zbývají 3',
            capacityNote: 'Bereme max. 10 firem měsíčně, abychom se každé mohli věnovat individuálně.',
            riskReversal:
                'I kdybyste se rozhodli Promptbook nepoužívat, odnesete si konkrétní strategii, jak vyřešit chaos ve firemních datech.',
        },
        qualificationPopup: {
            dialogTitle: 'Kvalifikační formulář',
            questions: [
                {
                    id: 'industry',
                    question: 'V jakém oboru působíte?',
                    type: 'single',
                    options: [
                        'Výroba / Průmysl',
                        'Právo / Finance',
                        'Stavebnictví / Real estate',
                        'Veřejná správa / Vzdělávání',
                        'IT / Technologie',
                        'Jiný obor',
                    ],
                },
                {
                    id: 'pain_point',
                    question: 'Co vás nejvíc trápí?',
                    type: 'single',
                    options: [
                        'Lidé tráví hodiny hledáním dokumentů',
                        'Senioři odpovídají stále na stejné dotazy',
                        'Firemní data ve veřejném ChatGPT nás děsí',
                        'Když odejde klíčový člověk, know-how zmizí s ním',
                        'Zatím jen zkoumám, co Promptbook umí',
                    ],
                },
                {
                    id: 'urgency',
                    question: 'Kdy byste chtěli začít?',
                    type: 'single',
                    options: ['Co nejdřív - řešíme to akutně', 'Příští kvartál', 'Zatím jen zkoumáme možnosti'],
                },
                {
                    id: 'contact',
                    question: 'Kam se vám ozveme?',
                    subtitle: 'Jirka vám zavolá do 24 hodin.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Jméno', type: 'text', placeholder: 'Jan Novák' },
                        { id: 'company', label: 'Firma', type: 'text', placeholder: 'Název vaší firmy' },
                        { id: 'email', label: 'E-mail', type: 'email', placeholder: 'jan@firma.cz' },
                        {
                            id: 'phone',
                            label: 'Telefon',
                            type: 'tel',
                            placeholder: '+420 777 123 456',
                            inputMode: 'tel',
                        },
                    ],
                },
            ],
            successTitle: (name) => `Výborně, ${name}!`,
            successDescription: (
                <>
                    Do 24 hodin se vám telefonicky ozve <strong className="text-[#0f172a]">Jirka</strong>. Probereme
                    vaše otázky a domluvíme termín videohovoru.
                </>
            ),
            successEmailPrefix: 'Odkaz na videohovor vám následně zašleme na',
            close: 'Zavřít',
            stepLabel: (currentStep, totalSteps) => `Krok ${currentStep + 1} z ${totalSteps}`,
            remainingSpots: 'Zbývají 3 místa',
            intro: '5 otázek, 30 sekund. Ověříme, jestli pro vás Promptbook dává smysl.',
            submitting: 'Odesílám...',
            submit: 'Rezervovat hovor zdarma',
            back: 'Zpět',
            privacyPrefix: 'Odesláním souhlasíte s',
            privacyLinkText: 'ochranou osobních údajů',
            privacyHref: '/privacy',
        },
        bookingNotification: {
            notifications: [
                { company: 'Firma z Prahy', time: 'před 2 hodinami' },
                { company: 'Firma z Brna', time: 'před 4 hodinami' },
                { company: 'Firma z Ostravy', time: 'včera' },
            ],
            messageSuffix: 'si zarezervovala strategický hovor',
        },
    },
    en: {
        metadata: {
            title: 'Promptbook - Instant access to everything your company has ever written',
            description:
                'Upload company documents, create a virtual employee, and ask questions in natural language. No prompting, no hallucinations, 100% GDPR. A Czech AI platform.',
            alternates: {
                canonical: '/en',
                languages: {
                    cs: '/cs',
                    en: '/en',
                },
            },
            openGraph: {
                title: 'Promptbook - Instant access to everything your company has ever written',
                description:
                    'Upload company documents, create a virtual employee, and ask questions in natural language. No prompting, no hallucinations, 100% GDPR.',
                locale: 'en_US',
                type: 'website',
            },
            twitter: {
                title: 'Promptbook - Instant access to everything your company has ever written',
                description:
                    'Upload company documents, create a virtual employee, and ask questions in natural language. No prompting, no hallucinations, 100% GDPR.',
            },
        },
        loading: 'Loading...',
        header: {
            fomoBefore: 'Only',
            fomoStrong: '7 of 10 spots',
            fomoAfter: 'left for a free strategy call',
            ctaMobile: 'Free call',
            ctaDesktop: 'Book a free call',
        },
        hero: {
            eyebrow: 'Czech AI platform for company data',
            heading: (
                <>
                    What if every
                    <br />
                    employee had{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        instant
                        <br />
                        access
                    </span>{' '}
                    to everything your
                    <br />
                    company has ever written?
                </>
            ),
            description: (
                <>
                    Promptbook reads up to one million standard pages of your documents and answers anything. New hire.
                    Experienced manager. Everyone gets the same precise answer.
                </>
            ),
            cta: 'I want a free strategy call',
            badges: ['100% GDPR', 'Up to 1,000,000 standard pages', 'Czech platform'],
            chatTitle: 'Promptbook - HR Assistant',
            chatInputPlaceholder: 'Type a question...',
            chatMessages: [
                {
                    id: 1,
                    type: 'user',
                    text: "Hi, I'm a new employee and need to find information about the company's vacation policy. Can someone help me?",
                    startDelay: 0,
                    static: true,
                },
                {
                    id: 2,
                    type: 'bot',
                    text: 'Welcome to the company, Anna! You can find all vacation policy details in our internal knowledge base. You are entitled to **25 vacation days per year**.',
                    startDelay: 2000,
                    static: false,
                },
                {
                    id: 3,
                    type: 'bot',
                    text: 'I will send a summary directly to your email so you have it at hand. Do you need help with anything else?',
                    startDelay: 1200,
                    static: false,
                },
                {
                    id: 4,
                    type: 'user',
                    text: 'Great, thank you! That is exactly what I needed. 🙌',
                    startDelay: 1000,
                    static: false,
                },
            ],
        },
        socialProof: {
            eyebrow: 'Designed for companies that take their data seriously',
            industries: [
                'Manufacturing companies',
                'Law firms',
                'Construction companies',
                'Public administration',
                'Healthcare',
                'Education',
                'Logistics',
                'Energy',
                'IT companies',
                'Insurance',
                'Pharmaceutical industry',
                'E-commerce',
                'Accounting firms',
                'Telecommunications',
            ],
        },
        painPoints: {
            eyebrow: 'Why companies lose millions',
            heading: (
                <>
                    Knowledge exists inside the company.{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        The problem is that no one can find it.
                    </span>
                </>
            ),
            points: [
                {
                    title: 'Scattered company data',
                    description:
                        'Policies on SharePoint, contracts in email, manuals on Google Drive, processes in people’s heads. The information exists, but it is scattered across dozens of systems.',
                    consequence:
                        'Employees spend a significant part of the day searching instead of doing the work you pay them for.',
                },
                {
                    title: 'Key people as an internal help desk',
                    description:
                        'Senior employees answer the same questions from newcomers and colleagues again and again. Instead of strategic work, they handle routine information requests.',
                    consequence: 'Your most expensive people are doing work that should be handled by a system.',
                },
                {
                    title: 'Public AI risk',
                    description:
                        'Employees solve work tasks through public ChatGPT, including sensitive company documents. Public AI has no context about your company and invents answers when it does not know.',
                    consequence:
                        'One decision based on fabricated information can cost more than an annual tooling budget.',
                },
                {
                    title: 'Departing know-how',
                    description:
                        'When an experienced person leaves the company, they take knowledge that is not documented anywhere: decision processes, client context, historical know-how.',
                    consequence: 'The company loses years of expertise that cannot be replaced easily.',
                },
            ],
            timeAllocation: {
                title: 'Where does your team’s time disappear?',
                beforeLabel: 'Before',
                beforePrimary: 'Low-value',
                beforeSecondary: '20%',
                beforeNote: 'Emails · Meetings · Routine tasks',
                afterLabel: 'After deploying Promptbook',
                afterPrimary: 'High-value',
                afterSecondary: '20%',
                afterNote: 'Family · Creativity · Strategic work',
            },
        },
        solution: {
            eyebrow: 'Solution',
            heading: (
                <>
                    A virtual employee who{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        knows the whole company.
                    </span>
                </>
            ),
            description:
                'Upload company documents into a secure vault. Promptbook turns them into a virtual employee - HR specialist, lawyer, technician - whom anyone can ask in plain language.',
            benefits: [
                {
                    title: 'No prompting',
                    description:
                        'No training. No “write a prompt like an IT person.” Your employees are experts in their field, not in instructing robots. They simply ask, by text or voice, and get an answer.',
                    highlight: 'The same way they are used to communicating with people.',
                },
                {
                    title: 'Context vault',
                    description:
                        'Data never leaves your infrastructure. We do not use it to train any models. Do you know what happens when an employee copies an NDA into public ChatGPT?',
                    highlight: 'We do too. That is why we built it differently.',
                },
                {
                    title: '“I don’t know” beats hallucination',
                    description:
                        'Public AI invents five paragraphs that sound convincing and can cost you the company. Promptbook draws only from your data. And when it cannot find the answer?',
                    highlight: 'It says plainly: I do not have this information in your documents.',
                },
            ],
        },
        howItWorks: {
            eyebrow: 'How it works',
            heading: (
                <>
                    Deployment{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        without the pain.
                    </span>
                </>
            ),
            steps: [
                {
                    title: 'Upload documents',
                    description:
                        'Policies, contracts, manuals, NDAs, meeting notes - anything currently scattered across SharePoint, Google Drive, or a drawer. Promptbook handles up to one million standard pages.',
                },
                {
                    title: 'Create a virtual employee',
                    description:
                        'An HR specialist who knows the employee handbook. A lawyer who knows every contract. A technician who knows the manuals. Each agent answers precisely from your company data.',
                },
                {
                    title: 'People ask questions',
                    description:
                        'In plain language. As if they were sending a message on WhatsApp. Or they send a voice note. No prompts, no training, no IT team needed.',
                },
            ],
            cta: 'I want to see how it works',
        },
        enemy: {
            eyebrow: 'Why not public ChatGPT',
            heading: (
                <>
                    “I’ll just put it into ChatGPT”{' '}
                    <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                        is corporate self-sabotage.
                    </span>
                </>
            ),
            chatgptLabel: 'Public ChatGPT',
            promptbookLabel: 'Promptbook',
            comparisons: [
                {
                    feature: 'When it does not know',
                    chatgpt: 'It confidently makes the answer up',
                    promptbook: 'It says: I don’t know',
                },
                {
                    feature: 'Your company data',
                    chatgpt: 'Public cloud. Who knows who reads it',
                    promptbook: 'Locked in your vault',
                },
                {
                    feature: 'Training on your data',
                    chatgpt: 'Yes - it trains other models on it',
                    promptbook: 'No. Never.',
                },
                {
                    feature: 'How you ask',
                    chatgpt: '"Act as senior lawyer, temperature 0.2..."',
                    promptbook: '"Hey, where is the 2021 NDA?"',
                },
                {
                    feature: 'Company context',
                    chatgpt: 'None. It knows nothing about your company',
                    promptbook: 'It knows your policies, contracts, processes',
                },
            ],
        },
        testimonials: {
            eyebrow: 'References',
            heading: (
                <>
                    What companies that{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        stopped searching say.
                    </span>
                </>
            ),
            items: [
                {
                    quote: 'Promptbook did not cut us off from each other. The opposite - we finally have time for the real work we are paid to do.',
                    author: 'IT department',
                    company: 'Silesian University in Opava',
                },
                {
                    quote: 'Newcomers no longer have to be afraid to ask. They get answers immediately and precisely according to our internal policies.',
                    author: 'Municipal district',
                    company: 'Prague 13',
                },
            ],
            metrics: [
                { value: '1,000,000', label: 'standard pages of capacity', suffix: '' },
                { value: '100%', label: 'GDPR compliance', suffix: '' },
                { value: '0', label: 'hallucinations', suffix: '' },
            ],
        },
        team: {
            title: 'Meet Our Team',
            description: (
                <>
                    We are a dedicated group of professionals committed to leveraging AI to transform businesses. With
                    diverse backgrounds in technology, research, and entrepreneurship:
                </>
            ),
            jiriDescription: (
                <>
                    Ph.D. in Mathematics, former researcher at{' '}
                    <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>.
                </>
            ),
            pavolDescription: (
                <>
                    Top <Link href="https://www.pavolhejny.com/">open-source contributor</Link> in Czechia. Developer
                    with 15+ years of experience.
                </>
            ),
        },
        finalCta: {
            heading: (
                <>
                    Stop paying for searching.
                    <br />
                    Start paying for work.
                </>
            ),
            description:
                'Book a 20-minute strategy call with our team. No aggressive sales pitch - we will go through your specific situation and show you Promptbook directly on your company data.',
            cta: 'Book a free strategy call',
            capacityPrefix: 'Booked',
            capacityStrong: '7',
            capacitySuffix: 'of 10 spots',
            capacityRemaining: '3 left',
            capacityNote: 'We work with a maximum of 10 companies per month so we can support each one individually.',
            riskReversal:
                'Even if you decide not to use Promptbook, you will leave with a concrete strategy for fixing chaos in company data.',
        },
        qualificationPopup: {
            dialogTitle: 'Qualification form',
            questions: [
                {
                    id: 'industry',
                    question: 'What industry are you in?',
                    type: 'single',
                    options: [
                        'Manufacturing / Industry',
                        'Legal / Finance',
                        'Construction / Real estate',
                        'Public administration / Education',
                        'IT / Technology',
                        'Other industry',
                    ],
                },
                {
                    id: 'pain_point',
                    question: 'What is your biggest pain point?',
                    type: 'single',
                    options: [
                        'People spend hours searching for documents',
                        'Senior people answer the same questions again and again',
                        'Company data in public ChatGPT worries us',
                        'When a key person leaves, know-how leaves with them',
                        'I am just exploring what Promptbook can do',
                    ],
                },
                {
                    id: 'urgency',
                    question: 'When would you like to start?',
                    type: 'single',
                    options: ['As soon as possible - this is urgent', 'Next quarter', 'We are just exploring options'],
                },
                {
                    id: 'contact',
                    question: 'Where should we contact you?',
                    subtitle: 'Jiri will call you within 24 hours.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Name', type: 'text', placeholder: 'Jane Smith' },
                        { id: 'company', label: 'Company', type: 'text', placeholder: 'Your company name' },
                        { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com' },
                        { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 123 4567', inputMode: 'tel' },
                    ],
                },
            ],
            successTitle: (name) => `Excellent, ${name}!`,
            successDescription: (
                <>
                    <strong className="text-[#0f172a]">Jiri</strong> will call you within 24 hours. We will go through
                    your questions and schedule a video call.
                </>
            ),
            successEmailPrefix: 'We will then send the video call link to',
            close: 'Close',
            stepLabel: (currentStep, totalSteps) => `Step ${currentStep + 1} of ${totalSteps}`,
            remainingSpots: '3 spots left',
            intro: '5 questions, 30 seconds. We will check whether Promptbook makes sense for you.',
            submitting: 'Submitting...',
            submit: 'Book a free call',
            back: 'Back',
            privacyPrefix: 'By submitting, you agree to our',
            privacyLinkText: 'privacy policy',
            privacyHref: '/privacy',
        },
        bookingNotification: {
            notifications: [
                { company: 'Company from Prague', time: '2 hours ago' },
                { company: 'Company from Brno', time: '4 hours ago' },
                { company: 'Company from Ostrava', time: 'yesterday' },
            ],
            messageSuffix: 'booked a strategy call',
        },
    },
} satisfies Record<HomepageLanguage, HomepageContent>;

export function getHomepageContent(language: HomepageLanguage = 'cs') {
    return homepageContent[language];
}
