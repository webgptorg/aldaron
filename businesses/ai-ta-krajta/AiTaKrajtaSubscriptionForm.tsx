'use client';

import { AI_TA_KRAJTA_NAME, AI_TA_KRAJTA_SUBSCRIPTION_PLACE_NAME } from '@/businesses/ai-ta-krajta/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

/**
 * Tells the visitor what is wrong with the address they wrote, `null` when there is nothing wrong with it
 */
function getEmailError(email: string): string | null {
    if (!email.trim()) {
        return 'Vyplňte e-mail.';
    }

    return isEmailAddressValid(email) ? null : 'Zadejte prosím platný e-mail.';
}

/**
 * Leaves an e-mail address behind, so a listener hears about a new episode without watching the channel
 */
export function AiTaKrajtaSubscriptionForm() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isValidationShown, setIsValidationShown] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const emailError = getEmailError(email);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (emailError) {
            setIsValidationShown(true);
            setErrorMessage(emailError);
            return;
        }

        setIsValidationShown(false);
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await subscribeToWaitlist({
                email,
                placeName: AI_TA_KRAJTA_SUBSCRIPTION_PLACE_NAME,
                note: `Odběr novinek podcastu ${AI_TA_KRAJTA_NAME}`,
            });

            setIsSubscribed(true);
            setEmail('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubscribed) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950">Hotovo, jsi v obraze</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                    O novém dílu ti dáme vědět e-mailem. Nic jiného ti posílat nebudeme.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <label htmlFor="ai-ta-krajta-email" className="text-sm font-semibold text-slate-700">
                E-mail
            </label>
            <Input
                id="ai-ta-krajta-email"
                name="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jmeno@email.cz"
                autoComplete="email"
                aria-invalid={isValidationShown && !!emailError}
                className={cn(
                    'mt-2 h-11',
                    isValidationShown && emailError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                )}
            />
            {isValidationShown && emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}

            {errorMessage && !isValidationShown && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 h-12 w-full rounded-full bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Odesílám
                    </>
                ) : (
                    'Chci vědět o novém dílu'
                )}
            </Button>

            <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
                Odesláním souhlasíš se zpracováním osobních údajů podle{' '}
                <Link href="/privacy" className="text-cyan-700 underline-offset-4 hover:underline">
                    zásad ochrany osobních údajů
                </Link>
                . Odhlásit se můžeš kdykoliv.
            </p>
        </form>
    );
}
