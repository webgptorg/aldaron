'use client';

import defaultBook from '@/businesses/_generic/default.book';
import dynamic from 'next/dynamic';

const BookEditor = dynamic(() => import('@promptbook/components').then((m) => m.BookEditor), { ssr: false });
const MockedChat = dynamic(() => import('@promptbook/components').then((m) => m.MockedChat), { ssr: false });

const SAMPLE_MESSAGES = [
    {
        sender: 'user',
        content: "Hello! Can you help me understand my company's leave policy?",
    },
    {
        sender: 'agent',
        content:
            "Of course! Based on the company policies, employees are entitled to **20 days** of paid leave per year. You can carry over up to 5 unused days to the next year. Would you like more details on a specific aspect?",
    },
    {
        sender: 'user',
        content: 'What about sick leave?',
    },
    {
        sender: 'agent',
        content:
            "Sick leave is handled separately from annual leave. You are entitled to up to **10 days** of paid sick leave per year. After 3 consecutive sick days, a doctor's certificate is required. Is there anything else you'd like to know?",
    },
];

const SAMPLE_PARTICIPANTS = [
    { name: 'user', fullname: 'You', isMe: true, color: '#6B7280' },
    { name: 'agent', fullname: 'Legal Assistant', color: '#30A8BD' },
];

export function BrandingComponentsDemo() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Book Editor</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">Define your AI agent in plain text</h3>
                </div>
                <BookEditor
                    value={defaultBook}
                    height="420px"
                    isReadonly
                    isDownloadButtonShown={false}
                    isAboutButtonShown={false}
                    isFullscreenButtonShown={false}
                    isBorderRadiusDisabled
                />
            </div>

            <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mocked Chat</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">Preview conversations in your UI</h3>
                </div>
                <div className="h-[420px] overflow-hidden [&>*]:h-full [&>*]:max-w-full">
                    <MockedChat
                        messages={SAMPLE_MESSAGES}
                        participants={SAMPLE_PARTICIPANTS}
                        layout="STANDALONE"
                        isFocusedOnLoad={false}
                        isSaveButtonEnabled={false}
                        isCopyButtonEnabled={false}
                        isResettable={false}
                        isPausable={false}
                        delayConfig={{ showIntermediateMessages: 1 }}
                    />
                </div>
            </div>
        </div>
    );
}
