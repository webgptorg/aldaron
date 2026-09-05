import type { AiTaKrajtaCollaborationKind } from '@/businesses/ai-ta-krajta/config';

export type AiTaKrajtaMediaKitStatistic = {
    readonly id: string;
    readonly value: string;
    readonly label: string;
    readonly description: string;
};

export type AiTaKrajtaPartnershipUseCase = {
    readonly title: string;
    readonly description: string;
};

export type AiTaKrajtaPartnershipOffer = {
    readonly id: string;
    readonly title: string;
    readonly priceLabel: string;
    readonly description: string;
    readonly deliverables: readonly string[];
    readonly callToActionLabel: string;
    readonly collaborationKind: AiTaKrajtaCollaborationKind;
};

export type AiTaKrajtaCollaborationGuide = {
    readonly collaborationKind: AiTaKrajtaCollaborationKind;
    readonly title: string;
    readonly description: string;
    readonly steps: readonly string[];
};

export type AiTaKrajtaPartnershipProcessStep = {
    readonly number: string;
    readonly title: string;
    readonly description: string;
};

export type AiTaKrajtaMediaKitFrequentlyAskedQuestion = {
    readonly question: string;
    readonly answer: string;
};

/**
 * Source note shown underneath every public statistic from the partnership handoff
 */
export const AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE = 'Zdroj: interní analytika AI ta Krajta, stav k 28. 8. 2026.';

/**
 * Public evidence of the reach and regularity of the show
 *
 * Note: These are the five statistics the handoff explicitly approves for public use. Do not add the private
 * analytics or inferred audience roles here without an approved replacement measurement.
 */
export const AI_TA_KRAJTA_MEDIA_KIT_STATISTICS: readonly AiTaKrajtaMediaKitStatistic[] = [
    {
        id: 'episodes',
        value: '65+',
        label: 'vydaných epizod',
        description: 'Každý týden nový díl',
    },
    {
        id: 'monthly-youtube-audience',
        value: '4,4 tis.',
        label: 'měsíčních diváků',
        description: 'YouTube, 28denní publikum',
    },
    {
        id: 'episode-views',
        value: '1 369',
        label: 'views za 30 dní',
        description: 'Medián jedné epizody',
    },
    {
        id: 'czech-slovak-audience',
        value: '85,5 %',
        label: 'publika z Česka a Slovenska',
        description: 'Lokální publikum',
    },
    {
        id: 'returning-audience',
        value: '42,4 %',
        label: 'vracejících se diváků',
        description: 'Příležitostní a pravidelní diváci',
    },
];

/**
 * Reasons a brand can work with the show without turning an episode into a product pitch
 */
export const AI_TA_KRAJTA_PARTNERSHIP_USE_CASES: readonly AiTaKrajtaPartnershipUseCase[] = [
    {
        title: 'Nábor a employer branding',
        description: 'Představte firmu, tým a otevřené role lidem, kteří dlouhodobě sledují technologie a AI.',
    },
    {
        title: 'Technická důvěryhodnost',
        description: 'Propojte značku s debatou o tématu, které má pro komunitu skutečnou hodnotu.',
    },
    {
        title: 'Thought leadership',
        description: 'Přiveďte experta do jasně označené epizody. Obsah zůstane redakčně nezávislý.',
    },
    {
        title: 'Relevantní produkt nebo event',
        description:
            'Ukažte nástroj, službu nebo událost tam, kde dávají smysl. Bez tlačení produktu do dílu za každou cenu.',
    },
];

/**
 * The only public commercial formats approved for the media kit
 */
export const AI_TA_KRAJTA_PARTNERSHIP_OFFERS: readonly AiTaKrajtaPartnershipOffer[] = [
    {
        id: 'episode-partner',
        title: 'Partner epizody',
        priceLabel: '12 000 Kč bez DPH',
        description: 'Pro první spolupráci nebo podporu konkrétního tématu.',
        deliverables: [
            'Nativní zmínka dlouhá 35–45 sekund, připravená a namluvená AI ta Krajta',
            'Umístění za obsahovým hookem, prioritní UTM odkaz a připnutý komentář na YouTube',
            'Logo nebo jednoduchý vizuál, jasné označení spolupráce a report po 7 a 30 dnech',
        ],
        callToActionLabel: 'Poptat epizodu',
        collaborationKind: 'partnerstvi',
    },
    {
        id: 'main-show-partner',
        title: 'Hlavní partner pořadu',
        priceLabel: 'Od 39 000 Kč měsíčně bez DPH',
        description: 'Partnerství na nejméně tři měsíce pro značku, která chce být u AI ta Krajta pravidelně.',
        deliverables: [
            'Čtyři plnohodnotné nativní integrace během 30 dní',
            'Prioritní logo a odkaz na webu a pod novými epizodami',
            'LinkedIn distribuce, UTM měření, report po 7 a 30 dnech a společné vyhodnocení',
        ],
        callToActionLabel: 'Probrat dlouhodobé partnerství',
        collaborationKind: 'partnerstvi',
    },
    {
        id: 'thematic-collaboration',
        title: 'Tematická spolupráce',
        priceLabel: 'Od 40 000 Kč bez DPH',
        description: 'Epizoda pro téma, které dává smysl publiku i partnerovi.',
        deliverables: [
            'Redakční epizoda s podporou partnera nebo výrazně označený partnerský speciál',
            'Partner může navrhnout experta, redakce určuje otázky, názory i finální zpracování',
            'Rozsah, klipy, distribuci a práva nastavíme podle konkrétního zadání',
        ],
        callToActionLabel: 'Navrhnout téma',
        collaborationKind: 'partnerstvi',
    },
];

/**
 * The boundaries which make the partnership useful to listeners as well as to the partner
 */
export const AI_TA_KRAJTA_EDITORIAL_PRINCIPLES: readonly string[] = [
    'Partner si nekupuje pozitivní hodnocení.',
    'Téma, host, otázky, název i finální střih podléhají redakci AI ta Krajta.',
    'Placená spolupráce je vždy jasně označená.',
    'Partner může opravit faktickou chybu o své firmě nebo produktu, ne odstranit nepohodlný názor.',
    'Negarantujeme leady ani views. Reportujeme skutečné výsledky.',
];

/**
 * Guidance for everyone who wants to help shape a future episode or work with the podcast
 */
export const AI_TA_KRAJTA_COLLABORATION_GUIDES: readonly AiTaKrajtaCollaborationGuide[] = [
    {
        collaborationKind: 'host',
        title: 'Chci přijít jako host',
        description:
            'Hledáme lidi, kteří něco skutečně staví, nasazují nebo poctivě zkoumají a dokážou mluvit i o slepých uličkách.',
        steps: [
            'Napište, čemu se věnujete a co si má posluchač odnést.',
            'Pošlete odkazy na práci, projekt, výzkum nebo přednášku, které pomohou téma pochopit.',
            'Hosta i téma vybírá redakce. Samotná nominace účast nezaručuje.',
        ],
    },
    {
        collaborationKind: 'tema',
        title: 'Mám tip na téma',
        description:
            'Nový nástroj, paper, regulace, spor nebo průšvih v AI může být dobrý díl. Rozhodující je, proč je důležitý právě teď.',
        steps: [
            'Pošlete odkaz, zdroj nebo krátké shrnutí.',
            'Přidejte jednu až dvě věty o tom, proč je téma podstatné pro lidi, kteří AI používají nebo řeší.',
            'Když se téma do epizody nehodí hned, redakce se k němu může vrátit později.',
        ],
    },
    {
        collaborationKind: 'partnerstvi',
        title: 'Chci partnerství nebo sponzoring',
        description: 'Vymyslíme formát, který pomůže vašemu cíli a bude dávat smysl posluchačům.',
        steps: [
            'Napište, jestli řešíte nábor, viditelnost, expertizu, produkt, event nebo konkrétní téma.',
            'Řekněte nám, kdy chcete spolupráci spustit a jaký máte orientační rozpočet. Pomůže nám to navrhnout rozsah.',
            'Pak si potvrdíme formát, redakční hranice, označení spolupráce a způsob vyhodnocení.',
        ],
    },
    {
        collaborationKind: 'jine',
        title: 'Mám jiný nápad na spolupráci',
        description:
            'Pošlete i nápad, který se nevejde do běžné škatulky. Společný díl nebo záznam z konference si rádi přečteme.',
        steps: [
            'Stručně popište záměr, komu má sloužit a proč dává pro AI ta Krajta smysl.',
            'Přidejte termín, místo nebo materiály, pokud už existují.',
            'Když bude nápad sedět redakčně i produkčně, ozveme se s dalším krokem.',
        ],
    },
];

/**
 * A transparent five-step path from the first message to partnership reporting
 */
export const AI_TA_KRAJTA_PARTNERSHIP_PROCESS: readonly AiTaKrajtaPartnershipProcessStep[] = [
    {
        number: '01',
        title: 'Popíšete, čeho chcete dosáhnout',
        description: 'Nábor, viditelnost, expertiza, event nebo konkrétní téma.',
    },
    {
        number: '02',
        title: 'Navrhneme formát',
        description: 'Dohodneme rozsah, termín, distribuci a způsob měření.',
    },
    {
        number: '03',
        title: 'Ujasníme redakční hranice',
        description: 'Host, téma a komerční část musí projít schválením.',
    },
    {
        number: '04',
        title: 'Natočíme a vydáme',
        description: 'Integraci nebo epizodu připravíme v našem stylu a jasně ji označíme.',
    },
    {
        number: '05',
        title: 'Vyhodnotíme výsledky',
        description: 'Po 7 a 30 dnech pošleme report a doporučení dalšího kroku.',
    },
];

/**
 * Public answers to the practical partnership questions from the handoff
 */
export const AI_TA_KRAJTA_MEDIA_KIT_FREQUENTLY_ASKED_QUESTIONS: readonly AiTaKrajtaMediaKitFrequentlyAskedQuestion[] = [
    {
        question: 'Můžeme navrhnout hosta?',
        answer: 'Ano. Host musí být relevantní pro publikum a schválit jej musí redakce AI ta Krajta. Nominace účast nezaručuje.',
    },
    {
        question: 'Můžeme schválit celou epizodu?',
        answer: 'Ne. Můžete opravit faktické informace o své firmě, produktu nebo pracovních pozicích. Otázky, názory, titulek, náhled a finální střih zůstávají v rukou redakce.',
    },
    {
        question: 'Garantujete počet views, leadů nebo kandidátů?',
        answer: 'Ne. Vycházíme z historických dat a po 7 a 30 dnech reportujeme skutečný výkon. Obchodní výsledek nezaručujeme.',
    },
    {
        question: 'Můžeme použít klipy na vlastních profilech?',
        answer: 'Oficiální klipy od AI ta Krajta můžete 12 měsíců sdílet bez placené podpory. Placená reklama, vlastní přestříhání nebo jiné rozšířené použití vyžadují samostatnou licenci.',
    },
    {
        question: 'Můžeme dodat vlastní video spot?',
        answer: 'Standardní nabídka stojí na nativní integraci, kterou připraví a namluví AI ta Krajta. Externě vyrobený reklamní spot do běžného formátu nepatří.',
    },
    {
        question: 'Je možné získat exkluzivitu?',
        answer: 'Ano, ale jen pro úzce vymezenou kategorii, na omezenou dobu a za příplatek. Obecnou exkluzivitu pro "AI", "IT" nebo "software" neposkytujeme.',
    },
    {
        question: 'Jak dlouhé je hlavní partnerství?',
        answer: 'Minimálně tři měsíce. Jednorázově můžeme udělat partnerství konkrétní epizody nebo tematickou epizodu.',
    },
];
