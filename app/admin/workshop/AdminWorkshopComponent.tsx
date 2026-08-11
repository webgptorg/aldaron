'use client';

import { AddContentBlockForm } from '@/app/admin/workshop/AddContentBlockForm';
import { useWorkshopAdministration } from '@/app/admin/workshop/useWorkshopAdministration';
import { WorkshopChatModeration } from '@/app/admin/workshop/WorkshopChatModeration';
import { WorkshopContentBlockCard } from '@/app/admin/workshop/WorkshopContentBlockCard';
import { WorkshopSettingsForm } from '@/app/admin/workshop/WorkshopSettingsForm';
import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { useGetParam } from '@/hooks/useGetParam';
import Link from 'next/link';

/**
 * How far behind the last block the next one is placed, so that the order can still be edited in between
 */
const SORT_ORDER_STEP = 10;

/**
 * Dashboard which steers the whole room of the online workshop
 *
 * Note: It is reached by the very same `?token=` link as the rest of the administration, there is no separate login.
 */
export default function AdminWorkshopComponent() {
    const [adminToken] = useGetParam('token');
    const {
        settings,
        contentBlocks,
        chatMessages,
        isLoading,
        errorMessage,
        saveSettings,
        addContentBlock,
        changeContentBlock,
        removeContentBlock,
        changeChatMessage,
        removeChatMessage,
    } = useWorkshopAdministration(adminToken);

    const nextSortOrder =
        contentBlocks.reduce((highestSortOrder, contentBlock) => Math.max(highestSortOrder, contentBlock.sortOrder), 0) +
        SORT_ORDER_STEP;

    return (
        <div className="p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">Online Workshop Dashboard</h1>
                <Link
                    href={ONLINE_WORKSHOP_PARTICIPANT_PATH}
                    target="_blank"
                    className="text-sm text-cyan-700 underline-offset-4 hover:underline"
                >
                    Open the participant page
                </Link>
            </div>

            {errorMessage !== null && (
                <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(24rem,1fr)]">
                    <div className="space-y-6">
                        {settings !== null && (
                            <WorkshopSettingsForm settings={settings} onSaveSettings={saveSettings} />
                        )}

                        <div className="space-y-4">
                            <h2 className="text-lg font-bold">
                                Content blocks
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    unlocked one by one, whenever it suits - during the workshop or days later
                                </span>
                            </h2>

                            {contentBlocks.map((contentBlock) => (
                                <WorkshopContentBlockCard
                                    key={contentBlock.id}
                                    contentBlock={contentBlock}
                                    onChangeContentBlock={(contentBlockChanges) =>
                                        changeContentBlock(contentBlock.id, contentBlockChanges)
                                    }
                                    onRemoveContentBlock={() => removeContentBlock(contentBlock.id)}
                                />
                            ))}

                            <AddContentBlockForm nextSortOrder={nextSortOrder} onAddContentBlock={addContentBlock} />
                        </div>
                    </div>

                    <WorkshopChatModeration
                        chatMessages={chatMessages}
                        onHideChatMessage={(chatMessageId, isHidden) => changeChatMessage(chatMessageId, { isHidden })}
                        onRemoveChatMessage={removeChatMessage}
                    />
                </div>
            )}
        </div>
    );
}
