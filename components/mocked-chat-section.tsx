'use client';

import { Conversation } from '@/lib/conversations-data';
import { MockedChat } from '@promptbook/components';
import { generatePlaceholderAgentProfileImageUrl } from '@promptbook/core';

type MockedChatSectionProps = {
    conversation: Conversation;
};

export function MockedChatSection(props: MockedChatSectionProps) {
    const { conversation } = props;

    return (
        <div className="no-scrollbar lg:h-[80vh] w-full">
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
                participants={conversation.participants
                    .filter((participant: any) => participant.name !== 'user')
                    .map((participant: any) => ({
                        ...participant,
                        name: participant.name,
                        isMe: participant.isMe,
                        fullname: participant.fullname || participant.name,
                        color: participant.color || '#6B7280',
                        avatarSrc: generatePlaceholderAgentProfileImageUrl(participant.name),
                    }))}
                messages={conversation.messages.map((msg: any) => ({
                    id: msg.id,
                    from: msg.author,
                    content: msg.content,
                    date: msg.timestamp,
                }))}
            />
        </div>
    );
}
