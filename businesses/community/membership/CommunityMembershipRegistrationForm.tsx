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
import { Check, CheckCircle2, Crown, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { CommunityMembershipBillingToggle } from './CommunityMembershipBillingToggle';
import {
    COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT,
    getCommunityMembershipPlan,
    type CommunityMembershipBillingPeriod,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';
import { CommunityMembershipPriceDisplay } from './CommunityMembershipPriceDisplay';
import { submitCommunityMembershipRegistration } from './communityMembershipRegistrationApi';
import type { CommunityMembershipRegistrationResult } from './communityMembershipRegistration';
import { formatCommunityMembershipPrice } from './communityMembershipPrice';

type CommunityMembershipRegistrationFormProps = {
    readonly initialFullname: string;
    readonly initialEmail: string;
    readonly selectedPlanId: PaidCommunityMembershipPlanId;
    readonly onSelectedPlanIdChange: (planId: PaidCommunityMembershipPlanId) => void;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly onBillingPeriodChange: (billingPeriod: CommunityMembershipBillingPeriod) => void;
    readonly discountCodeValidation: DiscountCodeValidation;
};

const PAID_PLAN_IDS = ['standard', 'premium'] as const satisfies readonly PaidCommunityMembershipPlanId[];

export function CommunityMembershipRegistrationForm({
    initialFullname,
    initialEmail,
    selectedPlanId,
    onSelectedPlanIdChange,
    billingPeriod,
    onBillingPeriodChange,
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
                planId: selectedPlanId,
                billingPeriod,
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
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">Registraci máme</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    {fullname}, připravujeme vaše zkušební členství{' '}
                    {getCommunityMembershipPlan(registrationResult.planId).name}.
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                    Na <strong>{email}</strong> pošleme potvrzení a další krok k aktivaci. Prvních{' '}
                    {registrationResult.trialDayCount} dní je zdarma.
                </p>
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-white/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                        Vaše garantovaná cena
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {formatCommunityMembershipPrice(registrationResult.price.finalMonthlyEquivalentCzk)} / měsíc
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {registrationResult.billingPeriod === 'yearly'
                            ? `Po zkušebním období platba ${formatCommunityMembershipPrice(
                                  registrationResult.price.finalBillingPriceCzk,
                              )} jednou ročně.`
                            : 'Po zkušebním období platba každý měsíc.'}{' '}
                        Cena vám zůstává po dobu nepřerušeného členství ve stejném plánu.
                    </p>
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
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">7 dní zdarma</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">Aktivace členství</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Smlouva vznikne až naším potvrzením e-mailem.
                    </p>
                </div>
            </div>

            <fieldset className="mt-7">
                <legend className="text-sm font-semibold text-slate-700">Vyberte plán</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                    {PAID_PLAN_IDS.map((planId) => {
                        const plan = getCommunityMembershipPlan(planId);
                        const isSelected = planId === selectedPlanId;

                        return (
                            <button
                                key={plan.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => onSelectedPlanIdChange(planId)}
                                className={cn(
                                    'rounded-2xl border p-4 text-left transition',
                                    isSelected
                                        ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
                                        : 'border-slate-200 hover:border-slate-300',
                                )}
                            >
                                <span className="flex items-center gap-2 font-bold text-slate-950">
                                    {planId === 'premium' ? <Sparkles className="h-4 w-4 text-violet-600" /> : null}
                                    {plan.name}
                                </span>
                                <span className="mt-1 block text-xs text-slate-500">
                                    od {formatCommunityMembershipPrice(plan.yearlyPriceCzk / 12)} / měs.
                                </span>
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            <div className="mt-5">
                <p className="text-sm font-semibold text-slate-700">Platba</p>
                <CommunityMembershipBillingToggle
                    billingPeriod={billingPeriod}
                    onChange={onBillingPeriodChange}
                    className="mt-2 w-full justify-center"
                />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                <CommunityMembershipPriceDisplay
                    planId={selectedPlanId}
                    billingPeriod={billingPeriod}
                    activeDiscount={discountCodeValidation.activeDiscount}
                />
                <div className="mt-4 flex items-start gap-2 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    Prvních {COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT} dní nic neplatíte. Sjednanou cenu držíme po dobu
                    nepřerušeného členství ve stejném plánu.
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
                    Kód se kombinuje s výhodnější roční cenou.
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
                    a žádám o aktivaci 7denního zkušebního období.
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
                {isSubmitting ? 'Odesílám…' : `Aktivovat ${COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT} dní zdarma`}
            </Button>

            <PersonalDataConsentNote language="cs" className="mt-4 text-center text-slate-400">
                Údaje použijeme k aktivaci a správě členství.
            </PersonalDataConsentNote>
        </form>
    );
}
