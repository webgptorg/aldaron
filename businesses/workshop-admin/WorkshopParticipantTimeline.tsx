'use client';

import {
    formatWorkshopPresenceDuration,
    formatWorkshopAdminDateTime,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import { AdminContactDetails } from '@/components/admin/AdminContactDetails';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { WorkshopAdminParticipantTimeline, WorkshopParticipantTimelineEvent } from '@/lib/workshops/workshopTypes';
import { Clock3, LogIn, MessageCircle, Radio, ThumbsUp } from 'lucide-react';
import type { ComponentType } from 'react';

type WorkshopParticipantTimelineProps = {
    readonly isOpen: boolean;
    readonly onOpenChange: (isOpen: boolean) => void;
    readonly timeline: WorkshopAdminParticipantTimeline | null;
    readonly isLoading: boolean;
    readonly errorMessage: string | null;

    /**
     * Start of the schedule this attendance is measured against, or `null` in a room which has no schedule
     */
    readonly workshopStartsAt: string | null;
    readonly workshopEndsAt: string | null;
};

type TimelineEventDisplay = {
    readonly icon: ComponentType<{ readonly className?: string }>;
    readonly label: string;
    readonly detail: string | null;
};

function getTimelineEventDisplay(event: WorkshopParticipantTimelineEvent): TimelineEventDisplay {
    switch (event.kind) {
        case 'joined':
            return { icon: LogIn, label: 'Registrace a připojení do místnosti', detail: null };
        case 'last-seen':
            return { icon: Clock3, label: 'Naposledy aktivní v místnosti', detail: null };
        case 'comment':
            return {
                icon: MessageCircle,
                label: `Komentář (${event.status})`,
                detail: event.body,
            };
        case 'reaction':
            return { icon: Radio, label: `Reakce ${event.emoji}`, detail: null };
        case 'upvote':
            return {
                icon: ThumbsUp,
                label:
                    event.commentAuthorName === null
                        ? 'Hlas pro komentář'
                        : `Hlas pro komentář od ${event.commentAuthorName}`,
                detail: event.commentBody,
            };
    }
}

type WorkshopAttendanceSchedule = {
    readonly startsAt: string;
    readonly endsAt: string;
};

function getTimelinePositionPercent(timestamp: string, schedule: WorkshopAttendanceSchedule): number {
    const startsAtMilliseconds = Date.parse(schedule.startsAt);
    const endsAtMilliseconds = Date.parse(schedule.endsAt);
    const timestampMilliseconds = Date.parse(timestamp);
    const durationMilliseconds = Math.max(endsAtMilliseconds - startsAtMilliseconds, 1);
    const rawPercent = ((timestampMilliseconds - startsAtMilliseconds) / durationMilliseconds) * 100;
    return Math.min(100, Math.max(0, rawPercent));
}

/**
 * The span an attendance is drawn against, or `null` in a room which has no schedule to draw one in
 *
 * Note: A permanent room neither starts nor ends, so nothing places its members inside a span it never had. Their
 *       recorded moments are said in words instead, which need no schedule to be true.
 * Note: An unfinished workshop has no configured end. Its attendance interval is measured against the current moment
 *       rather than against each endpoint itself, otherwise the interval would collapse to zero width.
 */
function getWorkshopAttendanceScheduleOrNull(
    workshopStartsAt: string | null,
    workshopEndsAt: string | null,
    participantLastSeenAt: string,
): WorkshopAttendanceSchedule | null {
    if (workshopStartsAt === null) {
        return null;
    }

    if (workshopEndsAt !== null) {
        return { startsAt: workshopStartsAt, endsAt: workshopEndsAt };
    }

    const participantLastSeenAtMilliseconds = Date.parse(participantLastSeenAt);
    const currentMilliseconds = Date.now();
    const endsAtMilliseconds = Number.isNaN(participantLastSeenAtMilliseconds)
        ? currentMilliseconds
        : Math.max(currentMilliseconds, participantLastSeenAtMilliseconds);

    return { startsAt: workshopStartsAt, endsAt: new Date(endsAtMilliseconds).toISOString() };
}

export function WorkshopParticipantTimeline({
    isOpen,
    onOpenChange,
    timeline,
    isLoading,
    errorMessage,
    workshopStartsAt,
    workshopEndsAt,
}: WorkshopParticipantTimelineProps) {
    const participant = timeline?.participant;
    const attendanceSchedule =
        participant === undefined
            ? null
            : getWorkshopAttendanceScheduleOrNull(workshopStartsAt, workshopEndsAt, participant.lastSeenAt);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {participant === undefined ? 'Časová osa účastníka' : participant.fullname}
                    </DialogTitle>
                    <DialogDescription>
                        {participant === undefined
                            ? 'Načítám historii účastníka.'
                            : `${participant.email} · v místnosti ${formatWorkshopPresenceDuration(participant.activeDurationSeconds)}`}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 text-center text-sm text-slate-500">Načítám zaznamenané akce…</div>
                ) : errorMessage !== null ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {errorMessage}
                    </div>
                ) : timeline === null || participant === undefined ? null : (
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold text-slate-900">Kontaktní údaje a účasti</h3>
                            <div className="mt-3 rounded-xl border border-slate-200 p-4">
                                <AdminContactDetails
                                    contactGroup={participant.contactGroup}
                                    isContactRecordsIncluded
                                    isWorkshopParticipationsIncluded
                                />
                            </div>
                        </section>
                        <section className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                            <div className="flex flex-wrap justify-between gap-3 text-sm">
                                <div>
                                    <p className="font-semibold text-slate-900">Pozorovaný čas v místnosti</p>
                                    <p className="mt-1 text-slate-600">
                                        Od {formatWorkshopAdminDateTime(participant.connectedAt)} do{' '}
                                        {formatWorkshopAdminDateTime(participant.lastSeenAt)}
                                    </p>
                                </div>
                                <p className="font-semibold text-cyan-800">
                                    V místnosti {formatWorkshopPresenceDuration(participant.activeDurationSeconds)}
                                </p>
                            </div>
                            {attendanceSchedule !== null && (
                                <div
                                    className="relative mt-5 h-3 rounded-full bg-cyan-100"
                                    aria-label="Pozorovaný interval účasti"
                                >
                                    <div
                                        className="absolute top-0 h-3 rounded-full bg-cyan-600"
                                        style={{
                                            left: `${getTimelinePositionPercent(participant.connectedAt, attendanceSchedule)}%`,
                                            right: `${100 - getTimelinePositionPercent(participant.lastSeenAt, attendanceSchedule)}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-slate-900">Časová osa akcí</h3>
                            <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-5">
                                {timeline.events.map((event) => {
                                    const display = getTimelineEventDisplay(event);
                                    const Icon = display.icon;
                                    return (
                                        <li key={event.id} className="relative">
                                            <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-cyan-600 ring-2 ring-cyan-100">
                                                <Icon className="h-3.5 w-3.5" />
                                            </span>
                                            <p className="text-xs font-medium text-slate-400">
                                                {formatWorkshopAdminDateTime(event.occurredAt)}
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-slate-900">{display.label}</p>
                                            {display.detail !== null && (
                                                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                                                    {display.detail}
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
