'use client';

import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_COLLABORATION_PLACE_NAME,
    AI_TA_KRAJTA_COLLABORATION_QUERY_PARAMETER_NAME,
    AI_TA_KRAJTA_NAME,
    readAiTaKrajtaCollaborationKind,
    type AiTaKrajtaCollaborationKind,
} from '@/businesses/ai-ta-krajta/config';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { CheckCircle2, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

/**
 * Identifier of the message field, kept stable for deep links and end-to-end coverage
 */
export const AI_TA_KRAJTA_MESSAGE_FIELD_ID = 'ai-ta-krajta-zprava';

type CollaborationFormValues = {
    readonly fullname: string;
    readonly email: string;
    readonly company: string;
    readonly message: string;
};

const EMPTY_FORM_VALUES: CollaborationFormValues = {
    fullname: '',
    email: '',
    company: '',
    message: '',
};

const FIELD_CLASS_NAME =
    'mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/45';

const LABEL_CLASS_NAME = 'text-sm font-medium text-white/70';

/**
 * Checks what the shared contacts inbox needs to be able to answer
 *
 * @returns what to tell the visitor, null when the form can be sent
 */
function getValidationMessage(formValues: CollaborationFormValues): string | null {
    if (formValues.fullname.trim() === '') {
        return 'Napište své jméno.';
    }

    if (!isEmailAddressValid(formValues.email)) {
        return 'Ten e-mail nevypadá platně, mrkněte na něj.';
    }

    if (formValues.message.trim() === '') {
        return 'Napište pár vět, ať víme, o co jde.';
    }

    return null;
}

/**
 * Writes down the selected path so the shared contacts inbox tells apart a guest, topic and business inquiry
 */
function createContactNote(
    collaborationKind: AiTaKrajtaCollaborationKind,
    formValues: CollaborationFormValues,
): string {
    const chosenOption = AI_TA_KRAJTA_COLLABORATION_OPTIONS.find((option) => option.id === collaborationKind);

    return [
        'Podcast: ' + AI_TA_KRAJTA_NAME,
        'Zájem: ' + (chosenOption?.label ?? collaborationKind),
        'Firma nebo projekt: ' + (formValues.company.trim() || 'neuvedeno'),
        '',
        formValues.message.trim(),
    ].join('\n');
}

/**
 * The one collaboration form shared by the media kit and the shared contacts inbox
 *
 * Note: The media-kit deep links choose its kind through an English query parameter. The current URL and referrer,
 * including UTM parameters, are already preserved by subscribeToWaitlist.
 */
export function AiTaKrajtaCollaborationForm() {
    const searchParams = useSearchParams();
    const collaborationKindFromSearchParameters = readAiTaKrajtaCollaborationKind(
        searchParams.get(AI_TA_KRAJTA_COLLABORATION_QUERY_PARAMETER_NAME),
    );
    const [collaborationKind, setCollaborationKind] = useState<AiTaKrajtaCollaborationKind>(
        collaborationKindFromSearchParameters,
    );
    const [formValues, setFormValues] = useState<CollaborationFormValues>(EMPTY_FORM_VALUES);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setCollaborationKind(collaborationKindFromSearchParameters);
    }, [collaborationKindFromSearchParameters]);

    const changeFormValue = (change: Partial<CollaborationFormValues>) =>
        setFormValues((previousFormValues) => ({ ...previousFormValues, ...change }));

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationMessage = getValidationMessage(formValues);

        if (validationMessage !== null) {
            setErrorMessage(validationMessage);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await subscribeToWaitlist({
                fullname: formValues.fullname.trim(),
                email: formValues.email.trim(),
                placeName: AI_TA_KRAJTA_COLLABORATION_PLACE_NAME,
                note: createContactNote(collaborationKind, formValues),
            });
            setIsSubmitted(true);
            setFormValues(EMPTY_FORM_VALUES);
        } catch (submissionError) {
            setErrorMessage(
                submissionError instanceof Error
                    ? submissionError.message
                    : 'Zprávu se nepodařilo odeslat. Zkuste to prosím ještě jednou.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="rounded-2xl border border-[#6b8cff]/40 bg-[#6b8cff]/[0.08] p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-[#9db1ff]" />
                <h3 className="mt-4 text-xl font-semibold text-white">Máme to.</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">Díky. Ozveme se s dalším krokem.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="ai-ta-krajta-jmeno" className={LABEL_CLASS_NAME}>
                        Jméno
                    </label>
                    <input
                        id="ai-ta-krajta-jmeno"
                        value={formValues.fullname}
                        onChange={(event) => changeFormValue({ fullname: event.target.value })}
                        autoComplete="name"
                        className={FIELD_CLASS_NAME}
                        placeholder="Jan Novák"
                    />
                </div>

                <div>
                    <label htmlFor="ai-ta-krajta-email" className={LABEL_CLASS_NAME}>
                        E-mail
                    </label>
                    <input
                        id="ai-ta-krajta-email"
                        type="email"
                        value={formValues.email}
                        onChange={(event) => changeFormValue({ email: event.target.value })}
                        autoComplete="email"
                        className={FIELD_CLASS_NAME}
                        placeholder="jan@firma.cz"
                    />
                </div>

                <div>
                    <label htmlFor="ai-ta-krajta-firma" className={LABEL_CLASS_NAME}>
                        Firma nebo projekt
                    </label>
                    <input
                        id="ai-ta-krajta-firma"
                        value={formValues.company}
                        onChange={(event) => changeFormValue({ company: event.target.value })}
                        autoComplete="organization"
                        className={FIELD_CLASS_NAME}
                        placeholder="Nepovinné"
                    />
                </div>

                <div>
                    <label htmlFor="ai-ta-krajta-zajem" className={LABEL_CLASS_NAME}>
                        O co jde
                    </label>
                    <select
                        id="ai-ta-krajta-zajem"
                        value={collaborationKind}
                        onChange={(event) => setCollaborationKind(readAiTaKrajtaCollaborationKind(event.target.value))}
                        className={FIELD_CLASS_NAME + ' appearance-none bg-[#232a25]'}
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
                <label htmlFor={AI_TA_KRAJTA_MESSAGE_FIELD_ID} className={LABEL_CLASS_NAME}>
                    Zpráva
                </label>
                <textarea
                    id={AI_TA_KRAJTA_MESSAGE_FIELD_ID}
                    value={formValues.message}
                    onChange={(event) => changeFormValue({ message: event.target.value })}
                    rows={5}
                    className={FIELD_CLASS_NAME + ' h-auto py-3 leading-relaxed'}
                    placeholder="Na čem děláte, co by nemělo zapadnout, nebo co chcete s Krajtou vymyslet."
                />
            </div>

            {errorMessage !== null && (
                <p className="mt-4 rounded-xl bg-[#ff6b6b]/15 px-4 py-3 text-sm text-[#ffb1a6]">{errorMessage}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff6b6b] text-base font-semibold text-[#1a201c] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Odesíláme' : 'Poslat zprávu'}
                {!isSubmitting && <Send className="h-4 w-4" />}
            </button>

            <PersonalDataConsentNote
                language="cs"
                className="mt-4 text-center text-white/35"
                linkClassName="text-white/60"
            />
        </form>
    );
}
