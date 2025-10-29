import Link from 'next/link';

export function FooterStatic() {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Product */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="https://ptbk.io/manifest"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Manifest
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/webgptorg/promptbook"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://promptbook.studio/miniapps/new"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Playground
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    AI Web, LLC
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://ptbk.io/about"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://ptbk.io/blog"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Connect</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="https://github.com/webgptorg/promptbook"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    GitHub
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://linkedin.com/company/promptbook"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    LinkedIn
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://discord.gg/x3QWNaa89N"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Discord
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    More
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/promptbook-logo-blue-256.png"
                                    alt="Promptbook"
                                    className="h-8 w-8 filter brightness-0 invert"
                                />
                                <span className="text-xl font-bold text-white">Promptbook</span>
                            </div>
                            <p className="text-sm text-gray-400 text-center lg:text-left">
                                © 2025 Promptbook
                                <br />
                                All rights reserved.
                            </p>
                            <p className="text-xs text-gray-500 text-center lg:text-left leading-relaxed">
                                The AI orchestration framework for building intelligent applications 11:11
                            </p>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://www.ptbk.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FCI-Technology-Incubation.6cc58993.png&w=828&q=75"
                                alt="Technology Incubation logo"
                                className="h-24 w-auto"
                            />
                            <p className="text-xs text-gray-500 text-center lg:text-right leading-relaxed">
                                This project was implemented with funding from the national budget
                                <br />
                                via the Ministry of Industry and Trade of the Czech Republic within the CzechInvest
                                Technology Incubation programme.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
