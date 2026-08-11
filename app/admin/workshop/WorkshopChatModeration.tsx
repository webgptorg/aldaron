'use client';

import { Button } from '@/components/ui/button';
import type { WorkshopChatMessage } from '@/lib/workshop/workshopTypes';
import { cn } from '@/lib/utils';

type WorkshopChatModerationProps = {
    readonly chatMessages: readonly WorkshopChatMessage[];
    readonly onHideChatMessage: (chatMessageId: number, isHidden: boolean) => Promise<boolean>;
    readonly onRemoveChatMessage: (chatMessageId: number) => Promise<boolean>;
};

/**
 * The chat as the moderation sees it, the already hidden messages included
 *
 * Note: Hiding takes the message away from the participants with their next round, deleting removes it for good.
 */
export function WorkshopChatModeration({
    chatMessages,
    onHideChatMessage,
    onRemoveChatMessage,
}: WorkshopChatModerationProps) {
    const handleDeleteClick = async (chatMessage: WorkshopChatMessage) => {
        if (!window.confirm(`Delete the message of ${chatMessage.participantName} for good?`)) {
            return;
        }

        await onRemoveChatMessage(chatMessage.id);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold">Live chat</h2>
            <p className="mt-1 text-sm text-gray-500">
                The newest messages are at the bottom and refresh on their own while the workshop runs.
            </p>

            {chatMessages.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">Nobody has written anything yet.</p>
            ) : (
                <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
                    {chatMessages.map((chatMessage) => (
                        <li
                            key={chatMessage.id}
                            className={cn(
                                'flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-2',
                                chatMessage.isHidden && 'bg-gray-50 opacity-60',
                            )}
                        >
                            <div className="min-w-0 grow">
                                <p className="text-xs font-semibold text-gray-500">
                                    {chatMessage.participantName}
                                    {chatMessage.createdAt !== null && (
                                        <span className="ml-2 font-normal text-gray-400">
                                            {new Date(chatMessage.createdAt).toLocaleTimeString()}
                                        </span>
                                    )}
                                    {chatMessage.isHidden && (
                                        <span className="ml-2 font-normal text-amber-600">hidden</span>
                                    )}
                                </p>
                                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-800">
                                    {chatMessage.messageText}
                                </p>
                            </div>

                            <div className="flex shrink-0 gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onHideChatMessage(chatMessage.id, !chatMessage.isHidden)}
                                >
                                    {chatMessage.isHidden ? 'Show' : 'Hide'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(chatMessage)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
