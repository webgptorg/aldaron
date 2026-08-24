'use client';

import { useWorkshopAdminFeedback } from '@/businesses/workshop-admin/useWorkshopAdminFeedback';
import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { AdminContactDetails } from '@/components/admin/AdminContactDetails';
import type { WorkshopAdminFeedback } from '@/lib/workshops/workshopTypes';
import { Mail, MessageSquareText, RefreshCw, Star } from 'lucide-react';

type WorkshopFeedbackAdminProps = {
    readonly workshopId: string;
    readonly refreshVersion: number;
};

type FeedbackAnswerKey = 'whatWasGood' | 'whatWasBad' | 'note';

const FEEDBACK_ANSWER_DEFINITIONS: readonly {
    readonly key: FeedbackAnswerKey;
    readonly label: string;
}[] = [
    { key: 'whatWasGood', label: 'Co bylo přínosné' },
    { key: 'whatWasBad', label: 'Co zlepšit' },
    { key: 'note', label: 'Další vzkaz' },
];

function WorkshopFeedbackStars({ rating }: { readonly rating: number }) {
    return (
        <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`Hodnocení ${rating} z 5 hvězd`}>
            {[1, 2, 3, 4, 5].map((starRating) => (
                <Star
                    key={starRating}
                    className={`h-4 w-4 ${starRating <= rating ? 'fill-current' : 'text-slate-300'}`}
                    aria-hidden="true"
                />
            ))}
        </span>
    );
}

function WorkshopFeedbackCard({ feedback }: { readonly feedback: WorkshopAdminFeedback }) {
    const filledAnswers = FEEDBACK_ANSWER_DEFINITIONS.filter(({ key }) => {
        const answer = feedback[key];
        return answer !== null && answer.trim() !== '';
    });

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-950">{feedback.fullname}</h3>
                    <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {feedback.email}
                    </p>
                </div>
                <div className="text-right">
                    <WorkshopFeedbackStars rating={feedback.rating} />
                    <p className="mt-1 text-xs text-slate-500">{formatWorkshopAdminDateTime(feedback.updatedAt)}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)]">
                <dl className="space-y-4">
                    {filledAnswers.length === 0 ? (
                        <p className="text-sm text-slate-400">Účastník zatím odeslal jen hodnocení hvězdami.</p>
                    ) : (
                        filledAnswers.map(({ key, label }) => (
                            <div key={key}>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                                <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                    {feedback[key]}
                                </dd>
                            </div>
                        ))
                    )}
                </dl>
                <aside className="border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Spojený kontakt</p>
                    <div className="mt-2">
                        <AdminContactDetails
                            contactGroup={feedback.contactGroup}
                            isContactRecordsIncluded
                            isWorkshopParticipationsIncluded={false}
                        />
                    </div>
                </aside>
            </div>
        </article>
    );
}

/**
 * The administration's dedicated, access-controlled feedback reading. Contact context stays next to each answer,
 * but the feedback itself remains a workshop record rather than being copied into the contact table.
 */
export function WorkshopFeedbackAdmin({ workshopId, refreshVersion }: WorkshopFeedbackAdminProps) {
    const { feedbacks, errorMessage, isInitialLoading } = useWorkshopAdminFeedback({ workshopId, refreshVersion });

    return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <MessageSquareText className="h-5 w-5 text-cyan-700" /> Zpětná vazba
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Hodnocení i postupně uložené odpovědi účastníků. Zobrazují se pouze administrátorům.
                    </p>
                </div>
                {feedbacks !== null && (
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
                        {feedbacks.length}
                    </span>
                )}
            </div>

            {isInitialLoading ? (
                <div className="flex justify-center py-10">
                    <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" aria-label="Načítám zpětnou vazbu" />
                </div>
            ) : errorMessage !== null ? (
                <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {errorMessage}
                </div>
            ) : feedbacks === null || feedbacks.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
                    Zatím není odeslána žádná zpětná vazba.
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {feedbacks.map((feedback) => (
                        <WorkshopFeedbackCard key={feedback.id} feedback={feedback} />
                    ))}
                </div>
            )}
        </section>
    );
}
