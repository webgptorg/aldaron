'use client';

import { CreateWorkshopForm } from '@/businesses/workshop-admin/CreateWorkshopForm';
import {
    adjustAdminWorkshopCommentArtificialUpvotes,
    createAdminWorkshopArtificialComment,
    createAdminWorkshop,
    createAdminWorkshopContent,
    deleteAdminWorkshopContent,
    fetchAdminWorkshopList,
    fetchAdminWorkshopSnapshot,
    moderateAdminWorkshopComment,
    sendAdminWorkshopArtificialReaction,
    updateAdminWorkshop,
    updateAdminWorkshopContent,
    updateAdminWorkshopParticipantInteractionBan,
    type WorkshopArtificialCommentValues,
    type WorkshopArtificialReactionValues,
    type WorkshopContentWriteValues,
    type WorkshopCreateValues,
    type WorkshopWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopArtificialActivity } from '@/businesses/workshop-admin/WorkshopArtificialActivity';
import { WorkshopCommentModeration } from '@/businesses/workshop-admin/WorkshopCommentModeration';
import { WorkshopContentAdmin } from '@/businesses/workshop-admin/WorkshopContentAdmin';
import { WorkshopParticipantList } from '@/businesses/workshop-admin/WorkshopParticipantList';
import { WorkshopSettingsForm } from '@/businesses/workshop-admin/WorkshopSettingsForm';
import { mergeWorkshopAdminSnapshot } from '@/businesses/workshop-admin/workshopAdminSnapshot';
import { Button } from '@/components/ui/button';
import type { WorkshopAdminSnapshot, WorkshopCommentStatus, WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { MessageCircle, Radio, RefreshCw, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ADMIN_SNAPSHOT_REFRESH_INTERVAL_MILLISECONDS = 5_000;

type WorkshopAdminDashboardProps = {
    readonly adminToken: string;
    readonly initialWorkshopSlug: string | null;
};

export function WorkshopAdminDashboard({ adminToken, initialWorkshopSlug }: WorkshopAdminDashboardProps) {
    const [workshops, setWorkshops] = useState<readonly WorkshopSummary[]>([]);
    const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
    const [snapshot, setSnapshot] = useState<WorkshopAdminSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const snapshotLoadSequenceRef = useRef(0);

    const loadWorkshopList = useCallback(async () => {
        try {
            const loadedWorkshops = await fetchAdminWorkshopList(adminToken);
            setWorkshops(loadedWorkshops);
            setSelectedWorkshopId((currentId) => {
                if (currentId && loadedWorkshops.some(({ id }) => id === currentId)) {
                    return currentId;
                }
                return (
                    loadedWorkshops.find(({ slug }) => slug === initialWorkshopSlug)?.id ??
                    loadedWorkshops[0]?.id ??
                    null
                );
            });
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [adminToken, initialWorkshopSlug]);

    const loadSnapshot = useCallback(async () => {
        const snapshotLoadSequence = ++snapshotLoadSequenceRef.current;
        if (!selectedWorkshopId) {
            setSnapshot(null);
            setIsSnapshotLoading(false);
            return;
        }

        setSnapshot((currentSnapshot) =>
            currentSnapshot?.workshop.id === selectedWorkshopId ? currentSnapshot : null,
        );
        setIsSnapshotLoading(true);
        try {
            const loadedSnapshot = await fetchAdminWorkshopSnapshot(adminToken, selectedWorkshopId);
            if (snapshotLoadSequence !== snapshotLoadSequenceRef.current) {
                return;
            }
            setSnapshot((currentSnapshot) => mergeWorkshopAdminSnapshot(currentSnapshot, loadedSnapshot));
            setErrorMessage(null);
        } catch (error) {
            if (snapshotLoadSequence === snapshotLoadSequenceRef.current) {
                setErrorMessage((error as Error).message);
            }
        } finally {
            if (snapshotLoadSequence === snapshotLoadSequenceRef.current) {
                setIsSnapshotLoading(false);
            }
        }
    }, [adminToken, selectedWorkshopId]);

    useEffect(() => void loadWorkshopList(), [loadWorkshopList]);
    useEffect(() => void loadSnapshot(), [loadSnapshot]);
    useEffect(() => {
        if (!selectedWorkshopId) {
            return;
        }

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void loadSnapshot();
            }
        }, ADMIN_SNAPSHOT_REFRESH_INTERVAL_MILLISECONDS);
        return () => window.clearInterval(intervalId);
    }, [loadSnapshot, selectedWorkshopId]);

    const handleCreateWorkshop = async (values: WorkshopCreateValues): Promise<boolean> => {
        try {
            const workshop = await createAdminWorkshop(adminToken, values);
            await loadWorkshopList();
            setSelectedWorkshopId(workshop.id);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        }
    };

    const runAndReload = async (mutation: () => Promise<unknown>): Promise<boolean> => {
        try {
            await mutation();
            await Promise.all([loadSnapshot(), loadWorkshopList()]);
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        }
    };

    const handleSaveWorkshop = (values: WorkshopWriteValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => updateAdminWorkshop(adminToken, snapshot.workshop.id, values));
    const handleCreateContent = (values: WorkshopContentWriteValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => createAdminWorkshopContent(adminToken, snapshot.workshop.id, values));
    const handleUpdateContent = (contentId: string, values: WorkshopContentWriteValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => updateAdminWorkshopContent(adminToken, snapshot.workshop.id, contentId, values));
    const handleDeleteContent = async (contentId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopContent(adminToken, snapshot.workshop.id, contentId));
        }
    };
    const handleModerateComment = async (commentId: string, status: Exclude<WorkshopCommentStatus, 'pending'>) => {
        if (snapshot !== null) {
            await runAndReload(() => moderateAdminWorkshopComment(adminToken, snapshot.workshop.id, commentId, status));
        }
    };
    const handleAdjustArtificialUpvotes = (commentId: string, artificialUpvoteAdjustment: number) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() =>
                  adjustAdminWorkshopCommentArtificialUpvotes(
                      adminToken,
                      snapshot.workshop.id,
                      commentId,
                      artificialUpvoteAdjustment,
                  ),
              );
    const handleCreateArtificialComment = (values: WorkshopArtificialCommentValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => createAdminWorkshopArtificialComment(adminToken, snapshot.workshop.id, values));
    const handleSendArtificialReaction = (values: WorkshopArtificialReactionValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => sendAdminWorkshopArtificialReaction(adminToken, snapshot.workshop.id, values));
    const handleChangeParticipantInteractionBan = async (participantId: string, isInteractionBanned: boolean) => {
        if (snapshot !== null) {
            await runAndReload(() =>
                updateAdminWorkshopParticipantInteractionBan(
                    adminToken,
                    snapshot.workshop.id,
                    participantId,
                    isInteractionBanned,
                ),
            );
        }
    };

    return (
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label
                        htmlFor="workshop-selector"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                        Workshop
                    </label>
                    <select
                        id="workshop-selector"
                        value={selectedWorkshopId ?? ''}
                        onChange={(event) => setSelectedWorkshopId(event.target.value || null)}
                        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                        {workshops.map((workshop) => (
                            <option key={workshop.id} value={workshop.id}>
                                {workshop.title}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => void loadSnapshot()}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Obnovit data
                    </Button>
                </div>
                <CreateWorkshopForm onCreate={handleCreateWorkshop} />
            </aside>

            <div className="min-w-0 space-y-6">
                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}
                {isLoading || (isSnapshotLoading && snapshot === null) ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="h-6 w-6 animate-spin text-cyan-600" />
                    </div>
                ) : snapshot === null ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
                        Vytvořte první workshop.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Účastníci', value: snapshot.participantCount, icon: Users },
                                { label: 'Komentáře', value: snapshot.commentCount, icon: MessageCircle },
                                { label: 'Reakce', value: snapshot.reactionCount, icon: Radio },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <stat.icon className="h-5 w-5 text-cyan-600" />
                                    <p className="mt-3 text-2xl font-bold text-slate-950">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                        <WorkshopSettingsForm workshop={snapshot.workshop} onSave={handleSaveWorkshop} />
                        <WorkshopParticipantList
                            participantCount={snapshot.participantCount}
                            participants={snapshot.participants}
                            onChangeInteractionBan={handleChangeParticipantInteractionBan}
                        />
                        <WorkshopArtificialActivity
                            artificialReactionCount={snapshot.artificialReactionCount}
                            onCreateArtificialComment={handleCreateArtificialComment}
                            onSendArtificialReaction={handleSendArtificialReaction}
                        />
                        <WorkshopContentAdmin
                            workshopStartsAt={snapshot.workshop.startsAt}
                            contentBlocks={snapshot.contentBlocks}
                            onCreate={handleCreateContent}
                            onUpdate={handleUpdateContent}
                            onDelete={handleDeleteContent}
                        />
                        <WorkshopCommentModeration
                            comments={snapshot.comments}
                            onModerate={handleModerateComment}
                            onAdjustArtificialUpvotes={handleAdjustArtificialUpvotes}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
