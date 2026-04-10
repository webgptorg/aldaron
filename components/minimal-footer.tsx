import Link from 'next/link';

export function MinimalFooter() {
    return (
        <footer className="bg-[#0f172a] py-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Logo + Copyright */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0891b2] to-[#06b6d4] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="text-[14px] text-gray-400">© 2026 Promptbook. Všechna práva vyhrazena.</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/privacy"
                            className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors duration-200"
                        >
                            Ochrana soukromí
                        </Link>
                        <Link
                            href="/terms"
                            className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors duration-200"
                        >
                            Podmínky užití
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
