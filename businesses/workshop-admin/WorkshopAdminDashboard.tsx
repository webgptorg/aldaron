'use client';

import { CreateWorkshopForm } from '@/businesses/workshop-admin/CreateWorkshopForm';
import {
    adjustAdminWorkshopCommentArtificialUpvotes,
    clearAdminWorkshopReactions,
    createAdminWorkshopArtificialComment,
    createAdminWorkshop,
    createAdminWorkshopContent,
    deleteAdminWorkshopComment,
    deleteAdminWorkshopContent,
    deleteAdminWorkshopParticipant,
    editAdminWorkshopCommentBody,
    fetchAdminWorkshopList,
    fetchAdminWorkshopSnapshot,
    moderateAdminWorkshopComment,
    pinAdminWorkshopComment,
    sendAdminWorkshopArtificialReaction,
    updateAdminWorkshop,
    updateAdminWorkshopContent,
    updateAdminWorkshopParticipantInteractionBan,
    updateAdminWorkshopParticipantTrusted,
    type WorkshopArtificialCommentValues,
    type WorkshopArtificialReactionValues,
    type WorkshopContentWriteValues,
    type WorkshopCreateValues,
    type WorkshopWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopAggregateTimeline } from '@/businesses/workshop-admin/WorkshopAggregateTimeline';
import { WorkshopArtificialComment } from '@/businesses/workshop-admin/WorkshopArtificialComment';
import { WorkshopArtificialReaction } from '@/businesses/workshop-admin/WorkshopArtificialReaction';
import { WorkshopCommentModeration } from '@/businesses/workshop-admin/WorkshopCommentModeration';
import { WorkshopContentAdmin } from '@/businesses/workshop-admin/WorkshopContentAdmin';
import { WorkshopExportButton } from '@/businesses/workshop-admin/WorkshopExportButton';
import { WorkshopParticipantList } from '@/businesses/workshop-admin/WorkshopParticipantList';
import { WorkshopReactionSummary } from '@/businesses/workshop-admin/WorkshopReactionSummary';
import { WorkshopSettingsForm } from '@/businesses/workshop-admin/WorkshopSettingsForm';
import { mergeWorkshopAdminSnapshot } from '@/businesses/workshop-admin/workshopAdminSnapshot';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
    WorkshopAdminSnapshot,
    WorkshopCommentStatus,
    WorkshopKind,
    WorkshopSummary,
} from '@/lib/workshops/workshopTypes';
import { BarChart3, BookOpenText, MessageCircle, Radio, RefreshCw, Settings2, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ADMIN_SNAPSHOT_REFRESH_INTERVAL_MILLISECONDS = 5_000;
const WORKSHOP_ADMIN_SECTION_VALUES = [
    'overview',
    'participants',
    'comments',
    'reactions',
    'content',
    'settings',
] as const;

type WorkshopAdminSection = (typeof WORKSHOP_ADMIN_SECTION_VALUES)[number];

const WORKSHOP_ADMIN_SECTION_DEFINITIONS: readonly {
    readonly value: WorkshopAdminSection;
    readonly label: string;
    readonly icon: typeof BarChart3;
}[] = [
    { value: 'overview', label: 'Přehled', icon: BarChart3 },
    { value: 'participants', label: 'Účastníci', icon: Users },
    { value: 'comments', label: 'Komentáře', icon: MessageCircle },
    { value: 'reactions', label: 'Reakce', icon: Radio },
    { value: 'content', label: 'Obsah', icon: BookOpenText },
    { value: 'settings', label: 'Nastavení', icon: Settings2 },
];

type WorkshopAdminDashboardProps = {
    readonly adminToken: string;
    readonly initialWorkshopSlug: string | null;
    readonly workshopKind?: WorkshopKind;
    readonly isWorkshopCreationEnabled?: boolean;
    readonly selectorLabel?: string;
    readonly subjectLabel?: string;
    readonly emptyStateMessage?: string;
    readonly isSlugEditable?: boolean;
};

function isWorkshopAdminSection(value: string): value is WorkshopAdminSection {
    return WORKSHOP_ADMIN_SECTION_VALUES.some((sectionValue) => sectionValue === value);
}

export function WorkshopAdminDashboard({
    adminToken,
    initialWorkshopSlug,
    workshopKind = 'workshop',
    isWorkshopCreationEnabled = true,
    selectorLabel = 'Workshop',
    subjectLabel = 'workshopu',
    emptyStateMessage = 'Vytvořte první workshop.',
    isSlugEditable = true,
}: WorkshopAdminDashboardProps) {
    const [workshops, setWorkshops] = useState<readonly WorkshopSummary[]>([]);
    const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<WorkshopAdminSection>('overview');
    const [snapshot, setSnapshot] = useState<WorkshopAdminSnapshot | null>(null);
    const [commentStatus, setCommentStatus] = useState<WorkshopCommentStatus>('pending');
    const [snapshotRefreshVersion, setSnapshotRefreshVersion] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const snapshotLoadSequenceReference = useRef(0);

    const loadWorkshopList = useCallback(async () => {
        try {
            const loadedWorkshops = await fetchAdminWorkshopList(adminToken, workshopKind);
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
    }, [adminToken, initialWorkshopSlug, workshopKind]);

    const loadSnapshot = useCallback(async () => {
        const snapshotLoadSequence = ++snapshotLoadSequenceReference.current;
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
            const loadedSnapshot = await fetchAdminWorkshopSnapshot(
                adminToken,
                selectedWorkshopId,
                commentStatus,
                selectedSection === 'comments',
            );
            if (snapshotLoadSequence !== snapshotLoadSequenceReference.current) {
                return;
            }

            setSnapshot((currentSnapshot) => mergeWorkshopAdminSnapshot(currentSnapshot, loadedSnapshot));
            setSnapshotRefreshVersion((currentVersion) => currentVersion + 1);
            setErrorMessage(null);
        } catch (error) {
            if (snapshotLoadSequence === snapshotLoadSequenceReference.current) {
                setErrorMessage((error as Error).message);
            }
        } finally {
            if (snapshotLoadSequence === snapshotLoadSequenceReference.current) {
                setIsSnapshotLoading(false);
            }
        }
    }, [adminToken, commentStatus, selectedSection, selectedWorkshopId]);

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
    const handleUnlockContentNow = (contentId: string) => {
        if (snapshot === null) {
            return Promise.resolve(false);
        }

        const contentBlock = snapshot.contentBlocks.find((currentContentBlock) => currentContentBlock.id === contentId);
        if (contentBlock === undefined) {
            return Promise.resolve(false);
        }

        return runAndReload(() =>
            updateAdminWorkshopContent(adminToken, snapshot.workshop.id, contentId, {
                title: contentBlock.title,
                bodyMarkdown: contentBlock.bodyMarkdown,
                unlockAt: new Date().toISOString(),
                sortOrder: contentBlock.sortOrder,
                isPublished: true,
            }),
        );
    };
    const handleModerateComment = async (commentId: string, status: Exclude<WorkshopCommentStatus, 'pending'>) => {
        if (snapshot !== null) {
            await runAndReload(() => moderateAdminWorkshopComment(adminToken, snapshot.workshop.id, commentId, status));
        }
    };
    const handleEditCommentBody = (commentId: string, body: string) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => editAdminWorkshopCommentBody(adminToken, snapshot.workshop.id, commentId, body));
    const handleChangeCommentPin = (commentId: string, isPinned: boolean) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => pinAdminWorkshopComment(adminToken, snapshot.workshop.id, commentId, isPinned));
    const handleDeleteComment = async (commentId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopComment(adminToken, snapshot.workshop.id, commentId));
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
    const handleChangeParticipantTrusted = async (participantId: string, isTrusted: boolean) => {
        if (snapshot !== null) {
            await runAndReload(() =>
                updateAdminWorkshopParticipantTrusted(adminToken, snapshot.workshop.id, participantId, isTrusted),
            );
        }
    };
    const handleDeleteParticipant = async (participantId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopParticipant(adminToken, snapshot.workshop.id, participantId));
        }
    };
    const handleClearReactions = () =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => clearAdminWorkshopReactions(adminToken, snapshot.workshop.id));

    const handleSectionChange = (value: string) => {
        if (isWorkshopAdminSection(value)) {
            setSelectedSection(value);
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
                        {selectorLabel}
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
                {isWorkshopCreationEnabled && <CreateWorkshopForm onCreate={handleCreateWorkshop} />}
            </aside>

            <div className="min-w-0 space-y-6">
                {errorMessage !== null && (
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
                        {emptyStateMessage}
                    </div>
                ) : (
                    <Tabs value={selectedSection} onValueChange={handleSectionChange}>
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1 sm:grid-cols-3 xl:grid-cols-6">
                            {WORKSHOP_ADMIN_SECTION_DEFINITIONS.map((sectionDefinition) => {
                                const SectionIcon = sectionDefinition.icon;
                                return (
                                    <TabsTrigger
                                        key={sectionDefinition.value}
                                        value={sectionDefinition.value}
                                        className="gap-1.5 px-2.5 py-2"
                                    >
                                        <SectionIcon className="h-4 w-4" /> {sectionDefinition.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    { label: 'Účastníci', value: snapshot.participantCount, icon: Users },
                                    { label: 'Komentáře', value: snapshot.commentCount, icon: MessageCircle },
                                    { label: 'Reakce', value: snapshot.reactionCount, icon: Radio },
                                ].map((statistic) => (
                                    <div
                                        key={statistic.label}
                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                    >
                                        <statistic.icon className="h-5 w-5 text-cyan-600" />
                                        <p className="mt-3 text-2xl font-bold text-slate-950">{statistic.value}</p>
                                        <p className="text-xs text-slate-500">{statistic.label}</p>
                                    </div>
                                ))}
                            </div>
                            <WorkshopAggregateTimeline
                                adminToken={adminToken}
                                workshopId={snapshot.workshop.id}
                                refreshVersion={snapshotRefreshVersion}
                            />
                        </TabsContent>

                        <TabsContent value="participants">
                            <WorkshopParticipantList
                                adminToken={adminToken}
                                workshopId={snapshot.workshop.id}
                                workshopStartsAt={snapshot.workshop.startsAt}
                                workshopEndsAt={snapshot.workshop.endsAt}
                                refreshVersion={snapshotRefreshVersion}
                                onChangeInteractionBan={handleChangeParticipantInteractionBan}
                                onChangeTrusted={handleChangeParticipantTrusted}
                                onDelete={handleDeleteParticipant}
                            />
                        </TabsContent>

                        <TabsContent value="comments" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    adminToken={adminToken}
                                    workshopId={snapshot.workshop.id}
                                    exportKind="comments"
                                    label="Exportovat komentáře CSV"
                                />
                            </div>
                            <WorkshopCommentModeration
                                comments={snapshot.comments}
                                commentStatus={commentStatus}
                                pinnedComment={snapshot.pinnedComment}
                                onChangeCommentStatus={setCommentStatus}
                                onModerate={handleModerateComment}
                                onEditBody={handleEditCommentBody}
                                onChangePin={handleChangeCommentPin}
                                onAdjustArtificialUpvotes={handleAdjustArtificialUpvotes}
                                onDelete={handleDeleteComment}
                            />
                            <WorkshopArtificialComment onCreate={handleCreateArtificialComment} />
                        </TabsContent>

                        <TabsContent value="reactions" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    adminToken={adminToken}
                                    workshopId={snapshot.workshop.id}
                                    exportKind="reactions"
                                    label="Exportovat reakce CSV"
                                />
                            </div>
                            <WorkshopReactionSummary
                                adminToken={adminToken}
                                workshopId={snapshot.workshop.id}
                                refreshVersion={snapshotRefreshVersion}
                            />
                            <WorkshopArtificialReaction
                                reactionCount={snapshot.reactionCount}
                                artificialReactionCount={snapshot.artificialReactionCount}
                                onSend={handleSendArtificialReaction}
                                onClear={handleClearReactions}
                            />
                        </TabsContent>

                        <TabsContent value="content" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    adminToken={adminToken}
                                    workshopId={snapshot.workshop.id}
                                    exportKind="content"
                                    label="Exportovat obsah CSV"
                                />
                            </div>
                            <WorkshopContentAdmin
                                workshopStartsAt={snapshot.workshop.startsAt}
                                contentBlocks={snapshot.contentBlocks}
                                onCreate={handleCreateContent}
                                onUpdate={handleUpdateContent}
                                onDelete={handleDeleteContent}
                                onUnlockNow={handleUnlockContentNow}
                            />
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    adminToken={adminToken}
                                    workshopId={snapshot.workshop.id}
                                    exportKind="settings"
                                    label="Exportovat nastavení CSV"
                                />
                            </div>
                            <WorkshopSettingsForm
                                workshop={snapshot.workshop}
                                onSave={handleSaveWorkshop}
                                subjectLabel={subjectLabel}
                                isSlugEditable={isSlugEditable}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
