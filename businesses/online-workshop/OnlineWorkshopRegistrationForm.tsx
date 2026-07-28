'use client';

import { onlineWorkshopConfig } from '@/businesses/online-workshop/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

function getFieldErrors({ fullname, email }: { fullname: string; email: string }) {
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return {
        fullnameError: fullname.trim() ? null : 'Vyplňte jméno a příjmení.',
        emailError: email.trim() ? (emailIsValid ? null : 'Zadejte prosím platný e-mail.') : 'Vyplňte e-mail.',
    };
}

export function OnlineWorkshopRegistrationForm() {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const { fullnameError, emailError } = getFieldErrors({ fullname, email });
    const canSubmit = !fullnameError && !emailError;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            setShowValidation(true);
            setError('Vyplňte prosím jméno a platný e-mail.');
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setError(null);

        try {
            await subscribeToWaitlist({
                fullname,
                email,
                phone: phone.trim() || undefined,
                placeName: onlineWorkshopConfig.registrationPlaceName,
                note: `Online workshop registration\nDate: ${onlineWorkshopConfig.date.weekdayLabel} ${onlineWorkshopConfig.date.dateLabel} ${onlineWorkshopConfig.date.time}`,
            });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                    Máš místo. Uvidíme se {onlineWorkshopConfig.date.dateLabel} v {onlineWorkshopConfig.date.time}.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Odkaz na připojení ti přijde na e-mail. Zkontroluj i spam a promotions.
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        >
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-6">
                <span className="flex shrink-0">
                    <Image
                        src={pavolHejny}
                        alt="Pavol Hejný"
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <Image
                        src={jiriJahn}
                        alt="Jiří Jahn"
                        width={44}
                        height={44}
                        className="-ml-3 h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                </span>
                <div>
                    <p className="text-sm font-semibold text-slate-950">Vedou Pavol Hejný a Jiří Jahn</p>
                    <p className="text-xs text-slate-400">
                        {onlineWorkshopConfig.date.weekdayLabel} {onlineWorkshopConfig.date.dateLabel} ·{' '}
                        {onlineWorkshopConfig.date.time} · online
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="workshop-fullname" className="text-sm font-semibold text-slate-700">
                        Jméno
                    </label>
                    <Input
                        id="workshop-fullname"
                        name="fullname"
                        value={fullname}
                        onChange={(event) => setFullname(event.target.value)}
                        placeholder="Jana Nováková"
                        autoComplete="name"
                        aria-invalid={showValidation && !!fullnameError}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && fullnameError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {showValidation && fullnameError && <p className="mt-1 text-xs text-red-600">{fullnameError}</p>}
                </div>

                <div>
                    <label htmlFor="workshop-email" className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id="workshop-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="jmeno@firma.cz"
                        autoComplete="email"
                        aria-invalid={showValidation && !!emailError}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && emailError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {showValidation && emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                </div>

                <div>
                    <label htmlFor="workshop-phone" className="text-sm font-semibold text-slate-700">
                        Telefon <span className="font-normal text-slate-400">(nepovinné, pro SMS připomínku)</span>
                    </label>
                    <Input
                        id="workshop-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+420 000 000 000"
                        autoComplete="tel"
                        className="mt-2 h-11"
                    />
                </div>

                {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-full bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Odesílám registraci
                        </>
                    ) : (
                        'Rezervovat místo zdarma'
                    )}
                </Button>

                <p className="text-center text-xs leading-relaxed text-slate-400">
                    Odesláním souhlasíš se zpracováním osobních údajů podle{' '}
                    <Link href="/privacy" className="text-cyan-700 underline-offset-4 hover:underline">
                        zásad ochrany osobních údajů
                    </Link>
                    . Odkaz na připojení ti přijde e-mailem.
                </p>
            </div>
        </form>
    );
}
