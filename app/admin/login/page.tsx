import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { getAdminRedirectPath, isAdminSignInRefused } from '@/lib/admin/adminLoginRedirect';
import { isAdminSignedIn } from '@/lib/admin/isAdminSignedIn';
import { redirect } from 'next/navigation';

type AdminLoginPageProps = {
    readonly searchParams: Promise<{
        readonly redirectPath?: string | string[];
        readonly error?: string | string[];
    }>;
};

/**
 * The one place where the administration is entered, from which every other administration page is reached
 */
export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    const resolvedSearchParams = await searchParams;
    const redirectPath = getAdminRedirectPath(resolvedSearchParams.redirectPath);

    if (await isAdminSignedIn()) {
        redirect(redirectPath);
    }

    return (
        <AdminLoginForm
            redirectPath={redirectPath}
            isSignInRefused={isAdminSignInRefused(resolvedSearchParams.error)}
        />
    );
}
