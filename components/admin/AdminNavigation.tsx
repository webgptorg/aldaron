import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin/adminConstants';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

type AdminNavigationProps = {
    readonly title: string;
};

export function AdminNavigation({ title }: AdminNavigationProps) {
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
                <Link
                    href={ADMIN_DASHBOARD_PATH}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    aria-label="Admin dashboard"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <LayoutDashboard className="h-5 w-5 text-cyan-600" />
                <h1 className="text-lg font-bold text-slate-950">{title}</h1>
                <div className="ml-auto">
                    <AdminSignOutButton />
                </div>
            </div>
        </header>
    );
}
