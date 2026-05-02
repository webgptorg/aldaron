'use client';

import { aiSupervizeMiniWorkshopConfig } from '@/businesses/ai-supervize-mini/config';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import { BadgePercent, CheckCircle2, Loader2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type InvoiceType = 'company' | 'individual';
type InterestReason = 'date-does-not-work' | 'price-too-high' | 'different-format' | 'other';
type ContactFieldsState = {
    fullname: string;
    email: string;
    company: string;
    note: string;
};

const interestReasonOptions: ReadonlyArray<{ value: InterestReason; label: string }> = [
    { value: 'date-does-not-work', label: 'Datum mi nevyhovuje' },
    { value: 'price-too-high', label: 'Cena je pro mě příliš vysoká' },
    { value: 'different-format', label: 'Mám zájem o jiný formát (např. online)' },
    { value: 'other', label: 'Jiné (uveďte v poznámce)' },
];

function toggleInterestReason(
    current: ReadonlyArray<InterestReason>,
    reason: InterestReason,
    checked: boolean,
): InterestReason[] {
    if (checked) {
        return current.includes(reason) ? [...current] : [...current, reason];
    }

    return current.filter((value) => value !== reason);
}

function getContactFieldErrors({
    fullname,
    email,
    company,
}: Pick<ContactFieldsState, 'fullname' | 'email' | 'company'>) {
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return {
        fullnameError: fullname.trim() ? null : 'Vyplňte jméno a příjmení.',
        emailError: email.trim() ? (emailIsValid ? null : 'Zadejte platný e-mail.') : 'Vyplňte e-mail.',
    };
}

function buildContactNote(title: string, lines: ReadonlyArray<string>, payload: unknown) {
    return [title, ...lines, '', JSON.stringify(payload, null, 4)].join('\n');
}

type ContactFieldsProps = {
    idPrefix: string;
    state: ContactFieldsState;
    onChange: <TField extends keyof ContactFieldsState>(field: TField, value: ContactFieldsState[TField]) => void;
    showValidation: boolean;
    fullnameError: string | null;
    emailError: string | null;
    companyError: string | null;
    noteLabel?: string;
    notePlaceholder: string;
};

function ContactFields({
    idPrefix,
    state,
    onChange,
    showValidation,
    fullnameError,
    emailError,
    companyError,
    noteLabel = 'Poznámka',
    notePlaceholder,
}: ContactFieldsProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${idPrefix}-fullname`} className="text-sm font-semibold text-slate-700">
                        Jméno a příjmení
                    </label>
                    <Input
                        id={`${idPrefix}-fullname`}
                        name={`${idPrefix}-fullname`}
                        value={state.fullname}
                        onChange={(event) => onChange('fullname', event.target.value)}
                        placeholder="Jana Nováková"
                        aria-invalid={showValidation && !!fullnameError}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && fullnameError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                        autoComplete="name"
                    />
                    {showValidation && fullnameError && <p className="mt-1 text-xs text-red-600">{fullnameError}</p>}
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-email`} className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id={`${idPrefix}-email`}
                        name={`${idPrefix}-email`}
                        type="email"
                        value={state.email}
                        onChange={(event) => onChange('email', event.target.value)}
                        placeholder="jmeno@firma.cz"
                        aria-invalid={showValidation && !!emailError}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && emailError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                        autoComplete="email"
                    />
                    {showValidation && emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                </div>
            </div>

            <div>
                <label htmlFor={`${idPrefix}-company`} className="text-sm font-semibold text-slate-700">
                    Firma / organizace
                </label>
                <Input
                    id={`${idPrefix}-company`}
                    name={`${idPrefix}-company`}
                    value={state.company}
                    onChange={(event) => onChange('company', event.target.value)}
                    placeholder="Firma s.r.o. / fyzická osoba"
                    aria-invalid={showValidation && !!companyError}
                    className={cn(
                        'mt-2 h-11',
                        showValidation && companyError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                    )}
                    autoComplete="organization"
                />
                {showValidation && companyError && <p className="mt-1 text-xs text-red-600">{companyError}</p>}
            </div>

            <div>
                <label htmlFor={`${idPrefix}-note`} className="text-sm font-semibold text-slate-700">
                    {noteLabel}
                </label>
                <Textarea
                    id={`${idPrefix}-note`}
                    name={`${idPrefix}-note`}
                    value={state.note}
                    onChange={(event) => onChange('note', event.target.value)}
                    placeholder={notePlaceholder}
                    className="mt-2 min-h-[96px]"
                />
            </div>
        </>
    );
}

function formatCzk(amount: number) {
    return `${amount.toLocaleString('cs-CZ')} Kč`;
}

function clampParticipants(value: number, max: number) {
    if (!Number.isFinite(value)) return 1;
    return Math.min(Math.max(Math.round(value), 1), max);
}

function normalizeDiscountCode(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
}

const normalizedWorkshopDiscountCode = normalizeDiscountCode(aiSupervizeMiniWorkshopConfig.discount.code);
const normalizedWorkshopDiscountSuffix = normalizeDiscountCode(
    aiSupervizeMiniWorkshopConfig.discount.codeFormat.suffix,
);

function isValidDiscountCode(value: string) {
    const normalizedValue = normalizeDiscountCode(value);

    if (!normalizedValue) {
        return false;
    }

    if (normalizedValue === normalizedWorkshopDiscountCode) {
        return true;
    }

    const parts = normalizedValue.split('_').filter(Boolean);
    const minimumParts = aiSupervizeMiniWorkshopConfig.discount.codeFormat.minimumMiddleParts + 2;
    const lastPart = parts[parts.length - 1];

    return (
        parts.length >= minimumParts &&
        parts[0] === normalizedWorkshopDiscountCode &&
        lastPart === normalizedWorkshopDiscountSuffix
    );
}

export function AiSupervizeMiniRegistrationForm() {
    const [selectedDateId, setSelectedDateId] = useState<string>(aiSupervizeMiniWorkshopConfig.dates[0]!.id);
    const selectedDate =
        aiSupervizeMiniWorkshopConfig.dates.find((date) => date.id === selectedDateId) ??
        aiSupervizeMiniWorkshopConfig.dates[0]!;
    const availableSeats = Math.min(
        aiSupervizeMiniWorkshopConfig.maxParticipantsPerWorkshop,
        selectedDate.remainingSeats,
    );
    const [participantCount, setParticipantCount] = useState(1);
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('company');
    const [billingDetails, setBillingDetails] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [isInterestDialogOpen, setIsInterestDialogOpen] = useState(false);
    const [interestForm, setInterestForm] = useState<ContactFieldsState>({
        fullname: '',
        email: '',
        company: '',
        note: '',
    });
    const [interestReasons, setInterestReasons] = useState<InterestReason[]>([]);
    const [isInterestSubmitting, setIsInterestSubmitting] = useState(false);
    const [interestError, setInterestError] = useState<string | null>(null);
    const [interestSuccess, setInterestSuccess] = useState(false);
    const [showInterestValidation, setShowInterestValidation] = useState(false);

    useEffect(() => {
        setParticipantCount((count) => clampParticipants(count, availableSeats));
    }, [availableSeats]);

    const normalizedDiscountCode = normalizeDiscountCode(discountCode);
    const discountApplied = isValidDiscountCode(discountCode);
    const price = useMemo(() => {
        const basePrice = aiSupervizeMiniWorkshopConfig.pricePerParticipantCzk * participantCount;
        const discountAmount = discountApplied
            ? Math.round((basePrice * aiSupervizeMiniWorkshopConfig.discount.percent) / 100)
            : 0;
        return {
            basePrice,
            discountAmount,
            finalPrice: basePrice - discountAmount,
        };
    }, [discountApplied, participantCount]);

    const participantError =
        participantCount < 1 || participantCount > availableSeats
            ? availableSeats > 0
                ? `Počet účastníků musí být mezi 1 a ${availableSeats}.`
                : 'Tento termín je momentálně bez volných míst.'
            : null;
    const { fullnameError, emailError, companyError } = getContactFieldErrors({ fullname, email, company });
    const billingDetailsError = billingDetails.trim() ? null : 'Vyplňte fakturační údaje.';
    const canSubmit = !participantError && !fullnameError && !emailError && !companyError && !billingDetailsError;
    const interestFieldErrors = getContactFieldErrors(interestForm);
    const interestReasonsError =
        interestReasons.length > 0 ? null : 'Vyberte alespoň jeden důvod, proč se nemůžete zúčastnit.';
    const canSubmitInterest =
        !interestFieldErrors.fullnameError &&
        !interestFieldErrors.emailError &&
        !interestFieldErrors.companyError &&
        !interestReasonsError;

    const updateInterestField = <TField extends keyof ContactFieldsState>(
        field: TField,
        value: ContactFieldsState[TField],
    ) => {
        setInterestForm((current) => ({ ...current, [field]: value }));
    };

    const resetInterestForm = () => {
        setInterestForm({
            fullname: '',
            email: '',
            company: '',
            note: '',
        });
        setInterestReasons([]);
        setInterestError(null);
        setInterestSuccess(false);
        setShowInterestValidation(false);
        setIsInterestSubmitting(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            setShowValidation(true);
            setError('Vyplňte prosím jméno, platný e-mail, firmu/fakturační jméno a fakturační údaje.');
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setError(null);

        const payload = {
            workshop: 'AI Supervize Mini',
            selectedDate: selectedDate.label,
            selectedDateId: selectedDate.id,
            place: aiSupervizeMiniWorkshopConfig.place,
            timeRange: aiSupervizeMiniWorkshopConfig.timeRange,
            remainingSeatsAtSubmit: selectedDate.remainingSeats,
            participantCount,
            fullname,
            email,
            company,
            invoiceType,
            billingDetails,
            userNote: note,
            discountCodeEntered: discountCode.trim() || null,
            discountCodeUsed: discountApplied ? normalizedDiscountCode : null,
            discountPercentApplied: discountApplied ? aiSupervizeMiniWorkshopConfig.discount.percent : 0,
            unitPriceCzk: aiSupervizeMiniWorkshopConfig.pricePerParticipantCzk,
            basePriceCzk: price.basePrice,
            discountAmountCzk: price.discountAmount,
            computedFinalPriceCzk: price.finalPrice,
        };

        const contactNote = buildContactNote(
            'AI Supervize Mini registration',
            [
                `Workshop date: ${payload.selectedDate}`,
                `Participants: ${payload.participantCount}`,
                `Unit price CZK: ${payload.unitPriceCzk}`,
                `Base price CZK: ${payload.basePriceCzk}`,
                `Discount code entered: ${payload.discountCodeEntered ?? '(none)'}`,
                `Discount code used: ${payload.discountCodeUsed ?? '(none)'}`,
                `Discount percent applied: ${payload.discountPercentApplied}`,
                `Discount amount CZK: ${payload.discountAmountCzk}`,
                `Computed final price CZK: ${payload.computedFinalPriceCzk}`,
            ],
            payload,
        );

        try {
            await subscribeToWaitlist({
                fullname,
                email,
                placeName: 'AiSupervizeMiniWorkshopRegistration',
                note: contactNote,
            });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInterestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmitInterest) {
            setShowInterestValidation(true);
            setInterestError('Vyplňte prosím jméno, platný e-mail, firmu a alespoň jeden důvod.');
            return;
        }

        setShowInterestValidation(false);
        setIsInterestSubmitting(true);
        setInterestError(null);

        const selectedReasons = interestReasonOptions
            .filter((reason) => interestReasons.includes(reason.value))
            .map((reason) => reason.label);

        const payload = {
            workshop: 'AI Supervize Mini',
            leadType: 'Interested, but cannot attend current workshop',
            reasons: selectedReasons,
            fullname: interestForm.fullname,
            email: interestForm.email,
            company: interestForm.company,
            userNote: interestForm.note || null,
        };

        const contactNote = buildContactNote(
            'AI Supervize Mini interest without current attendance',
            [
                `Reason count: ${selectedReasons.length}`,
                `Reasons: ${selectedReasons.join(', ')}`,
                `Original registration CTA opened from current workshop section: yes`,
            ],
            payload,
        );

        try {
            await subscribeToWaitlist({
                fullname: interestForm.fullname,
                email: interestForm.email,
                placeName: 'AiSupervizeMiniWorkshopRegistration',
                note: contactNote,
            });
            setInterestSuccess(true);
        } catch (err) {
            setInterestError(err instanceof Error ? err.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
        } finally {
            setIsInterestSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">Přihláška je odeslaná</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Ozveme se vám s potvrzením termínu, fakturací a praktickými informacemi k workshopu.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase text-cyan-700">Registrace</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Vyberte termín a místo</h2>
                </div>
                <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                    <div className="text-xs text-slate-300">Cena po přepočtu</div>
                    <div className="text-2xl font-bold">{formatCzk(price.finalPrice)}</div>
                    {discountApplied && (
                        <div className="text-xs text-cyan-300">
                            Sleva {aiSupervizeMiniWorkshopConfig.discount.code} započtena
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <div>
                    <label className="text-sm font-semibold text-slate-700">Termín workshopu</label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {aiSupervizeMiniWorkshopConfig.dates.map((date) => {
                            const selected = selectedDateId === date.id;
                            return (
                                <button
                                    type="button"
                                    key={date.id}
                                    aria-pressed={selected}
                                    onClick={() => setSelectedDateId(date.id)}
                                    className={`rounded-xl border p-4 text-left transition-all ${
                                        selected
                                            ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
                                            : 'border-slate-200 bg-white hover:border-cyan-200'
                                    }`}
                                >
                                    <div className="text-lg font-bold text-slate-950">{date.label}</div>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="h-4 w-4 text-cyan-600" />
                                        Zbývá {date.remainingSeats} míst z{' '}
                                        {aiSupervizeMiniWorkshopConfig.maxParticipantsPerWorkshop}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="participants" className="text-sm font-semibold text-slate-700">
                            Počet účastníků
                        </label>
                        <Input
                            id="participants"
                            name="participants"
                            type="number"
                            min={1}
                            max={availableSeats}
                            value={participantCount}
                            onChange={(event) =>
                                setParticipantCount(clampParticipants(Number(event.target.value), availableSeats))
                            }
                            aria-invalid={showValidation && !!participantError}
                            className={cn(
                                'mt-2 h-11',
                                showValidation &&
                                    participantError &&
                                    'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                            )}
                        />
                        <p
                            className={cn(
                                'mt-1 text-xs text-slate-500',
                                showValidation && participantError && 'text-red-600',
                            )}
                        >
                            {showValidation && participantError
                                ? participantError
                                : `Maximum pro tento termín: ${availableSeats}`}
                        </p>
                    </div>
                    <div>
                        <label htmlFor="discount" className="text-sm font-semibold text-slate-700">
                            Slevový kód
                        </label>
                        <div className="relative mt-2">
                            <BadgePercent className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                                id="discount"
                                name="discount"
                                value={discountCode}
                                onChange={(event) => setDiscountCode(event.target.value)}
                                placeholder={aiSupervizeMiniWorkshopConfig.discount.code}
                                className="h-11 pl-10 uppercase"
                                autoCapitalize="characters"
                                autoCorrect="off"
                                spellCheck={false}
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            {discountCode.trim()
                                ? discountApplied
                                    ? `Aktivní sleva ${aiSupervizeMiniWorkshopConfig.discount.percent} %.`
                                    : `Tento kód není aktivní. Zkuste ${aiSupervizeMiniWorkshopConfig.discount.code}.`
                                : `Volitelné. Zadejte ${aiSupervizeMiniWorkshopConfig.discount.code} nebo celý partnerský kód.`}
                        </p>
                    </div>
                </div>

                <ContactFields
                    idPrefix="registration"
                    state={{ fullname, email, company, note }}
                    onChange={(field, value) => {
                        if (field === 'fullname') setFullname(value);
                        if (field === 'email') setEmail(value);
                        if (field === 'company') setCompany(value);
                        if (field === 'note') setNote(value);
                    }}
                    showValidation={showValidation}
                    fullnameError={fullnameError}
                    emailError={emailError}
                    companyError={companyError}
                    notePlaceholder="Co řešíte, kolik lidí posíláte, specifické dotazy..."
                />

                <div>
                    <label className="text-sm font-semibold text-slate-700">Fakturace</label>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {[
                            { id: 'company' as const, label: 'Firma' },
                            { id: 'individual' as const, label: 'Jednotlivec' },
                        ].map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={invoiceType === option.id}
                                onClick={() => setInvoiceType(option.id)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                                    invoiceType === option.id
                                        ? 'border-cyan-500 bg-cyan-50 text-slate-950 ring-2 ring-cyan-100'
                                        : 'border-slate-200 text-slate-600 hover:border-cyan-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="billingDetails" className="text-sm font-semibold text-slate-700">
                        Fakturační údaje
                    </label>
                    <Textarea
                        id="billingDetails"
                        name="billingDetails"
                        value={billingDetails}
                        onChange={(event) => setBillingDetails(event.target.value)}
                        placeholder="Název, IČO/DIČ nebo adresa pro fakturaci"
                        aria-invalid={showValidation && !!billingDetailsError}
                        className={cn(
                            'mt-2 min-h-[96px]',
                            showValidation &&
                                billingDetailsError &&
                                'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {showValidation && billingDetailsError && (
                        <p className="mt-1 text-xs text-red-600">{billingDetailsError}</p>
                    )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                        <span>Základní cena</span>
                        <strong className="text-slate-900">{formatCzk(price.basePrice)}</strong>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                        <span>Sleva</span>
                        <strong className={discountApplied ? 'text-emerald-700' : 'text-slate-900'}>
                            {discountApplied ? `-${formatCzk(price.discountAmount)}` : '0 Kč'}
                        </strong>
                    </div>
                    <div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
                        <span className="font-semibold text-slate-900">Celkem</span>
                        <strong className="text-slate-950">{formatCzk(price.finalPrice)}</strong>
                    </div>
                </div>

                {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Odesílám registraci
                        </>
                    ) : (
                        'Rezervovat workshop'
                    )}
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsInterestDialogOpen(true)}
                        className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-700"
                    >
                        Nemůžu se zúčastnit, ale mám zájem o další termíny nebo jiný formát
                    </button>
                </div>
            </div>

            <Dialog
                open={isInterestDialogOpen}
                onOpenChange={(open) => {
                    if (isInterestSubmitting) {
                        return;
                    }

                    setIsInterestDialogOpen(open);
                    if (!open) {
                        resetInterestForm();
                    }
                }}
            >
                <DialogContent className="max-w-2xl rounded-2xl border-slate-200 p-0">
                    {interestSuccess ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-slate-950">Děkujeme za zájem</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Vaše odpověď máme uloženou a ozveme se, jakmile budeme mít další vhodný termín nebo
                                formát.
                            </p>
                            <Button
                                type="button"
                                onClick={() => {
                                    setIsInterestDialogOpen(false);
                                    resetInterestForm();
                                }}
                                className="mt-6 bg-promptbook-blue-dark hover:bg-promptbook-blue-dark/90"
                            >
                                Zavřít
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleInterestSubmit} className="space-y-6 p-6 sm:p-8">
                            <DialogHeader className="space-y-3 text-left">
                                <DialogTitle className="text-2xl font-bold text-slate-950">
                                    Nemůžete tento termín?
                                </DialogTitle>
                                <DialogDescription className="text-sm leading-relaxed text-slate-600">
                                    Dejte nám vědět, co vám teď nevyhovuje. Pomůže nám to připravit další termíny nebo
                                    jiný formát workshopu.
                                </DialogDescription>
                            </DialogHeader>

                            <div>
                                <p className="text-sm font-semibold text-slate-700">Co vám teď nevyhovuje</p>
                                <div className="mt-3 grid gap-3">
                                    {interestReasonOptions.map((reason) => (
                                        <label
                                            key={reason.value}
                                            className={cn(
                                                'flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 transition-colors',
                                                showInterestValidation &&
                                                    interestReasonsError &&
                                                    'border-red-300 bg-red-50/40',
                                            )}
                                        >
                                            <Checkbox
                                                checked={interestReasons.includes(reason.value)}
                                                onCheckedChange={(checked) => {
                                                    setInterestReasons((current) =>
                                                        toggleInterestReason(current, reason.value, checked === true),
                                                    );
                                                }}
                                                className="mt-0.5"
                                            />
                                            <span>{reason.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {showInterestValidation && interestReasonsError && (
                                    <p className="mt-2 text-xs text-red-600">{interestReasonsError}</p>
                                )}
                            </div>

                            <ContactFields
                                idPrefix="interest"
                                state={interestForm}
                                onChange={updateInterestField}
                                showValidation={showInterestValidation}
                                fullnameError={interestFieldErrors.fullnameError}
                                emailError={interestFieldErrors.emailError}
                                companyError={interestFieldErrors.companyError}
                                notePlaceholder="Napište, jaký termín nebo formát by pro vás dával větší smysl."
                            />

                            {interestError && (
                                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{interestError}</p>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsInterestDialogOpen(false);
                                        resetInterestForm();
                                    }}
                                    disabled={isInterestSubmitting}
                                >
                                    Zrušit
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isInterestSubmitting}
                                    className="bg-promptbook-blue-dark hover:bg-promptbook-blue-dark/90"
                                >
                                    {isInterestSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Odesílám odpověď
                                        </>
                                    ) : (
                                        'Odeslat odpověď'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </form>
    );
}
