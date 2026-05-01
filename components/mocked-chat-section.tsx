'use client';

import { Conversation } from '@/lib/conversations-data';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MockedChat = dynamic(() => import('@promptbook/components').then((module) => module.MockedChat), {
    ssr: false,
});

type MockedChatSectionProps = {
    conversation: Conversation;
};

export function MockedChatSection(props: MockedChatSectionProps) {
    const { conversation } = props;

    const participants = useMemo(
        () =>
            conversation.participants
                .filter((participant: any) => participant.name !== 'user')
                .map((participant: any) => ({
                    ...participant,
                    name: participant.name,
                    isMe: participant.isMe,
                    fullname: participant.fullname || participant.name,
                    color: participant.color || '#6B7280',
                    avatarSrc: participant.avatar! /* || generatePlaceholderAgentProfileImageUrl(participant.name)*/,
                })),
        [conversation.participants],
    );

    const messages = useMemo(
        () =>
            conversation.messages.map((msg: any) => ({
                id: msg.id,
                sender: msg.author,
                content: msg.content,
                date: msg.timestamp,
            })),
        [conversation.messages],
    );

    return (
        <div className="no-scrollbar no-chat-animations w-full max-w-full overflow-hidden lg:h-[80vh] [&>*]:max-w-full">
            <MockedChat
                // className="debug"
                title={conversation.title}
                isFocusedOnLoad={false}
                isSaveButtonEnabled={false}
                isCopyButtonEnabled={false}
                isResettable={false}
                isPausable={false}
                delayConfig={{
                    showIntermediateMessages: 1,
                }}
                participants={participants}
                messages={messages}
                layout="STANDALONE"
                visualMode="BUBBLE_MODE"
            />
        </div>
    );
}
