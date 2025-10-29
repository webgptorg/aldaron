import Image from 'next/image';
import Link from 'next/link';

export function HeaderStatic() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/promptbook-logo-blue-256.png"
                            alt="Promptbook"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="text-xl text-gray-900">
                            Prompt<b>book</b>
                        </span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
