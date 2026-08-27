'use client';

import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { normalizeDiscountCode } from '@/lib/discounts/discountCode';
import type { DiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { getLegalLink } from '@/lib/legal/legalLinks';
import { cn } from '@/lib/utils';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { Check, CheckCircle2, Crown, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
} from './communityMembershipConfig';
import { CommunityMembershipPriceDisplay } from './CommunityMembershipPriceDisplay';
import { submitCommunityMembershipRegistration } from './communityMembershipRegistrationApi';
import type { CommunityMembershipRegistrationResult } from './communityMembershipRegistration';
import { formatCommunityMembershipPrice } from './communityMembershipPrice';

type CommunityMembershipRegistrationFormProps = {
    readonly initialFullname: string;
    readonly initialEmail: string;
    readonly discountCodeValidation: DiscountCodeValidation;
};

const MONTHLY_BILLING_PERIOD = 'monthly' as const;

export function CommunityMembershipRegistrationForm({
    initialFullname,
    initialEmail,
    discountCodeValidation,
}: CommunityMembershipRegistrationFormProps) {
    const [fullname, setFullname] = useState(initialFullname);
    const [email, setEmail] = useState(initialEmail);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registrationResult, setRegistrationResult] = useState<CommunityMembershipRegistrationResult | null>(null);

    const fullnameError = fullname.trim() === '' ? 'Vyplňte jméno a příjmení.' : null;
    const emailError = email.trim()
        ? isEmailAddressValid(email.trim())
            ? null
            : 'Zadejte platný e-mail.'
        : 'Vyplňte e-mail.';
    const hasEnteredDiscountCode = discountCodeValidation.discountCode.trim() !== '';
    const normalizedDiscountCode = normalizeDiscountCode(discountCodeValidation.discountCode);
    const isDiscountCodeReady =
        !hasEnteredDiscountCode ||
        (normalizedDiscountCode !== '' &&
            !discountCodeValidation.isValidationPending &&
            discountCodeValidation.activeDiscount !== null);
    const canSubmit =
        fullnameError === null &&
        emailError === null &&
        areTermsAccepted &&
        isDiscountCodeReady &&
        discountCodeValidation.validationError === null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) {
            setShowValidation(true);
            setError(
                !isDiscountCodeReady || discountCodeValidation.validationError !== null
                    ? 'Použijte platný slevový kód, nebo pole nechte prázdné.'
                    : 'Vyplňte jméno, platný e-mail a potvrďte obchodní podmínky.',
            );
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitCommunityMembershipRegistration({
                planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
                billingPeriod: MONTHLY_BILLING_PERIOD,
                fullname: fullname.trim(),
                email: email.trim(),
                discountCode: discountCodeValidation.discountCode,
                termsAccepted: true,
            });
            setRegistrationResult(result);
        } catch (submissionError) {
            setError(
                submissionError instanceof Error
                    ? submissionError.message
                    : 'Registraci se nepodařilo odeslat. Zkuste to prosím znovu.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (registrationResult !== null) {
        return (
            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">Máme to</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    {fullname}, připravujeme vaše placené členství.
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                    Na <strong>{email}</strong> pošleme potvrzení, platební údaje a další krok k aktivaci. Členství
                    můžete kdykoli zrušit.
                </p>
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-white/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Vaše měsíční cena</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {formatCommunityMembershipPrice(registrationResult.price.finalMonthlyEquivalentCzk)} / měsíc
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Platba každý měsíc, bez ročního závazku.</p>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8"
            noValidate
        >
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-cyan-200">
                    <Crown className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Placené členství</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">
                        {formatCommunityMembershipPrice(CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK)} měsíčně
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Živé AI webináře zůstávají zdarma.
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                <CommunityMembershipPriceDisplay
                    planId={CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID}
                    billingPeriod={MONTHLY_BILLING_PERIOD}
                    activeDiscount={discountCodeValidation.activeDiscount}
                />
                <div className="mt-4 flex items-start gap-2 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    Platba je každý měsíc. Členství můžete kdykoli zrušit.
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="community-membership-fullname" className="text-sm font-semibold text-slate-700">
                        Jméno a příjmení
                    </label>
                    <Input
                        id="community-membership-fullname"
                        name="fullname"
                        value={fullname}
                        onChange={(event) => setFullname(event.target.value)}
                        maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH}
                        autoComplete="name"
                        placeholder="Jana Nováková"
                        aria-invalid={showValidation && fullnameError !== null}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && fullnameError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {showValidation && fullnameError && <p className="mt-1 text-xs text-red-600">{fullnameError}</p>}
                </div>
                <div>
                    <label htmlFor="community-membership-email" className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id="community-membership-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH}
                        autoComplete="email"
                        placeholder="jmeno@firma.cz"
                        aria-invalid={showValidation && emailError !== null}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && emailError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {showValidation && emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                </div>
            </div>

            <div className="mt-5">
                <DiscountCodeField inputId="community-membership-discount-code" validation={discountCodeValidation} />
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Máte slevový kód? Zadejte ho; jinak nechte pole prázdné.
                </p>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-600">
                <Checkbox
                    checked={areTermsAccepted}
                    onCheckedChange={(checked) => setAreTermsAccepted(checked === true)}
                    className="mt-0.5"
                    aria-label="Souhlasím s obchodními podmínkami"
                />
                <span>
                    Souhlasím s{' '}
                    <Link
                        href={getLegalLink('termsAndConditions', 'cs').href}
                        className="font-semibold text-cyan-700 underline underline-offset-4"
                    >
                        obchodními podmínkami
                    </Link>{' '}
                    a žádám o placené členství za zobrazenou měsíční cenu.
                </span>
            </label>
            {showValidation && !areTermsAccepted && (
                <p className="mt-1 text-xs text-red-600">Potvrďte prosím obchodní podmínky.</p>
            )}

            {error !== null && (
                <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting || discountCodeValidation.isValidationPending}
                className="mt-6 h-12 w-full rounded-full bg-slate-950 text-base text-white hover:bg-slate-800"
            >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                {isSubmitting
                    ? 'Odesílám…'
                    : `Chci placené členství za ${formatCommunityMembershipPrice(
                          CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
                      )} / měsíc`}
            </Button>

            <PersonalDataConsentNote language="cs" className="mt-4 text-center text-slate-400">
                Údaje použijeme k aktivaci a správě členství.
            </PersonalDataConsentNote>
        </form>
    );
}
