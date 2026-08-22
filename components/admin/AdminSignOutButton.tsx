import { ADMIN_SIGN_OUT_API_PATH } from '@/lib/admin/adminConstants';
import { LogOut } from 'lucide-react';

/**
 * Ends the session of the administration, sent as a plain form so that no browser can end it by following a link
 */
export function AdminSignOutButton() {
    return (
        <form action={ADMIN_SIGN_OUT_API_PATH} method="post">
            <button
                type="submit"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            >
                <LogOut className="h-4 w-4" />
                Odhlásit se
            </button>
        </form>
    );
}
