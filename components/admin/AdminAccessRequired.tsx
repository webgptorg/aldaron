type AdminAccessRequiredProps = {
    readonly actionPath: string;
};

export function AdminAccessRequired({ actionPath }: AdminAccessRequiredProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
            <form
                action={actionPath}
                method="get"
                className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl"
            >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Promptbook admin</p>
                <h1 className="mt-3 text-3xl font-bold">Je potřeba admin token</h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                    Vložte stejný token, který používají ostatní administrační stránky.
                </p>
                <label htmlFor="admin-token" className="mt-6 block text-sm font-medium text-slate-200">
                    Admin token
                </label>
                <input
                    id="admin-token"
                    name="token"
                    type="password"
                    autoComplete="current-password"
                    className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-slate-900 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                    required
                />
                <button
                    type="submit"
                    className="mt-4 h-11 w-full rounded-lg bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                    Otevřít administraci
                </button>
            </form>
        </main>
    );
}
