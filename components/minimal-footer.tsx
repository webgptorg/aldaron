import Image from 'next/image';
import Link from 'next/link';

export function MinimalFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 py-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Logo + Copyright */}
                    <div className="flex items-center gap-3">
                        <Image
                            src="/promptbook-logo-blue-256.png"
                            alt="Promptbook"
                            width={38}
                            height={38}
                            className="w-[38px] h-[38px]"
                        />
                        <span className="text-xl text-gray-900">
                            Prompt<b>book</b>
                        </span>
                        <span className="text-[14px] text-gray-400 ml-2">
                            © 2026 Všechna práva vyhrazena.
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/privacy"
                            className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors duration-200"
                        >
                            Ochrana soukromí
                        </Link>
                        <Link
                            href="/terms"
                            className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors duration-200"
                        >
                            Podmínky užití
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
