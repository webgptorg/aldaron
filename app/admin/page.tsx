import { COMMUNITY_ADMIN_PATH } from '@/businesses/community/config';
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';
import {
    ADMIN_CONTACTS_PATH,
    ADMIN_DASHBOARD_PATH,
    ADMIN_DISCOUNT_CODES_PATH,
    ADMIN_WORKSHOPS_PATH,
} from '@/lib/admin/adminConstants';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import { ContactRound, Link2, Radio, ShieldCheck, TicketPercent, UsersRound } from 'lucide-react';
import Link from 'next/link';

const ADMIN_PAGE_CARDS = [
    {
        path: ADMIN_WORKSHOPS_PATH,
        title: 'Živé workshopy',
        description: 'Stream, časovaný Markdown obsah, účastníci a moderace chatu.',
        icon: Radio,
    },
    {
        path: COMMUNITY_ADMIN_PATH,
        title: 'Komunita',
        description: 'Stálá komunitní místnost, její jeviště, účastníci a moderace.',
        icon: UsersRound,
    },
    {
        path: ADMIN_CONTACTS_PATH,
        title: 'Kontakty a leady',
        description: 'Kontakty získané z registračních a poptávkových formulářů.',
        icon: ContactRound,
    },
    {
        path: ADMIN_SHORTENER_PATH,
        title: 'Zkracovač odkazů',
        description: 'Vytváření veřejných krátkých odkazů a QR kódů.',
        icon: Link2,
    },
    {
        path: ADMIN_DISCOUNT_CODES_PATH,
        title: 'Slevové kódy',
        description: 'Platnost a výše slev pro registraci na AI Supervizi Mini.',
        icon: TicketPercent,
    },
] as const;

export default async function AdminDashboardPage() {
    await requireAdminSignedIn(ADMIN_DASHBOARD_PATH);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center gap-3 text-cyan-700">
                    <ShieldCheck className="h-6 w-6" />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em]">Promptbook admin</span>
                    <div className="ml-auto">
                        <AdminSignOutButton />
                    </div>
                </div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">Administrační dashboard</h1>
                <p className="mt-3 max-w-2xl text-slate-600">Všechny interní stránky na jednom místě.</p>

                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {ADMIN_PAGE_CARDS.map((page) => (
                        <Link
                            key={page.path}
                            href={page.path}
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
                        >
                            <page.icon className="h-8 w-8 text-cyan-600" />
                            <h2 className="mt-5 text-xl font-bold text-slate-950 group-hover:text-cyan-700">
                                {page.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{page.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
