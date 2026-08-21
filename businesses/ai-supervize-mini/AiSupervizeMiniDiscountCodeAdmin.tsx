'use client';

import { AiSupervizeMiniDiscountCodeForm } from '@/businesses/ai-supervize-mini/AiSupervizeMiniDiscountCodeForm';
import {
    createAdminAiSupervizeMiniDiscountCode,
    deleteAdminAiSupervizeMiniDiscountCode,
    fetchAdminAiSupervizeMiniDiscountCodes,
    updateAdminAiSupervizeMiniDiscountCode,
} from '@/businesses/ai-supervize-mini/discountCodeAdminApiClient';
import {
    isAiSupervizeMiniDiscountActive,
    type AiSupervizeMiniDiscountCode,
    type AiSupervizeMiniDiscountCodeValues,
} from '@/businesses/ai-supervize-mini/discountCode';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, TicketPercent, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' });

type AiSupervizeMiniDiscountCodeAdminProps = {
    readonly adminToken: string;
};

function formatDiscountCodeDateTime(timestamp: string): string {
    return CZECH_DATE_TIME_FORMAT.format(new Date(timestamp));
}

function getDiscountCodeStatus(discountCode: AiSupervizeMiniDiscountCode): {
    readonly label: string;
    readonly className: string;
} {
    if (!discountCode.isEnabled) {
        return { label: 'Vypnutý', className: 'bg-slate-100 text-slate-600' };
    }

    if (isAiSupervizeMiniDiscountActive(discountCode, new Date())) {
        return { label: 'Aktivní', className: 'bg-emerald-100 text-emerald-700' };
    }

    return Date.parse(discountCode.startsAt) > Date.now()
        ? { label: 'Připravený', className: 'bg-amber-100 text-amber-700' }
        : { label: 'Skončený', className: 'bg-rose-100 text-rose-700' };
}

/**
 * Holds the list state and mutations for the discount-code administration.
 * The focused form owns its field state, keeping list refreshes independent.
 */
export function AiSupervizeMiniDiscountCodeAdmin({ adminToken }: AiSupervizeMiniDiscountCodeAdminProps) {
    const [discountCodes, setDiscountCodes] = useState<readonly AiSupervizeMiniDiscountCode[]>([]);
    const [editingDiscountCode, setEditingDiscountCode] = useState<AiSupervizeMiniDiscountCode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeletingDiscountCodeId, setIsDeletingDiscountCodeId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadDiscountCodes = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            const loadedDiscountCodes = await fetchAdminAiSupervizeMiniDiscountCodes(adminToken);
            setDiscountCodes(loadedDiscountCodes);
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Slevové kódy se nepodařilo načíst.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [adminToken]);

    useEffect(() => {
        void loadDiscountCodes();
    }, [loadDiscountCodes]);

    const handleSave = async (values: AiSupervizeMiniDiscountCodeValues): Promise<boolean> => {
        try {
            if (editingDiscountCode === null) {
                await createAdminAiSupervizeMiniDiscountCode(adminToken, values);
            } else {
                await updateAdminAiSupervizeMiniDiscountCode(adminToken, editingDiscountCode.id, values);
            }

            setEditingDiscountCode(null);
            return loadDiscountCodes();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Slevový kód se nepodařilo uložit.');
            return false;
        }
    };

    const handleDelete = async (discountCode: AiSupervizeMiniDiscountCode) => {
        const isDeletionConfirmed = window.confirm(`Opravdu chcete trvale smazat slevový kód ${discountCode.code}?`);
        if (!isDeletionConfirmed) {
            return;
        }

        setIsDeletingDiscountCodeId(discountCode.id);
        try {
            await deleteAdminAiSupervizeMiniDiscountCode(adminToken, discountCode.id);
            if (editingDiscountCode?.id === discountCode.id) {
                setEditingDiscountCode(null);
            }
            await loadDiscountCodes();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Slevový kód se nepodařilo smazat.');
        } finally {
            setIsDeletingDiscountCodeId(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
            <section className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-cyan-600 p-3 text-white">
                        <TicketPercent className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Slevy pro AI Supervize Mini</h2>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                            Registrace ověřuje každý kód na serveru z této databáze, takže změny zde platí i pro ručně
                            zadané kódy. URL z online workshopu neobsahuje pevný kód a použije právě vybranou nabídku.
                        </p>
                    </div>
                </div>
            </section>

            <AiSupervizeMiniDiscountCodeForm
                discountCode={editingDiscountCode}
                onSave={handleSave}
                onCancelEditing={() => setEditingDiscountCode(null)}
            />

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Uložené slevové kódy</h2>
                        <p className="mt-1 text-sm text-slate-500">Historické kódy můžete ponechat pro přehled nebo vypnout.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => void loadDiscountCodes()} disabled={isLoading}>
                        Obnovit
                    </Button>
                </div>

                {errorMessage !== null && <p className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Načítám slevové kódy…
                    </div>
                ) : discountCodes.length === 0 ? (
                    <p className="px-6 py-16 text-center text-sm text-slate-500">Zatím nemáte žádný slevový kód.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Kód</th>
                                    <th className="px-6 py-3 font-semibold">Sleva</th>
                                    <th className="px-6 py-3 font-semibold">Platnost</th>
                                    <th className="px-6 py-3 font-semibold">Stav</th>
                                    <th className="px-6 py-3 font-semibold">Navazující nabídka</th>
                                    <th className="px-6 py-3 text-right font-semibold">Akce</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {discountCodes.map((discountCode) => {
                                    const discountCodeStatus = getDiscountCodeStatus(discountCode);
                                    const isDeleting = isDeletingDiscountCodeId === discountCode.id;

                                    return (
                                        <tr key={discountCode.id} className="align-top">
                                            <td className="px-6 py-4 font-mono font-semibold text-slate-950">{discountCode.code}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">{discountCode.percent} %</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <span className="block">{formatDiscountCodeDateTime(discountCode.startsAt)}</span>
                                                <span className="block">až {formatDiscountCodeDateTime(discountCode.endsAt)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${discountCodeStatus.className}`}>
                                                    {discountCodeStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {discountCode.isOnlineWorkshopFollowUp ? 'Ano' : 'Ne'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isDeleting}
                                                        onClick={() => setEditingDiscountCode(discountCode)}
                                                    >
                                                        <Pencil className="mr-1.5 h-4 w-4" /> Upravit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={isDeleting}
                                                        onClick={() => void handleDelete(discountCode)}
                                                    >
                                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                                        {isDeleting ? 'Mažu…' : 'Smazat'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
