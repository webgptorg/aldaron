'use client';

import {
    AiSupervizeMiniErrorAlert,
    AiSupervizeMiniSuccessState,
    AiSupervizeMiniTextareaField,
    AiSupervizeMiniTextField,
    isValidEmail,
    submitAiSupervizeMiniLead,
} from '@/businesses/ai-supervize-mini/aiSupervizeMiniFormShared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const interestReasonOptions = [
    {
        id: 'date',
        title: 'Termín mi nevyhovuje',
        description: 'Mám o workshop zájem, ale aktuální datum se mi nehodí.',
    },
    {
        id: 'price',
        title: 'Cena je teď moc vysoko',
        description: 'Workshop dává smysl, ale potřebuji jinou cenovou hladinu.',
    },
    {
        id: 'location',
        title: 'Praha je pro mě nepraktická',
        description: 'Uvítal/a bych jinou lokalitu nebo vzdálenější formát.',
    },
    {
        id: 'format',
        title: 'Potřebuji jiný formát',
        description: 'Víc by mi seděl jiný rozsah, firemní varianta nebo jiná struktura dne.',
    },
    {
        id: 'just-next-date',
        title: 'Chci vědět o dalším termínu',
        description: 'Stačí mi dát vědět, až vypíšeme další běh.',
    },
    {
        id: 'other',
        title: 'Jiný důvod',
        description: 'Mám jinou překážku nebo potřebu, kterou chci popsat.',
    },
] as const;

type InterestReasonId = (typeof interestReasonOptions)[number]['id'];

function toggleReason(currentReasons: InterestReasonId[], reasonId: InterestReasonId) {
    return currentReasons.includes(reasonId)
        ? currentReasons.filter((currentReasonId) => currentReasonId !== reasonId)
        : [...currentReasons, reasonId];
}

export function AiSupervizeMiniInterestForm() {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [companyOrRole, setCompanyOrRole] = useState('');
    const [selectedReasons, setSelectedReasons] = useState<InterestReasonId[]>([]);
    const [details, setDetails] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const fullnameError = fullname.trim() ? null : 'Vyplňte jméno a příjmení.';
    const emailError = email.trim() ? (isValidEmail(email) ? null : 'Zadejte platný e-mail.') : 'Vyplňte e-mail.';
    const reasonsError = selectedReasons.length > 0 ? null : 'Vyberte alespoň jeden důvod.';
    const detailsError = details.trim()
        ? null
        : 'Napište prosím, jaký termín, formát nebo rozpočet by vám dával větší smysl.';
    const canSubmit = !fullnameError && !emailError && !reasonsError && !detailsError;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            setShowValidation(true);
            setError('Vyplňte prosím jméno, platný e-mail, důvod zájmu a stručné upřesnění.');
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setError(null);

        const selectedReasonLabels = interestReasonOptions
            .filter((option) => selectedReasons.includes(option.id))
            .map((option) => option.title);

        const payload = {
            workshop: 'AI Supervize Mini',
            interestType: 'cannot-attend-current-workshop',
            fullname,
            email,
            companyOrRole: companyOrRole.trim() || null,
            selectedReasons,
            selectedReasonLabels,
            preferredAlternative: details,
            note: note.trim() || null,
        };

        try {
            await submitAiSupervizeMiniLead({
                fullname,
                email,
                placeName: 'AiSupervizeMiniWorkshopInterest',
                summaryTitle: 'AI Supervize Mini interest without current attendance',
                summaryLines: [
                    `Reasons: ${selectedReasonLabels.join(', ')}`,
                    `Company or role: ${payload.companyOrRole ?? '(not provided)'}`,
                    `Preferred alternative: ${payload.preferredAlternative}`,
                ],
                payload,
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
            <AiSupervizeMiniSuccessState
                title="Díky, ozveme se k dalším možnostem"
                description="Váš zájem jsme si uložili. Jakmile budeme skládat další termín nebo vhodnější variantu workshopu, dáme vám vědět."
            />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="border-b border-slate-100 pb-6">
                <p className="text-sm font-semibold uppercase text-cyan-700">Krátký dotazník</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">Co by vám dávalo větší smysl?</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Stačí pár odpovědí. Pomůže nám to poskládat další termín nebo jiný formát podle reálného zájmu.
                </p>
            </div>

            <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <AiSupervizeMiniTextField
                        id="interest-fullname"
                        label="Jméno a příjmení"
                        value={fullname}
                        onChange={setFullname}
                        placeholder="Jana Nováková"
                        error={fullnameError}
                        showValidation={showValidation}
                        autoComplete="name"
                    />
                    <AiSupervizeMiniTextField
                        id="interest-email"
                        label="E-mail"
                        value={email}
                        onChange={setEmail}
                        placeholder="jmeno@firma.cz"
                        error={emailError}
                        showValidation={showValidation}
                        autoComplete="email"
                        type="email"
                    />
                </div>

                <AiSupervizeMiniTextField
                    id="interest-company-or-role"
                    label="Firma / role"
                    value={companyOrRole}
                    onChange={setCompanyOrRole}
                    placeholder="Např. product manager ve SaaS týmu"
                    description="Volitelné, ale pomůže nám to lépe chápat kontext zájmu."
                />

                <div>
                    <div className="text-sm font-semibold text-slate-700">Co vám teď brání dorazit?</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {interestReasonOptions.map((reason) => {
                            const isSelected = selectedReasons.includes(reason.id);

                            return (
                                <button
                                    key={reason.id}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() =>
                                        setSelectedReasons((currentReasons) => toggleReason(currentReasons, reason.id))
                                    }
                                    className={cn(
                                        'rounded-xl border p-4 text-left transition-all',
                                        isSelected
                                            ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
                                            : 'border-slate-200 bg-white hover:border-cyan-200',
                                        showValidation && reasonsError && 'border-red-300 bg-red-50/70',
                                    )}
                                >
                                    <div className="font-semibold text-slate-950">{reason.title}</div>
                                    <div className="mt-1 text-sm leading-relaxed text-slate-600">
                                        {reason.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {showValidation && reasonsError ? (
                        <p className="mt-2 text-xs text-red-600">{reasonsError}</p>
                    ) : (
                        <p className="mt-2 text-xs text-slate-500">Můžete vybrat i víc možností najednou.</p>
                    )}
                </div>

                <AiSupervizeMiniTextareaField
                    id="interest-details"
                    label="Jaký termín, formát nebo rozpočet by vám dával větší smysl?"
                    value={details}
                    onChange={setDetails}
                    placeholder="Např. červen, Brno / remote, kratší workshop, cena do 5 000 Kč..."
                    error={detailsError}
                    showValidation={showValidation}
                />

                <AiSupervizeMiniTextareaField
                    id="interest-note"
                    label="Co byste si z workshopu chtěl/a hlavně odnést?"
                    value={note}
                    onChange={setNote}
                    placeholder="Např. lepší workflow s Copilotem, testování AI změn, práce s PRD..."
                    description="Volitelné. Čím konkrétnější budete, tím lépe umíme další běh připravit."
                />

                {error && <AiSupervizeMiniErrorAlert message={error} />}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Odesílám dotazník
                        </>
                    ) : (
                        'Dát vědět o zájmu'
                    )}
                </Button>
            </div>
        </form>
    );
}
