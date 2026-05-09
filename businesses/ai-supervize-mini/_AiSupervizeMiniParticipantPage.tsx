import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { aiSupervizeMiniWorkshopConfig } from '@/businesses/ai-supervize-mini/config';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    Coffee,
    ExternalLink,
    HelpCircle,
    Mail,
    MapPin,
    MessageSquareText,
    NotebookTabs,
    ReceiptText,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';

type AiSupervizeMiniParticipantPageProps = {
    registrationId: string | null;
};

type InfoItem = {
    icon: LucideIcon;
    label: string;
    value: string;
    description: string;
};

type ScheduleItem = {
    time: string;
    title: string;
    description: string;
    icon: LucideIcon;
    badgeClassName: string;
};

type FaqItem = {
    question: string;
    answer: string;
};

const workshopDate = aiSupervizeMiniWorkshopConfig.dates[0]!;
const workshopLocation = {
    city: 'Praha',
    venue: 'Scott.Weber Workspace - The Flow Building',
    address: 'Václavské náměstí 47, Praha 1',
    note: 'Přesnou místnost a případné upřesnění recepce pošleme před kurzem e-mailem.',
    mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Scott.Weber%20Workspace%20The%20Flow%20Building%2C%20V%C3%A1clavsk%C3%A9%20n%C3%A1m%C4%9Bst%C3%AD%2047%2C%20Praha%201',
    venueUrl: 'https://scottweber.cz/location/the-flow-building/',
} as const;

const fakturoidAccountSlug = 'aiweb';

const infoItems: InfoItem[] = [
    {
        icon: CalendarDays,
        label: 'Termín',
        value: workshopDate.label,
        description: 'Celodenní praktická AI Supervize Mini pro registrované účastníky.',
    },
    {
        icon: Clock,
        label: 'Čas',
        value: aiSupervizeMiniWorkshopConfig.timeRange.replace('-', ' - '),
        description: 'Doporučujeme dorazit pár minut před začátkem, abychom mohli začít včas.',
    },
    {
        icon: MapPin,
        label: 'Místo',
        value: workshopLocation.city,
        description: `Pravděpodobně ${workshopLocation.venue}, ${workshopLocation.address}.`,
    },
];

const scheduleItems: ScheduleItem[] = [
    {
        time: '9:30 - 10:00',
        title: 'Obecné zahájení',
        description: 'Seznámení, očekávání účastníků, rámec dne a nastavení společného pracovního tempa.',
        icon: Sparkles,
        badgeClassName: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    },
    {
        time: '10:00 - 12:30',
        title: 'První blok',
        description: 'Praktické workflow pro zadávání práce AI, rozpad úkolů, PRD, issue a kontrolované změny v kódu.',
        icon: NotebookTabs,
        badgeClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    },
    {
        time: '12:30 - 13:30',
        title: 'Přestávka na oběd',
        description: 'Volná pauza na oběd a krátký reset. V okolí Václavského náměstí je dost možností.',
        icon: Coffee,
        badgeClassName: 'bg-amber-50 text-amber-700 ring-amber-200',
    },
    {
        time: '13:30 - 16:00',
        title: 'Druhý blok',
        description: 'Testování, code review, kvalita výstupu, práce s riziky a rozhodování nad nástroji a modely.',
        icon: ShieldCheck,
        badgeClassName: 'bg-sky-50 text-sky-700 ring-sky-200',
    },
    {
        time: '16:00 - 17:00',
        title: 'Diskuse, dotazy a další',
        description: 'Konkrétní situace účastníků, otevřené otázky, další kroky a doporučené workflow po workshopu.',
        icon: MessageSquareText,
        badgeClassName: 'bg-rose-50 text-rose-700 ring-rose-200',
    },
];

const preparationItems = [
    'Notebook, nabíječku a funkční přístup k internetu.',
    'IDE nebo editor, ve kterém běžně vyvíjíte, a přístup ke Gitu, pokud ho používáte.',
    'Přístup k AI nástrojům, které chcete během dne řešit nebo porovnat.',
    'Jeden konkrétní produktový, technický nebo procesní problém z vlastní praxe.',
    'Repozitář, ukázku workflow nebo anonymizovaný příklad. Citlivý kód sdílet nemusíte.',
] as const;

const faqItems: FaqItem[] = [
    {
        question: 'Je místo konání už finální?',
        answer: 'Počítáme s Prahou a pravděpodobně se Scott.Weber Workspace The Flow Building na Václavském náměstí. Pokud se upřesní místnost nebo dojde ke změně, pošleme ji e-mailem a aktualizujeme tuto stránku.',
    },
    {
        question: 'Musím mít připravený vlastní projekt?',
        answer: 'Není to povinné, ale velmi to pomůže. Stačí přinést kontext: typ produktu, způsob práce, ukázkové issue, problém v code review nebo místo, kde se dnes AI workflow zadrhává.',
    },
    {
        question: 'Bude se pracovat s citlivým kódem?',
        answer: 'Nemusí. Workshop je stavěný tak, aby šel aplikovat i na anonymizované ukázky, veřejné repozitáře nebo popsané workflow bez sdílení interních dat.',
    },
];

function getFakturoidInvoiceUrl(registrationId: string) {
    return `https://app.fakturoid.cz/${fakturoidAccountSlug}/invoices/${encodeURIComponent(registrationId)}`;
}

function SectionHeading({
    eyebrow,
    title,
    description,
    tone = 'light',
}: {
    eyebrow: string;
    title: string;
    description?: string;
    tone?: 'light' | 'dark';
}) {
    const isDark = tone === 'dark';

    return (
        <div className="mx-auto max-w-3xl text-center">
            <p
                className={
                    isDark
                        ? 'text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200 print:text-cyan-700'
                        : 'text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700'
                }
            >
                {eyebrow}
            </p>
            <h2
                className={
                    isDark
                        ? 'mt-3 text-3xl font-bold text-white print:text-slate-950 sm:text-4xl'
                        : 'mt-3 text-3xl font-bold text-slate-950 sm:text-4xl'
                }
            >
                {title}
            </h2>
            {description && (
                <p
                    className={
                        isDark
                            ? 'mt-4 text-base leading-relaxed text-white/68 print:text-slate-600 sm:text-lg'
                            : 'mt-4 text-base leading-relaxed text-slate-600 sm:text-lg'
                    }
                >
                    {description}
                </p>
            )}
        </div>
    );
}

export function AiSupervizeMiniParticipantPage({ registrationId }: AiSupervizeMiniParticipantPageProps) {
    const invoiceUrl = registrationId ? getFakturoidInvoiceUrl(registrationId) : null;
    const encodedRegistrationId = registrationId ? encodeURIComponent(registrationId) : null;
    const participantPageUrl = encodedRegistrationId
        ? `ptbk.io/ai-supervize-mini/participant?registration=${encodedRegistrationId}`
        : 'ptbk.io/ai-supervize-mini/participant?registration=ID_Z_FAKTUROIDU';

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <style>{`
                @media print {
                    .fixed,
                    .participant-print-hidden {
                        display: none !important;
                    }

                    main {
                        background: #ffffff !important;
                    }
                }
            `}</style>

            <Header
                getStartedText="Zálohová faktura"
                primaryAction={{
                    label: 'Zálohová faktura',
                    href: invoiceUrl ?? '#fakturace',
                    mobileLabel: 'Faktura',
                }}
                secondaryAction={{ label: 'Mapa', href: workshopLocation.mapsUrl }}
                centerContent={
                    <>
                        <span>AI Supervize Mini</span>
                        <span className="text-slate-300">|</span>
                        <strong className="text-slate-900">{workshopDate.label}</strong>
                    </>
                }
            />

            <section
                className="relative overflow-hidden bg-slate-950 pt-14 text-white"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(2, 6, 23, 0.96), rgba(15, 23, 42, 0.82)), url(/backgrounds/ai-supervize.svg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 100%',
                }}
            >
                <div className="container mx-auto grid min-h-[720px] items-center gap-10 px-4 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] print:min-h-0 print:py-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm">
                            <CalendarDays className="h-4 w-4 text-cyan-200" />
                            <span>Informace pro účastníka</span>
                            <span className="text-white/35">|</span>
                            <span>{workshopDate.label}</span>
                        </div>

                        <h1 className="mt-7 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                            AI Supervize Mini
                            <span className="mt-2 block bg-gradient-promptbook bg-clip-text text-transparent">
                                účastnický přehled
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82 sm:text-xl">
                            Vše důležité k jednodennímu workshopu na jednom místě: čas, místo, harmonogram, příprava,
                            fakturace a odpovědi na praktické otázky.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row participant-print-hidden">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full bg-promptbook-blue-dark px-7 text-white hover:bg-promptbook-blue-dark/90"
                            >
                                <a href="#harmonogram">
                                    Harmonogram dne
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-full border-white/20 bg-white/10 px-7 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                            >
                                <a href={workshopLocation.mapsUrl} target="_blank" rel="noreferrer">
                                    Otevřít mapu
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl print:border-slate-200 print:bg-white print:text-slate-900 print:shadow-none">
                        <div className="flex items-start justify-between gap-4 border-white/10 pb-5 print:border-slate-200">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200 print:text-cyan-700">
                                    Registrace
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-white print:text-slate-950">
                                    Vaše účast je evidovaná
                                </h2>
                            </div>
                            <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-emerald-300 print:text-emerald-600" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-14 print:bg-white print:py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {infoItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm print:shadow-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50">
                                            <Icon className="h-5 w-5 text-cyan-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                {item.label}
                                            </p>
                                            <h2 className="text-xl font-bold text-slate-950">{item.value}</h2>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-white py-20 print:py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Místo</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                                Praha, pravděpodobně Flow na Václaváku
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Počítáme s prémiovým prostorem Scott.Weber Workspace v The Flow Building. Místo je dobře
                                dostupné metrem z Muzea i Můstku a je vhodné pro intenzivní celodenní workshop.
                            </p>
                            <div className="mt-7 flex flex-col gap-3 sm:flex-row participant-print-hidden">
                                <Button
                                    asChild
                                    className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
                                >
                                    <a href={workshopLocation.mapsUrl} target="_blank" rel="noreferrer">
                                        Navigovat v mapě
                                        <MapPin className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full px-6">
                                    <a href={workshopLocation.venueUrl} target="_blank" rel="noreferrer">
                                        Detail místa
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white">
                                    <MapPin className="h-6 w-6 text-cyan-700" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-950">{workshopLocation.venue}</h3>
                                    <p className="mt-2 text-lg text-slate-700">{workshopLocation.address}</p>
                                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                        {workshopLocation.note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="harmonogram"
                className="bg-slate-950 py-20 text-white print:bg-white print:py-8 print:text-slate-900"
            >
                <div className="container mx-auto px-4">
                    <SectionHeading
                        eyebrow="Harmonogram"
                        title="Jeden den v jasném rytmu"
                        description="Program držíme praktický a soustředěný: krátké rámování, dva hlavní bloky, obědová pauza a prostor na konkrétní dotazy."
                        tone="dark"
                    />

                    <div className="mx-auto mt-12 max-w-4xl">
                        {scheduleItems.map((item, index) => {
                            const Icon = item.icon;
                            const isLast = index === scheduleItems.length - 1;

                            return (
                                <div
                                    key={item.time}
                                    className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[8.5rem_3rem_minmax(0,1fr)]"
                                >
                                    <div className="pt-1 text-sm font-semibold text-cyan-200 print:text-cyan-700 sm:text-right">
                                        {item.time}
                                    </div>
                                    <div className="relative hidden justify-center sm:flex">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 ${item.badgeClassName}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        {!isLast && (
                                            <div className="absolute top-12 h-[calc(100%-1rem)] w-px bg-white/15 print:bg-slate-200" />
                                        )}
                                    </div>
                                    <div className="pb-8">
                                        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 print:border-slate-200 print:bg-white">
                                            <div className="flex items-start gap-3 sm:hidden">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${item.badgeClassName}`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white print:text-slate-950">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <h3 className="hidden text-xl font-bold text-white print:text-slate-950 sm:block">
                                                {item.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed text-white/68 print:text-slate-600">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-20 print:bg-white print:py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Příprava</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                                Co si přinést a připravit
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Největší hodnotu z workshopu získáte, když přinesete reálný kontext. Nemusí být
                                perfektně připravený, stačí konkrétní situace, kterou chcete během dne zlepšit.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {preparationItems.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm print:shadow-none"
                                >
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20 print:py-8">
                <div className="container mx-auto px-4">
                    <SectionHeading
                        eyebrow="FAQ"
                        title="Praktické otázky před kurzem"
                        description="Krátké odpovědi k místu, přípravě, fakturaci a průběhu dne."
                    />

                    <div className="mx-auto mt-10 grid max-w-4xl gap-4">
                        {faqItems.map((item) => (
                            <div
                                key={item.question}
                                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm print:shadow-none"
                            >
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
                                    <div>
                                        <h3 className="font-bold text-slate-950">{item.question}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-950 py-20 text-white print:bg-white print:py-8 print:text-slate-900">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200 print:text-cyan-700">
                            Děkujeme
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Těšíme se na společný den</h2>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/72 print:text-slate-600">
                            Děkujeme za registraci na AI Supervizi Mini. Přineste svoje otázky, konkrétní situace a chuť
                            podívat se na AI vývoj prakticky. Uděláme z toho soustředěný a užitečný den.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row participant-print-hidden">
                            <Button asChild className="rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50">
                                <Link href="mailto:pavol@ptbk.io?subject=AI%20Supervize%20Mini%20-%20dotaz%20k%20workshopu">
                                    Napsat dotaz
                                    <Mail className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            {invoiceUrl && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
                                >
                                    <a href={invoiceUrl} target="_blank" rel="noreferrer">
                                        Zálohová faktura
                                        <ReceiptText className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer {...czechBusinessFooterProps} isTechnologyIncubationShown={false} />
        </main>
    );
}
