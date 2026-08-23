'use client';

import type {
    AiSupervizeMiniDiscountCode,
    AiSupervizeMiniDiscountCodeValues,
} from '@/businesses/ai-supervize-mini/discountCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { Save, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

const DEFAULT_DISCOUNT_PERCENT = 10;
const DEFAULT_DISCOUNT_VALIDITY_MILLISECONDS = 24 * 60 * 60 * 1000;

type AiSupervizeMiniDiscountCodeFormProps = {
    readonly discountCode: AiSupervizeMiniDiscountCode | null;
    readonly onSave: (values: AiSupervizeMiniDiscountCodeValues) => Promise<boolean>;
    readonly onCancelEditing: () => void;
};

function createNewAiSupervizeMiniDiscountCodeValues(): AiSupervizeMiniDiscountCodeValues {
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + DEFAULT_DISCOUNT_VALIDITY_MILLISECONDS);

    return {
        code: '',
        percent: DEFAULT_DISCOUNT_PERCENT,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        isEnabled: true,
        isOnlineWorkshopFollowUp: false,
    };
}

function createAiSupervizeMiniDiscountCodeValues(
    discountCode: AiSupervizeMiniDiscountCode | null,
): AiSupervizeMiniDiscountCodeValues {
    if (discountCode === null) {
        return createNewAiSupervizeMiniDiscountCodeValues();
    }

    return {
        code: discountCode.code,
        percent: discountCode.percent,
        startsAt: discountCode.startsAt,
        endsAt: discountCode.endsAt,
        isEnabled: discountCode.isEnabled,
        isOnlineWorkshopFollowUp: discountCode.isOnlineWorkshopFollowUp,
    };
}

/**
 * Edits one complete discount code, so a saved request can be checked against
 * the exact same validity range that the public registration uses.
 */
export function AiSupervizeMiniDiscountCodeForm({
    discountCode,
    onSave,
    onCancelEditing,
}: AiSupervizeMiniDiscountCodeFormProps) {
    const [values, setValues] = useState<AiSupervizeMiniDiscountCodeValues>(() =>
        createAiSupervizeMiniDiscountCodeValues(discountCode),
    );
    const [isSaving, setIsSaving] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        setValues(createAiSupervizeMiniDiscountCodeValues(discountCode));
        setValidationError(null);
    }, [discountCode]);

    const isEditing = discountCode !== null;

    const updateValue = <TField extends keyof AiSupervizeMiniDiscountCodeValues>(
        field: TField,
        value: AiSupervizeMiniDiscountCodeValues[TField],
    ) => {
        setValues((currentValues) => ({ ...currentValues, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const startsAt = fromDateTimeLocalValue(toDateTimeLocalValue(values.startsAt));
        const endsAt = fromDateTimeLocalValue(toDateTimeLocalValue(values.endsAt));
        if (startsAt === null || endsAt === null || !values.code.trim()) {
            setValidationError('Vyplňte kód a obě data platnosti.');
            return;
        }
        if (Date.parse(endsAt) < Date.parse(startsAt)) {
            setValidationError('Konec platnosti musí být po začátku platnosti.');
            return;
        }

        setValidationError(null);
        setIsSaving(true);
        const isSaved = await onSave({ ...values, startsAt, endsAt });
        setIsSaving(false);

        if (isSaved && !isEditing) {
            setValues(createNewAiSupervizeMiniDiscountCodeValues());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">
                        {isEditing ? 'Upravit slevový kód' : 'Nový slevový kód'}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Kód se při uložení sjednotí na velká písmena a podtržítka. Platnost je včetně okamžiku začátku
                        i konce.
                    </p>
                </div>
                {isEditing && (
                    <Button type="button" variant="outline" size="sm" onClick={onCancelEditing} disabled={isSaving}>
                        <X className="mr-2 h-4 w-4" /> Zrušit úpravy
                    </Button>
                )}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                    Slevový kód
                    <Input
                        value={values.code}
                        onChange={(event) => updateValue('code', event.target.value)}
                        className="mt-2 uppercase"
                        placeholder="WEBINAR_2026_09_04"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Sleva v procentech
                    <Input
                        type="number"
                        min={1}
                        max={100}
                        value={values.percent}
                        onChange={(event) => updateValue('percent', Number(event.target.value))}
                        className="mt-2"
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Začátek platnosti
                    <Input
                        type="datetime-local"
                        value={toDateTimeLocalValue(values.startsAt)}
                        onChange={(event) => {
                            const startsAt = fromDateTimeLocalValue(event.target.value);
                            if (startsAt !== null) {
                                updateValue('startsAt', startsAt);
                            }
                        }}
                        className="mt-2"
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Konec platnosti
                    <Input
                        type="datetime-local"
                        value={toDateTimeLocalValue(values.endsAt)}
                        onChange={(event) => {
                            const endsAt = fromDateTimeLocalValue(event.target.value);
                            if (endsAt !== null) {
                                updateValue('endsAt', endsAt);
                            }
                        }}
                        className="mt-2"
                        required
                    />
                </label>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={values.isEnabled}
                        onChange={(event) => updateValue('isEnabled', event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Kód je zapnutý</strong>
                        Vypnutý kód se nikdy neuplatní, i kdyby byl v období platnosti.
                    </span>
                </label>
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={values.isOnlineWorkshopFollowUp}
                        onChange={(event) => updateValue('isOnlineWorkshopFollowUp', event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Navazující nabídka z online workshopu</strong>
                        Odkazy z online workshopu automaticky použijí tento jediný vybraný kód, pokud je právě aktivní.
                    </span>
                </label>
            </div>

            {validationError !== null && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</p>}

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Ukládám…' : isEditing ? 'Uložit změny' : 'Vytvořit slevový kód'}
                </Button>
            </div>
        </form>
    );
}
