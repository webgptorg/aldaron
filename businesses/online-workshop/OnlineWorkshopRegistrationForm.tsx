'use client';

import {
    ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME,
    ONLINE_WORKSHOP_THANK_YOU_PATH,
} from '@/businesses/online-workshop/config';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import {
    formatCzechWorkshopDate,
    formatCzechWorkshopDuration,
    formatCzechWorkshopTime,
} from '@/lib/workshops/workshopDate';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { createWorkshopRegistrationThankYouPath } from '@/lib/workshops/workshopRegistrationTiming';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cn } from '@/lib/utils';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, type FormEvent } from 'react';

function getFieldErrors({ fullname, email }: { fullname: string; email: string }) {
    return {
        fullnameError: fullname.trim() ? null : 'Vyplňte jméno a příjmení.',
        emailError: email.trim()
            ? isEmailAddressValid(email)
                ? null
                : 'Zadejte prosím platný e-mail.'
            : 'Vyplňte e-mail.',
    };
}

function createOnlineWorkshopRegistrationNote(workshop: WorkshopSummary): string {
    return [
        'Online workshop registration',
        `Workshop: ${workshop.title}`,
        `Workshop URL slug: ${workshop.slug}`,
        `Date: ${formatCzechWorkshopDate(workshop.startsAt)} ${formatCzechWorkshopTime(workshop.startsAt)}`,
    ].join('\n');
}

type OnlineWorkshopRegistrationFormProps = {
    readonly workshop: WorkshopSummary;
};

export function OnlineWorkshopRegistrationForm({ workshop }: OnlineWorkshopRegistrationFormProps) {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showValidation, setShowValidation] = useState(false);

    const { fullnameError, emailError } = getFieldErrors({ fullname, email });
    const canSubmit = !fullnameError && !emailError;
    const dateLabel = formatCzechWorkshopDate(workshop.startsAt);
    const timeLabel = formatCzechWorkshopTime(workshop.startsAt);
    const durationLabel = formatCzechWorkshopDuration(workshop.startsAt, workshop.endsAt);
    const fieldIdPrefix = `workshop-${workshop.slug}`;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            setShowValidation(true);
            setErrorMessage('Vyplňte prosím jméno a platný e-mail.');
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setErrorMessage(null);
        const registrationAtMilliseconds = Date.now();

        try {
            await subscribeToWaitlist({
                fullname,
                email,
                phone: phone.trim() || undefined,
                placeName: ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME,
                note: createOnlineWorkshopRegistrationNote(workshop),
            });

            // Note: A full page load, not a client side route change - only that runs the Meta Pixel again and reports
            //       a `PageView` of the thank you url, which is what the ad campaign optimizes on.
            //       `isSubmitting` intentionally stays `true`, so the form cannot be sent twice while the browser
            //       is still loading the thank you page.
            window.location.assign(
                createWorkshopRegistrationThankYouPath({
                    thankYouPath: ONLINE_WORKSHOP_THANK_YOU_PATH,
                    workshopSlug: workshop.slug,
                    startsAt: workshop.startsAt,
                    participantIdentity: { email, fullname },
                    registrationAtMilliseconds,
                }),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
            setIsSubmitting(false);
        }
    };

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
                    <p className="text-sm font-semibold text-slate-950">{workshop.title}</p>
                    <p className="text-xs text-slate-400">
                        {dateLabel} · {timeLabel} · {durationLabel} · online
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor={`${fieldIdPrefix}-fullname`} className="text-sm font-semibold text-slate-700">
                        Jméno
                    </label>
                    <Input
                        id={`${fieldIdPrefix}-fullname`}
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
                    <label htmlFor={`${fieldIdPrefix}-email`} className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id={`${fieldIdPrefix}-email`}
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
                    <label htmlFor={`${fieldIdPrefix}-phone`} className="text-sm font-semibold text-slate-700">
                        Telefon <span className="font-normal text-slate-400">(nepovinné, pro SMS připomínku)</span>
                    </label>
                    <Input
                        id={`${fieldIdPrefix}-phone`}
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

                {errorMessage && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

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

                <PersonalDataConsentNote language="cs" addressForm="informal" className="text-center">
                    Odkaz na připojení ti přijde e-mailem.
                </PersonalDataConsentNote>
            </div>
        </form>
    );
}
