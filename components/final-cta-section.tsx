'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Gift, Shield } from 'lucide-react';
import Link from 'next/link';

export function FinalCTASection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e] via-[#0e7490] to-[#0891b2]"></div>
            {/* Noise / texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                }}
            ></div>
            {/* Decorative orbs */}
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl"></div>

            <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7 }}
                    className="space-y-8"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
                        <Gift className="w-4 h-4 text-cyan-200" />
                        <span className="text-[13px] font-medium text-cyan-100 tracking-wide uppercase">
                            Nyní pro prvních 10 firem
                        </span>
                    </div>

                    {/* Heading */}
                    <h2
                        className="text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold text-white tracking-tight"
                        style={{ lineHeight: 1.2 }}
                    >
                        Přestaňte platit za hledání.
                        <br />
                        Začněte platit za práci.
                    </h2>

                    {/* Body */}
                    <p className="text-[17px] text-cyan-100/80 leading-relaxed max-w-xl mx-auto">
                        Zarezervujte si 20minutový strategický hovor s naším týmem. Žádný agresivní sales pitch —
                        projdeme vaši konkrétní situaci a ukážeme vám Promptbook přímo na vašich firemních datech.
                    </p>

                    {/* CTA */}
                    <div className="pt-2">
                        <Link href="?modal=get-started">
                            <Button
                                size="lg"
                                className="bg-white text-[#0e7490] hover:bg-gray-50 hover:shadow-2xl hover:shadow-black/20 transform hover:scale-[1.03] transition-all duration-300 text-[14px] sm:text-[16px] font-bold px-6 sm:px-10 py-5 sm:py-7 rounded-full"
                            >
                                Zarezervovat strategický hovor zdarma
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Trust micro-copy */}
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-6 gap-y-1.5 sm:gap-y-2 text-[13px] text-cyan-200/60">
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Bez závazků</span>
                        </div>
                        <span className="text-cyan-200/30 hidden sm:inline">|</span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>20 minut</span>
                        </div>
                        <span className="text-cyan-200/30 hidden sm:inline">|</span>
                        <span>Ukázka na vašich firemních datech</span>
                    </div>

                    {/* Confidentiality note */}
                    <p className="text-[12px] text-cyan-200/40 italic pt-2">
                        Vše, co na hovoru probereme, zůstane důvěrné.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
