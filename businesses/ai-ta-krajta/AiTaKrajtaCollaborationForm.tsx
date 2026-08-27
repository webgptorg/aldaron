'use client';

import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_COLLABORATION_PLACE_NAME,
    AI_TA_KRAJTA_NAME,
    type AiTaKrajtaCollaborationKind,
} from '@/businesses/ai-ta-krajta/config';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { CheckCircle2, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type CollaborationFormState = {
    readonly fullname: string;
    readonly email: string;
    readonly company: string;
    readonly collaborationKind: AiTaKrajtaCollaborationKind;
    readonly message: string;
};

const INITIAL_COLLABORATION_FORM_STATE: CollaborationFormState = {
    fullname: '',
    email: '',
    company: '',
    collaborationKind: 'topic',
    message: '',
};

/**
 * Validates the few fields the shared contacts inbox needs to answer a collaboration request.
 */
function getCollaborationValidationErrorMessage(formState: CollaborationFormState): string | null {
    if (!formState.fullname.trim()) {
        return 'Napište prosím své jméno.';
    }

    if (!isEmailAddressValid(formState.email)) {
        return 'Zadejte prosím platný e-mail.';
    }

    if (!formState.message.trim()) {
        return 'Napište prosím aspoň pár vět.';
    }

    return null;
}

/**
 * Sends a topic, guest, sponsorship or other collaboration request to the shared public contacts inbox.
 */
export function AiTaKrajtaCollaborationForm() {
    const [formState, setFormState] = useState<CollaborationFormState>(INITIAL_COLLABORATION_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrorMessage = getCollaborationValidationErrorMessage(formState);
        if (validationErrorMessage) {
            setErrorMessage(validationErrorMessage);
            return;
        }

        const collaborationOption = AI_TA_KRAJTA_COLLABORATION_OPTIONS.find(
            (option) => option.id === formState.collaborationKind,
        );
        const note = [
            `Podcast: ${AI_TA_KRAJTA_NAME}`,
            `Typ spolupráce: ${collaborationOption?.label ?? formState.collaborationKind}`,
            `Firma nebo projekt: ${formState.company.trim() || 'neuvedeno'}`,
            '',
            formState.message.trim(),
        ].join('\n');

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await subscribeToWaitlist({
                fullname: formState.fullname.trim(),
                email: formState.email.trim(),
                placeName: AI_TA_KRAJTA_COLLABORATION_PLACE_NAME,
                note,
            });
            setIsSubmitted(true);
            setFormState(INITIAL_COLLABORATION_FORM_STATE);
        } catch (submissionError) {
            setErrorMessage(
                submissionError instanceof Error ? submissionError.message : 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">Díky, zpráva je na cestě.</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Přečteme ji a ozveme se, pokud pro ni najdeme správný díl nebo formát.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="ai-ta-krajta-fullname" className="text-sm font-semibold text-slate-700">
                        Jméno
                    </label>
                    <Input
                        id="ai-ta-krajta-fullname"
                        value={formState.fullname}
                        onChange={(event) =>
                            setFormState((currentFormState) => ({ ...currentFormState, fullname: event.target.value }))
                        }
                        autoComplete="name"
                        className="mt-2 h-11"
                        placeholder="Vaše jméno"
                    />
                </div>
                <div>
                    <label htmlFor="ai-ta-krajta-email" className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id="ai-ta-krajta-email"
                        type="email"
                        value={formState.email}
                        onChange={(event) =>
                            setFormState((currentFormState) => ({ ...currentFormState, email: event.target.value }))
                        }
                        autoComplete="email"
                        className="mt-2 h-11"
                        placeholder="jmeno@firma.cz"
                    />
                </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="ai-ta-krajta-company" className="text-sm font-semibold text-slate-700">
                        Firma nebo projekt
                    </label>
                    <Input
                        id="ai-ta-krajta-company"
                        value={formState.company}
                        onChange={(event) =>
                            setFormState((currentFormState) => ({ ...currentFormState, company: event.target.value }))
                        }
                        autoComplete="organization"
                        className="mt-2 h-11"
                        placeholder="Nepovinné"
                    />
                </div>
                <div>
                    <label htmlFor="ai-ta-krajta-collaboration-kind" className="text-sm font-semibold text-slate-700">
                        Co řešíte
                    </label>
                    <select
                        id="ai-ta-krajta-collaboration-kind"
                        value={formState.collaborationKind}
                        onChange={(event) =>
                            setFormState((currentFormState) => ({
                                ...currentFormState,
                                collaborationKind: event.target.value as AiTaKrajtaCollaborationKind,
                            }))
                        }
                        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        {AI_TA_KRAJTA_COLLABORATION_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-5">
                <label htmlFor="ai-ta-krajta-message" className="text-sm font-semibold text-slate-700">
                    Zpráva
                </label>
                <Textarea
                    id="ai-ta-krajta-message"
                    value={formState.message}
                    onChange={(event) =>
                        setFormState((currentFormState) => ({ ...currentFormState, message: event.target.value }))
                    }
                    className="mt-2 min-h-36"
                    placeholder="Co by nemělo zapadnout, proč byste byli dobrý host nebo co chcete s Krajtou vymyslet?"
                />
            </div>

            {errorMessage && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 h-12 w-full rounded-full bg-[#303832] text-base text-white hover:bg-[#171d1a]"
            >
                {isSubmitting ? 'Odesíláme' : 'Poslat zprávu'}
                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
            </Button>

            <PersonalDataConsentNote language="cs" className="mt-4 text-center text-slate-500" linkClassName="text-slate-700" />
        </form>
    );
}
