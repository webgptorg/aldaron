'use client';

import { subscribeToWaitlist } from '@/app/subscription/subscribeToWaitlist';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCloseGetStartedModal } from '@/hooks/useCloseGetStartedModal';
import { useGetParam } from '@/hooks/useGetParam';
import { ArrowLeft, ArrowRight, CheckCircle2, Send, X } from 'lucide-react';
import { useState } from 'react';

interface Question {
    id: string;
    question: string;
    type: 'single' | 'text' | 'email';
    options?: string[];
    placeholder?: string;
    required?: boolean;
}

const questions: Question[] = [
    {
        id: 'company_size',
        question: 'Kolik má vaše firma zaměstnanců?',
        type: 'single',
        options: ['1–10', '11–50', '51–200', '201–1000', '1000+'],
    },
    {
        id: 'industry',
        question: 'V jakém oboru působíte?',
        type: 'single',
        options: [
            'Výroba / Průmysl',
            'Právo / Advokacie',
            'Stavebnictví',
            'Veřejná správa',
            'Zdravotnictví',
            'IT / Technologie',
            'Finance / Bankovnictví',
            'Vzdělávání',
            'Jiné',
        ],
    },
    {
        id: 'pain_point',
        question: 'Co vás nejvíc trápí?',
        type: 'single',
        options: [
            'Zaměstnanci nedokáží najít interní informace',
            'Klíčoví lidé tráví čas odpovídáním na rutinní dotazy',
            'Obavy z používání veřejného ChatGPT na firemní data',
            'Odcházejí nám zkušení lidé a jejich know-how s nimi',
            'Chci prostě vědět, co Promptbook umí',
        ],
    },
    {
        id: 'name',
        question: 'Jak vám budeme říkat?',
        type: 'text',
        placeholder: 'Vaše jméno',
        required: true,
    },
    {
        id: 'email',
        question: 'Kam vám pošleme potvrzení?',
        type: 'email',
        placeholder: 'vas@email.cz',
        required: true,
    },
];

interface QualificationPopupProps {
    placeName: string;
}

export function QualificationPopup({ placeName }: QualificationPopupProps) {
    const [modal] = useGetParam('modal');
    const closeModal = useCloseGetStartedModal();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentStep];
    const totalSteps = questions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const canProceed = () => {
        const answer = answers[currentQuestion.id];
        if (currentQuestion.required && !answer) return false;
        if (currentQuestion.type === 'email' && answer) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer);
        }
        return !!answer;
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
        // Auto-advance for single-select after a brief delay
        setTimeout(() => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep((s) => s + 1);
            }
        }, 300);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const qualificationNote = [
                `Firma: ${answers.company_size || '–'}`,
                `Obor: ${answers.industry || '–'}`,
                `Pain point: ${answers.pain_point || '–'}`,
                `Jméno: ${answers.name || '–'}`,
            ].join(' | ');

            await subscribeToWaitlist(answers.email || '', placeName, undefined, qualificationNote);
        } catch {
            // Submission failed — still show success to avoid blocking the user
            console.error('QualificationPopup: submission failed');
        }
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleClose = () => {
        closeModal();
        // Reset after animation
        setTimeout(() => {
            setCurrentStep(0);
            setAnswers({});
            setIsSubmitted(false);
        }, 300);
    };

    return (
        <Dialog open={modal === 'get-started'} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-3xl shadow-2xl">
                {/* Progress bar */}
                {!isSubmitted && (
                    <div className="h-1 bg-gray-100">
                        <div
                            className="h-full bg-gradient-to-r from-[#0891b2] to-[#06b6d4] transition-all duration-500 ease-out"
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
                        <h3 className="text-2xl font-bold text-[#0f172a] mb-3">Skvělé, ozveme se!</h3>
                        <p className="text-[15px] text-gray-500 leading-relaxed mb-2">
                            Na <strong className="text-[#0f172a]">{answers.email}</strong> vám do 24 hodin pošleme odkaz
                            na rezervaci strategického hovoru.
                        </p>
                        <p className="text-[13px] text-gray-400 italic">
                            Díky za důvěru, {answers.name}. Připravíme se na váš obor.
                        </p>
                        <Button onClick={handleClose} variant="outline" className="mt-8 rounded-full px-6">
                            Zavřít
                        </Button>
                    </div>
                ) : (
                    /* Question Steps */
                    <div className="px-8 py-8">
                        {/* Step indicator + close */}
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
                                Krok {currentStep + 1} z {totalSteps}
                            </span>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
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

                        {/* Text input */}
                        {currentQuestion.type === 'text' && (
                            <input
                                type="text"
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) =>
                                    setAnswers((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: e.target.value,
                                    }))
                                }
                                placeholder={currentQuestion.placeholder}
                                className="w-full px-5 py-4 rounded-xl border border-gray-200 text-[16px] text-[#0f172a] placeholder:text-gray-300 focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-cyan-100 transition-all duration-200"
                                autoFocus
                            />
                        )}

                        {/* Email input */}
                        {currentQuestion.type === 'email' && (
                            <input
                                type="email"
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) =>
                                    setAnswers((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: e.target.value,
                                    }))
                                }
                                placeholder={currentQuestion.placeholder}
                                className="w-full px-5 py-4 rounded-xl border border-gray-200 text-[16px] text-[#0f172a] placeholder:text-gray-300 focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-cyan-100 transition-all duration-200"
                                autoFocus
                            />
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8">
                            <button
                                onClick={handleBack}
                                className={`flex items-center gap-1.5 text-[14px] text-gray-400 hover:text-gray-600 transition-colors ${
                                    currentStep === 0 ? 'invisible' : ''
                                }`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Zpět
                            </button>

                            {/* Show Next/Submit only for text/email fields */}
                            {(currentQuestion.type === 'text' || currentQuestion.type === 'email') && (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed() || isSubmitting}
                                    className="bg-gradient-to-r from-[#0e7490] to-[#0891b2] text-white rounded-full px-6 py-5 text-[15px] font-semibold hover:shadow-lg hover:shadow-cyan-500/15 transition-all duration-300 disabled:opacity-40"
                                >
                                    {isSubmitting ? (
                                        'Odesílám...'
                                    ) : currentStep === totalSteps - 1 ? (
                                        <>
                                            Odeslat
                                            <Send className="ml-2 w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            Pokračovat
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Privacy note on last step */}
                        {currentStep === totalSteps - 1 && (
                            <p className="text-[12px] text-gray-400 text-center mt-4 italic">
                                Vaše data zpracováváme v souladu s GDPR. Žádný spam.
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
