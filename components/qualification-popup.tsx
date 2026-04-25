'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Question {
    id: string;
    question: string;
    subtitle?: string;
    type: 'single' | 'contact';
    options?: string[];
    fields?: { id: string; label: string; type: string; placeholder: string; inputMode?: string }[];
}

const questions: Question[] = [
    {
        id: 'industry',
        question: 'V jakém oboru působíte?',
        type: 'single',
        options: [
            'Výroba / Průmysl',
            'Právo / Finance',
            'Stavebnictví / Real estate',
            'Veřejná správa / Vzdělávání',
            'IT / Technologie',
            'Jiný obor',
        ],
    },
    {
        id: 'pain_point',
        question: 'Co vás nejvíc trápí?',
        type: 'single',
        options: [
            'Lidé tráví hodiny hledáním dokumentů',
            'Senioři odpovídají stále na stejné dotazy',
            'Firemní data ve veřejném ChatGPT nás děsí',
            'Když odejde klíčový člověk, know-how zmizí s ním',
            'Zatím jen zkoumám, co Promptbook umí',
        ],
    },
    {
        id: 'urgency',
        question: 'Kdy byste chtěli začít?',
        type: 'single',
        options: ['Co nejdřív - řešíme to akutně', 'Příští kvartál', 'Zatím jen zkoumáme možnosti'],
    },
    {
        id: 'contact',
        question: 'Kam se vám ozveme?',
        subtitle: 'Jirka vám zavolá do 24 hodin.',
        type: 'contact',
        fields: [
            { id: 'name', label: 'Jméno', type: 'text', placeholder: 'Jan Novák' },
            { id: 'company', label: 'Firma', type: 'text', placeholder: 'Název vaší firmy' },
            { id: 'email', label: 'E-mail', type: 'email', placeholder: 'jan@firma.cz' },
            { id: 'phone', label: 'Telefon', type: 'tel', placeholder: '+420 777 123 456', inputMode: 'tel' },
        ],
    },
];

export function QualificationPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-qualification-popup', handleOpen);
        return () => window.removeEventListener('open-qualification-popup', handleOpen);
    }, []);

    const currentQuestion = questions[currentStep];
    const totalSteps = questions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const canProceed = () => {
        if (currentQuestion.type === 'contact') {
            const name = answers['name'];
            const email = answers['email'];
            const phone = answers['phone'];
            const company = answers['company'];
            if (!name || !email || !phone || !company) return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        return !!answers[currentQuestion.id];
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1);
        }
    };

    const handleOptionSelect = (option: string) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
        setTimeout(() => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep((s) => s + 1);
            }
        }, 450);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate submission - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        // Redirect to thank you page with personalization
        const params = new URLSearchParams({
            name: answers.name || '',
            email: answers.email || '',
        });
        window.location.href = `/dekujeme?${params.toString()}`;
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setCurrentStep(0);
            setAnswers({});
            setIsSubmitted(false);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-3xl shadow-2xl h-[600px] sm:h-[620px] flex flex-col">
                {/* Accessibility: hidden title for screen readers */}
                <VisuallyHidden>
                    <DialogTitle>Kvalifikační formulář</DialogTitle>
                </VisuallyHidden>

                {/* Progress bar */}
                {!isSubmitted && (
                    <div
                        className="h-1.5 bg-gray-100"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-[#0891b2] to-[#06b6d4] transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}

                {isSubmitted ? (
                    /* Success State */
                    <div className="px-8 py-14 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-cyan-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0f172a] mb-3">Výborně, {answers.name}!</h3>
                        <p className="text-[15px] text-gray-500 leading-relaxed mb-2">
                            Do 24 hodin se vám telefonicky ozve <strong className="text-[#0f172a]">Jirka</strong>.
                            Probereme vaše otázky a domluvíme termín videohovoru.
                        </p>
                        <p className="text-[13px] text-gray-400 leading-relaxed">
                            Odkaz na videohovor vám následně zašleme na{' '}
                            <strong className="text-gray-500">{answers.email}</strong>.
                        </p>
                        <Button onClick={handleClose} variant="outline" className="mt-8 rounded-full px-6">
                            Zavřít
                        </Button>
                    </div>
                ) : (
                    /* Question Steps */
                    <div className="px-5 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col overflow-y-auto">
                        {/* Header: value prop + step */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
                                    Krok {currentStep + 1} z {totalSteps}
                                </span>
                                <span className="text-[12px] text-emerald-600 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Zbývají 3 místa
                                </span>
                            </div>
                            {currentStep === 0 && (
                                <p className="text-[13px] text-gray-400 mt-2">
                                    5 otázek, 30 sekund. Ověříme, jestli pro vás Promptbook dává smysl.
                                </p>
                            )}
                        </div>

                        {/* Question */}
                        <h3 className="text-xl font-bold text-[#0f172a] mb-6">{currentQuestion.question}</h3>

                        {/* Single select options */}
                        {currentQuestion.type === 'single' && currentQuestion.options && (
                            <div className="space-y-2.5">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`w-full text-left px-5 py-3.5 rounded-xl border text-[15px] transition-all duration-200 ${
                                            answers[currentQuestion.id] === option
                                                ? 'border-[#0891b2] bg-cyan-50 text-[#0f172a] font-medium shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Contact fields */}
                        {currentQuestion.type === 'contact' && currentQuestion.fields && (
                            <div className="space-y-3">
                                {currentQuestion.subtitle && (
                                    <p className="text-[13px] text-gray-400 -mt-2 mb-3">{currentQuestion.subtitle}</p>
                                )}
                                {/* 2-column grid: Name + Company */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {currentQuestion.fields.slice(0, 2).map((field) => (
                                        <div key={field.id}>
                                            <label className="block text-[12px] font-medium text-gray-500 mb-1">
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type}
                                                inputMode={
                                                    field.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']
                                                }
                                                value={answers[field.id] || ''}
                                                onChange={(e) =>
                                                    setAnswers((prev) => ({
                                                        ...prev,
                                                        [field.id]: e.target.value,
                                                    }))
                                                }
                                                placeholder={field.placeholder}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#0f172a] placeholder:text-gray-300 focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-cyan-100 transition-all duration-200"
                                                autoFocus={field.id === 'name'}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Full-width: Email + Phone */}
                                {currentQuestion.fields.slice(2).map((field) => (
                                    <div key={field.id}>
                                        <label className="block text-[12px] font-medium text-gray-500 mb-1">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            inputMode={
                                                field.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']
                                            }
                                            value={answers[field.id] || ''}
                                            onChange={(e) =>
                                                setAnswers((prev) => ({
                                                    ...prev,
                                                    [field.id]: e.target.value,
                                                }))
                                            }
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#0f172a] placeholder:text-gray-300 focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-cyan-100 transition-all duration-200"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Navigation */}
                        {currentQuestion.type === 'contact' ? (
                            /* Contact step: centered CTA + back + GDPR */
                            <div className="mt-auto pt-6 flex flex-col items-center gap-3">
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed() || isSubmitting}
                                    className="bg-gradient-to-r from-[#0e7490] to-[#0891b2] text-white rounded-full px-8 py-5 text-[15px] font-semibold hover:shadow-lg hover:shadow-cyan-500/15 transition-all duration-300 disabled:opacity-40 w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        'Odesílám...'
                                    ) : (
                                        <>
                                            Rezervovat hovor zdarma
                                            <Calendar className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Zpět
                                </button>

                                <p className="text-[11px] text-gray-400 text-center mt-1">
                                    Odesláním souhlasíte s{' '}
                                    <a
                                        href="/ochrana-soukromi"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-gray-600 transition-colors"
                                    >
                                        ochranou osobních údajů
                                    </a>
                                    .
                                </p>
                            </div>
                        ) : (
                            /* Single-select steps: just back button */
                            <div className="flex items-center justify-between mt-auto pt-6">
                                <button
                                    onClick={handleBack}
                                    className={`flex items-center gap-1.5 text-[14px] text-gray-400 hover:text-gray-600 transition-colors ${
                                        currentStep === 0 ? 'invisible' : ''
                                    }`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Zpět
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
