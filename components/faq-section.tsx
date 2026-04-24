'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        question: 'Nevymýšlí si to odpovědi? Jak můžu věřit AI?',
        answer: 'Promptbook čerpá výhradně z dokumentů, které do něj sami nahrajete. Když odpověď ve vašich datech není, narovinu to přizná. Žádné halucinace, žádné sebevědomé vymýšlení. A každá odpověď obsahuje odkaz na zdrojový dokument, takže si ji snadno ověříte.',
    },
    {
        question: 'Je to bezpečné pro citlivá firemní data?',
        answer: 'Vaše data nikdy neopustí vaši infrastrukturu. Nepoužíváme je k trénování žádných AI modelů. Jsme plně v souladu s GDPR a připravujeme certifikaci s AWS pro zpracování dat ve správné jurisdikci.',
    },
    {
        question: 'Musím školit zaměstnance?',
        answer: 'Ne. Vaši lidé jsou experti na svůj obor, ne ajťáci. Zeptají se normální češtinou - písemně nebo hlasovkou - jako by psali zprávu kolegovi. Žádné prompty, žádné školení.',
    },
    {
        question: 'Jak dlouho trvá nasazení?',
        answer: 'Minuty, ne měsíce. Nahrajete dokumenty, vytvoříte agenta a je online. Nepotřebujete IT oddělení, API integraci ani konzultanta.',
    },
    {
        question: 'Nahradí to lidi ve firmě?',
        answer: 'Ne. Promptbook automatizuje tu pěnu dní - rutinní dotazy, hledání PDFek, opakované odpovídání na to samé dokola. Vaši lidé díky tomu mají čas na smysluplnou práci a skutečnou spolupráci. Nenahrazujeme lidskou komunikaci - odstraňujeme tu její část, která všechny štve.',
    },
    {
        question: 'Kolik to stojí?',
        answer: 'Na strategickém hovoru vám připravíme nabídku přesně na míru vaší firmě. Hovor je zdarma a nezávazný - i kdybyste se rozhodli Promptbook nepoužívat, odnesete si konkrétní strategii, jak vyřešit chaos ve firemních datech.',
    },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="border-b border-gray-100 last:border-b-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group"
            >
                <span className="text-[16px] font-semibold text-[#0f172a] pr-4 group-hover:text-[#0891b2] transition-colors duration-200">
                    {question}
                </span>
                <div
                    className={`shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-cyan-50 border-cyan-200' : ''}`}
                >
                    <ChevronDown
                        className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-cyan-600' : 'text-gray-400'}`}
                    />
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-[15px] text-gray-500 leading-relaxed pr-12">{answer}</p>
            </div>
        </motion.div>
    );
}

export function FAQSection() {
    return (
        <section className="relative pt-[50px] pb-24 bg-white overflow-hidden">
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        Časté otázky
                    </p>
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight"
                        style={{ lineHeight: 1.2 }}
                    >
                        Máte otázky?{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            My máme odpovědi.
                        </span>
                    </h2>
                    <p className="text-[15px] text-gray-400 mt-3">Na rozdíl od ChatGPT si je nevymýšlíme.</p>
                </motion.div>

                {/* FAQ Items */}
                <div className="bg-white rounded-2xl border border-gray-100 px-8 divide-y-0">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
