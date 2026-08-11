'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAXIMAL_CHAT_MESSAGE_LENGTH } from '@/lib/workshop/workshopConfig';
import type { WorkshopChatMessage } from '@/lib/workshop/workshopTypes';
import { cn } from '@/lib/utils';
import { MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type WorkshopChatPanelProps = {
    readonly chatMessages: readonly WorkshopChatMessage[];

    /**
     * Identifier of this browser, which tells the own messages from the ones of the others
     */
    readonly participantId: string;

    readonly isChatEnabled: boolean;
    readonly onSendMessage: (messageText: string) => Promise<boolean>;
};

/**
 * The live chat of the workshop
 *
 * Note: The messages arrive with the same round which brings everything else, so the chat needs no connection of
 *       its own.
 */
export function WorkshopChatPanel({
    chatMessages,
    participantId,
    isChatEnabled,
    onSendMessage,
}: WorkshopChatPanelProps) {
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Note: A chat which does not follow the conversation on its own is useless during a live workshop
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [chatMessages.length]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedMessageText = messageText.trim();

        if (trimmedMessageText === '' || isSending) {
            return;
        }

        setIsSending(true);
        const isSent = await onSendMessage(trimmedMessageText);
        setIsSending(false);

        if (isSent) {
            setMessageText('');
        }
    };

    return (
        <section className="flex h-full min-h-[26rem] flex-col rounded-2xl border border-white/15 bg-white/[0.06]">
            <header className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                <MessageSquare className="h-4 w-4 text-cyan-200" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Chat</h2>
                <span className="ml-auto text-xs text-white/40">{chatMessages.length} zpráv</span>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {chatMessages.length === 0 && (
                    <p className="text-sm leading-relaxed text-white/45">
                        Zatím tu nikdo nic nenapsal. Klidně začni ty, ptát se můžeš kdykoli během workshopu.
                    </p>
                )}

                {chatMessages.map((chatMessage) => {
                    const isOwnMessage = chatMessage.participantId === participantId;

                    return (
                        <div key={chatMessage.id} className={cn('flex flex-col', isOwnMessage && 'items-end')}>
                            <div
                                className={cn(
                                    'max-w-[92%] rounded-2xl px-4 py-2.5',
                                    isOwnMessage ? 'bg-promptbook-blue-dark text-white' : 'bg-white/10 text-white/90',
                                )}
                            >
                                <p className="text-xs font-semibold text-cyan-200">
                                    {isOwnMessage ? 'Ty' : chatMessage.participantName}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {chatMessage.messageText}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
                {isChatEnabled ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={messageText}
                            onChange={(event) => setMessageText(event.target.value)}
                            placeholder="Napiš zprávu nebo dotaz"
                            maxLength={MAXIMAL_CHAT_MESSAGE_LENGTH}
                            aria-label="Zpráva do chatu"
                            className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/35 focus-visible:ring-cyan-300"
                        />
                        <Button
                            type="submit"
                            disabled={isSending || messageText.trim() === ''}
                            aria-label="Odeslat zprávu"
                            className="h-11 shrink-0 rounded-full bg-promptbook-blue-dark px-4 text-white hover:bg-promptbook-blue-dark/90"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <p className="px-2 py-1 text-center text-sm text-white/50">Chat je právě zavřený.</p>
                )}
            </form>
        </section>
    );
}
