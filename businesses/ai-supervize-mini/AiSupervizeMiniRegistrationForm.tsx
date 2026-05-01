'use client';

import { aiSupervizeMiniWorkshopConfig } from '@/businesses/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { BadgePercent, CheckCircle2, Loader2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type InvoiceType = 'company' | 'individual';

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

function isValidDiscountCode(value: string) {
    const normalizedValue = normalizeDiscountCode(value);
    const parts = normalizedValue.split('_').filter(Boolean);
    const normalizedCode = normalizeDiscountCode(aiSupervizeMiniWorkshopConfig.discount.code);
    const normalizedSuffix = normalizeDiscountCode(aiSupervizeMiniWorkshopConfig.discount.codeFormat.suffix);
    const minimumParts = aiSupervizeMiniWorkshopConfig.discount.codeFormat.minimumMiddleParts + 2;
    const lastPart = parts[parts.length - 1];

    return parts.length >= minimumParts && parts[0] === normalizedCode && lastPart === normalizedSuffix;
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

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const participantError =
        participantCount < 1 || participantCount > availableSeats
            ? availableSeats > 0
                ? `Počet účastníků musí být mezi 1 a ${availableSeats}.`
                : 'Tento termín je momentálně bez volných míst.'
            : null;
    const fullnameError = fullname.trim() ? null : 'Vyplňte jméno a příjmení.';
    const emailError = email.trim() ? (emailIsValid ? null : 'Zadejte platný e-mail.') : 'Vyplňte e-mail.';
    const companyError = company.trim() ? null : 'Vyplňte firmu nebo fakturační jméno.';
    const billingDetailsError = billingDetails.trim() ? null : 'Vyplňte fakturační údaje.';
    const canSubmit = !participantError && !fullnameError && !emailError && !companyError && !billingDetailsError;

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

        const contactNote = [
            'AI Supervize Mini registration',
            `Workshop date: ${payload.selectedDate}`,
            `Participants: ${payload.participantCount}`,
            `Unit price CZK: ${payload.unitPriceCzk}`,
            `Base price CZK: ${payload.basePriceCzk}`,
            `Discount code entered: ${payload.discountCodeEntered ?? '(none)'}`,
            `Discount code used: ${payload.discountCodeUsed ?? '(none)'}`,
            `Discount percent applied: ${payload.discountPercentApplied}`,
            `Discount amount CZK: ${payload.discountAmountCzk}`,
            `Computed final price CZK: ${payload.computedFinalPriceCzk}`,
            '',
            JSON.stringify(payload, null, 4),
        ].join('\n');

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
                            {showValidation && participantError ? participantError : `Maximum pro tento termín: ${availableSeats}`}
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
                                // placeholder={`${normalizeDiscountCode(aiSupervizeMiniWorkshopConfig.discount.code)}_JMENO_${normalizeDiscountCode(aiSupervizeMiniWorkshopConfig.discount.codeFormat.suffix)}`}
                                className="h-11 pl-10 uppercase"
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            {discountCode.trim()
                                ? discountApplied
                                    ? `Aktivní sleva ${aiSupervizeMiniWorkshopConfig.discount.percent} %.`
                                    : 'Tento kód není aktivní.'
                                : 'Volitelné.'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="fullname" className="text-sm font-semibold text-slate-700">
                            Jméno a příjmení
                        </label>
                        <Input
                            id="fullname"
                            name="fullname"
                            value={fullname}
                            onChange={(event) => setFullname(event.target.value)}
                            placeholder="Jana Nováková"
                            aria-invalid={showValidation && !!fullnameError}
                            className={cn(
                                'mt-2 h-11',
                                showValidation && fullnameError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                            )}
                            autoComplete="name"
                        />
                        {showValidation && fullnameError && (
                            <p className="mt-1 text-xs text-red-600">{fullnameError}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                            E-mail
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
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
                    <label htmlFor="company" className="text-sm font-semibold text-slate-700">
                        Firma / organizace nebo fakturační jméno
                    </label>
                    <Input
                        id="company"
                        name="company"
                        value={company}
                        onChange={(event) => setCompany(event.target.value)}
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

                <div>
                    <label htmlFor="note" className="text-sm font-semibold text-slate-700">
                        Poznámka
                    </label>
                    <Textarea
                        id="note"
                        name="note"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Co řešíte, kolik lidí posíláte, specifické dotazy..."
                        className="mt-2 min-h-[96px]"
                    />
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
            </div>
        </form>
    );
}
