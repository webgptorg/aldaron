'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import {
    isDiscountCodeValidForAllPlaces,
    type DiscountCode,
    type DiscountCodeValues,
} from '@/lib/discounts/discountCode';
import { MAXIMAL_DISCOUNT_CODE_USE_COUNT, MAXIMAL_DISCOUNT_PERCENT } from '@/lib/discounts/discountCodeConstants';
import { DISCOUNT_PLACES } from '@/lib/discounts/discountPlaces';
import { Save, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

const DEFAULT_DISCOUNT_PERCENT = 10;
const DEFAULT_DISCOUNT_VALIDITY_MILLISECONDS = 24 * 60 * 60 * 1000;
const DEFAULT_MAXIMAL_USE_COUNT = 10;

type DiscountCodeFormProps = {
    readonly discountCode: DiscountCode | null;
    readonly onSave: (values: DiscountCodeValues) => Promise<boolean>;
    readonly onCancelEditing: () => void;
};

function createNewDiscountCodeValues(): DiscountCodeValues {
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + DEFAULT_DISCOUNT_VALIDITY_MILLISECONDS);

    return {
        code: '',
        percent: DEFAULT_DISCOUNT_PERCENT,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        isEnabled: true,
        placeIds: [],
        maximumUseCount: null,
    };
}

function createDiscountCodeValues(discountCode: DiscountCode | null): DiscountCodeValues {
    if (discountCode === null) {
        return createNewDiscountCodeValues();
    }

    return {
        code: discountCode.code,
        percent: discountCode.percent,
        startsAt: discountCode.startsAt,
        endsAt: discountCode.endsAt,
        isEnabled: discountCode.isEnabled,
        placeIds: discountCode.placeIds,
        maximumUseCount: discountCode.maximumUseCount,
    };
}

function toggleDiscountPlaceId(
    placeIds: readonly string[],
    discountPlaceId: string,
    isSelected: boolean,
): readonly string[] {
    if (isSelected) {
        return placeIds.includes(discountPlaceId) ? placeIds : [...placeIds, discountPlaceId];
    }

    return placeIds.filter((selectedPlaceId) => selectedPlaceId !== discountPlaceId);
}

/**
 * Edits one complete discount code, so a saved code can be checked against exactly the same
 * validity window, places and use limit that the public registration reads.
 */
export function DiscountCodeForm({ discountCode, onSave, onCancelEditing }: DiscountCodeFormProps) {
    const [values, setValues] = useState<DiscountCodeValues>(() => createDiscountCodeValues(discountCode));
    const [isValidForAllPlaces, setIsValidForAllPlaces] = useState(() =>
        isDiscountCodeValidForAllPlaces(createDiscountCodeValues(discountCode)),
    );
    const [isSaving, setIsSaving] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        const editedValues = createDiscountCodeValues(discountCode);
        setValues(editedValues);
        setIsValidForAllPlaces(isDiscountCodeValidForAllPlaces(editedValues));
        setValidationError(null);
    }, [discountCode]);

    const isEditing = discountCode !== null;
    const isUseCountLimited = values.maximumUseCount !== null;

    const updateValue = <TField extends keyof DiscountCodeValues>(
        field: TField,
        value: DiscountCodeValues[TField],
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
        if (!isValidForAllPlaces && values.placeIds.length === 0) {
            setValidationError('Vyberte alespoň jedno místo, kde kód platí, nebo zvolte všechna místa.');
            return;
        }

        setValidationError(null);
        setIsSaving(true);
        const isSaved = await onSave({
            ...values,
            startsAt,
            endsAt,
            placeIds: isValidForAllPlaces ? [] : values.placeIds,
        });
        setIsSaving(false);

        if (isSaved && !isEditing) {
            const newValues = createNewDiscountCodeValues();
            setValues(newValues);
            setIsValidForAllPlaces(true);
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
                        max={MAXIMAL_DISCOUNT_PERCENT}
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
            </div>

            <fieldset className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <legend className="px-1 text-sm font-semibold text-slate-950">Kde kód platí</legend>
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isValidForAllPlaces}
                        onChange={(event) => setIsValidForAllPlaces(event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Všechna místa</strong>
                        Kód platí všude, kde se slevové kódy zadávají, i v místech přidaných později.
                    </span>
                </label>

                {!isValidForAllPlaces && (
                    <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                        {DISCOUNT_PLACES.map((discountPlace) => (
                            <label key={discountPlace.id} className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={values.placeIds.includes(discountPlace.id)}
                                    onChange={(event) =>
                                        updateValue(
                                            'placeIds',
                                            toggleDiscountPlaceId(
                                                values.placeIds,
                                                discountPlace.id,
                                                event.target.checked,
                                            ),
                                        )
                                    }
                                    className="mt-0.5 h-4 w-4 rounded"
                                />
                                <span>
                                    <strong className="block text-slate-950">{discountPlace.label}</strong>
                                    {discountPlace.description}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </fieldset>

            <fieldset className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <legend className="px-1 text-sm font-semibold text-slate-950">Počet použití</legend>
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isUseCountLimited}
                        onChange={(event) =>
                            updateValue(
                                'maximumUseCount',
                                event.target.checked
                                    ? discountCode?.maximumUseCount ?? DEFAULT_MAXIMAL_USE_COUNT
                                    : null,
                            )
                        }
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Omezit maximální počet použití</strong>
                        Bez omezení může kód použít libovolný počet registrací.
                    </span>
                </label>

                {isUseCountLimited && (
                    <label className="mt-4 block border-t border-slate-200 pt-4 text-sm font-medium text-slate-700">
                        Maximální počet použití
                        <Input
                            type="number"
                            min={1}
                            max={MAXIMAL_DISCOUNT_CODE_USE_COUNT}
                            value={values.maximumUseCount ?? DEFAULT_MAXIMAL_USE_COUNT}
                            onChange={(event) => updateValue('maximumUseCount', Number(event.target.value))}
                            className="mt-2 max-w-xs"
                            required
                        />
                        <span className="mt-2 block text-xs font-normal text-slate-500">
                            {isEditing
                                ? `Zatím použito ${discountCode.useCount}×. Zbývající použití vidí zájemce přímo v registračním formuláři.`
                                : 'Zbývající použití vidí zájemce přímo v registračním formuláři.'}
                        </span>
                    </label>
                )}
            </fieldset>

            {validationError !== null && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</p>
            )}

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Ukládám…' : isEditing ? 'Uložit změny' : 'Vytvořit slevový kód'}
                </Button>
            </div>
        </form>
    );
}
