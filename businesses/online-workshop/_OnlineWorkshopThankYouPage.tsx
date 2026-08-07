import { ONLINE_WORKSHOP_THANK_YOU_PATH, onlineWorkshopConfig } from '@/businesses/online-workshop/config';
import { MetaPixelEvent } from '@/components/meta-pixel-event';
import { MinimalFooter } from '@/components/minimal-footer';
import { MinimalHeader } from '@/components/minimal-header';
import { Button } from '@/components/ui/button';
import { createCalendarLinks } from '@/lib/calendar/create-calendar-links';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import { ArrowRight, BellRing, CalendarPlus, CheckCircle2, Download, Mail, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Meta standard event reported once a registration is finished
 *
 * Note: The campaign can optimize either on this event or on a conversion defined by the url of this page - the pixel
 *       reports both, so the choice stays in the Meta administration.
 */
const REGISTRATION_META_PIXEL_EVENT_NAME = 'CompleteRegistration';

const { weekdayLabel, dateLabel, time, durationLabel, startsAt, endsAt } = onlineWorkshopConfig.date;

const { googleCalendarUrl, icalendarDataUrl } = createCalendarLinks({
    title: 'Online workshop: Produkční kód s AI agenty',
    description: `Bezplatný online workshop s Pavolem Hejným a Jiřím Jahnem. ${durationLabel}. Odkaz na připojení dorazí e-mailem.`,
    startsAt,
    endsAt,
    url: createAbsoluteUrl(ONLINE_WORKSHOP_THANK_YOU_PATH),
});

const NEXT_STEPS = [
    {
        icon: Mail,
        title: 'Potvrzovací e-mail už je na cestě',
        description:
            'Najdeš v něm odkaz na připojení. Kdyby nedorazil do pár minut, mrkni do spamu a do složky Hromadné.',
    },
    {
        icon: BellRing,
        title: 'Připomeneme se den předem',
        description: 'Pošleme krátkou připomínku, ať ti workshop neuteče mezi meetingy.',
    },
    {
        icon: Video,
        title: `${durationLabel} naživo`,
        description: 'Celé workflow od issue po merge na reálném repu, na konci prostor na tvoje otázky.',
    },
];

/**
 * Page confirming a finished registration for the online workshop
 *
 * Note: It lives on its own url, so that an ad campaign can optimize on real registrations instead of clicks.
 */
export function OnlineWorkshopThankYouPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <MetaPixelEvent eventName={REGISTRATION_META_PIXEL_EVENT_NAME} />

            <MinimalHeader />

            <main className="flex flex-1 items-center justify-center px-6 py-12 md:py-20">
                <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-50 to-teal-50 ring-8 ring-cyan-50/50">
                        <CheckCircle2 className="h-10 w-10 text-cyan-600" />
                    </div>

                    <h1 className="mb-4 text-[32px] font-extrabold tracking-tight text-[#0f172a] sm:text-[40px] leading-tight">
                        Máš místo na workshopu.
                    </h1>
                    <p className="mx-auto mb-10 max-w-lg text-[16px] leading-relaxed text-gray-500 sm:text-[18px]">
                        Uvidíme se {weekdayLabel} {dateLabel} v {time} online. Registrace je hotová, nic dalšího už
                        dělat nemusíš.
                    </p>

                    <div className="mx-auto mb-12 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button
                            asChild
                            className="h-12 rounded-full bg-promptbook-blue-dark px-6 text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
                        >
                            <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                                <CalendarPlus className="mr-2 h-5 w-5" />
                                Přidat do Google Kalendáře
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
                            <a href={icalendarDataUrl} download="promptbook-online-workshop.ics">
                                <Download className="mr-2 h-5 w-5" />
                                Stáhnout .ics
                            </a>
                        </Button>
                    </div>

                    <div className="mx-auto mb-16 max-w-md space-y-0">
                        {NEXT_STEPS.map((step, index) => {
                            const isLast = index === NEXT_STEPS.length - 1;

                            return (
                                <div key={step.title} className="flex gap-4 text-left">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        {!isLast && <div className="my-1 h-full w-px bg-gray-200" />}
                                    </div>
                                    <div className={isLast ? '' : 'pb-8'}>
                                        <h2 className="mb-1 text-[15px] font-bold text-[#0f172a]">{step.title}</h2>
                                        <p className="text-[14px] leading-relaxed text-gray-500">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mb-12 border-t border-gray-100 pt-12">
                        <div className="mb-6 flex items-center justify-center">
                            <Image
                                src={pavolHejny}
                                alt="Pavol Hejný"
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                            />
                            <Image
                                src={jiriJahn}
                                alt="Jiří Jahn"
                                width={56}
                                height={56}
                                className="-ml-4 h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                            />
                        </div>
                        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-gray-500">
                            Máš dotaz ještě před workshopem? Napiš rovnou na{' '}
                            <Link
                                href="mailto:pavol@ptbk.io"
                                className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                            >
                                pavol@ptbk.io
                            </Link>
                            .
                        </p>
                    </div>

                    <div className="mb-12 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 text-left">
                        <h2 className="text-[15px] font-bold text-[#0f172a]">
                            Chceš to projít do hloubky s vlastním týmem?
                        </h2>
                        <p className="mt-1 text-[14px] leading-relaxed text-gray-500">
                            Celodenní workshop AI Supervize Mini navazuje tam, kde těch 60 minut skončí.
                        </p>
                        <Link
                            href="/ai-supervize-mini"
                            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-cyan-700 underline-offset-4 hover:underline"
                        >
                            Prohlédnout celodenní workshop
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[14px] text-gray-400 transition-colors hover:text-gray-600"
                    >
                        ← Zpět na hlavní stránku
                    </Link>
                </div>
            </main>

            <MinimalFooter />
        </div>
    );
}
