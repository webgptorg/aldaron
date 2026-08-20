/**
 * @vitest-environment jsdom
 */

import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
import type { WorkshopCommentValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const QUESTION: WorkshopComment = {
    id: 'question',
    authorName: 'Jana Nováková',
    body: 'Jak nasadit agenta do produkce?',
    status: 'approved',
    upvoteCount: 2,
    isUpvotedByParticipant: false,
    createdAt: '2026-08-20T19:00:00.000Z',
    parentCommentId: null,
    isPinned: false,
};
const ANSWER: WorkshopComment = {
    ...QUESTION,
    id: 'answer',
    authorName: 'Karel Novák',
    body: 'Přes frontu úloh.',
    upvoteCount: 0,
    createdAt: '2026-08-20T19:10:00.000Z',
    parentCommentId: 'question',
};
const PENDING_QUESTION: WorkshopComment = {
    ...QUESTION,
    id: 'pending-question',
    body: 'Tahle zpráva čeká na schválení.',
    status: 'pending',
    createdAt: '2026-08-20T19:20:00.000Z',
};
const PINNED_QUESTION: WorkshopComment = {
    ...QUESTION,
    id: 'pinned-question',
    body: 'Tahle zpráva drží začátek chatu.',
    createdAt: '2026-08-20T18:30:00.000Z',
    isPinned: true,
};
const NEW_MESSAGE_LABEL = 'Nová zpráva do chatu';
const ANSWER_LABEL = 'Odpověď na komentář od Jana Nováková';
const ANSWER_BUTTON_LABEL = 'Odpovědět na komentář od Jana Nováková';

function renderChat(
    onSubmitComment: (values: WorkshopCommentValues) => Promise<boolean>,
    comments: readonly WorkshopComment[] = [QUESTION, ANSWER],
    isEnabled = true,
) {
    return render(
        <WorkshopChat
            comments={comments}
            commentSort="recent"
            isEnabled={isEnabled}
            isInteractionBanned={false}
            onChangeSort={vi.fn()}
            onSubmitComment={onSubmitComment}
            onUpvoteComment={vi.fn()}
        />,
    );
}

function getComposer(label: string): HTMLElement {
    const composer = screen.getByRole('textbox', { name: label }).closest('form');
    if (composer === null) {
        throw new Error(`The chat form "${label}" was not found.`);
    }

    return composer;
}

function sendMessage(label: string, body: string) {
    const composer = getComposer(label);
    fireEvent.change(within(composer).getByRole('textbox'), { target: { value: body } });
    fireEvent.click(within(composer).getByRole('button', { name: 'Odeslat' }));
}

describe('workshop chat', () => {
    afterEach(() => {
        cleanup();
    });

    it('sends a written message as a new conversation', () => {
        const onSubmitComment = vi.fn().mockResolvedValue(true);
        renderChat(onSubmitComment);

        sendMessage(NEW_MESSAGE_LABEL, 'Kdy bude záznam?');

        expect(onSubmitComment).toHaveBeenCalledWith({ body: 'Kdy bude záznam?', parentCommentId: null });
    });

    it('shows an answer below the comment it answers and never offers answering it again', () => {
        renderChat(vi.fn());

        expect(screen.getByText('Přes frontu úloh.')).not.toBeNull();
        expect(
            screen
                .getAllByRole('button', { name: /^Odpovědět na komentář/ })
                .map((answerButton) => answerButton.getAttribute('aria-label')),
        ).toEqual([ANSWER_BUTTON_LABEL]);
    });

    it('sends an answer to the very comment the participant replied to', async () => {
        const onSubmitComment = vi.fn().mockResolvedValue(true);
        renderChat(onSubmitComment);

        fireEvent.click(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL }));
        sendMessage(ANSWER_LABEL, 'Díky, to dává smysl.');

        expect(onSubmitComment).toHaveBeenCalledWith({ body: 'Díky, to dává smysl.', parentCommentId: 'question' });
        await waitFor(() => expect(screen.queryByRole('textbox', { name: ANSWER_LABEL })).toBeNull());
    });

    it('keeps an answer which was not accepted in its form', async () => {
        const onSubmitComment = vi.fn().mockResolvedValue(false);
        renderChat(onSubmitComment);

        fireEvent.click(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL }));
        sendMessage(ANSWER_LABEL, 'Díky, to dává smysl.');

        await waitFor(() => expect(onSubmitComment).toHaveBeenCalledTimes(1));
        expect(screen.getByRole('textbox', { name: ANSWER_LABEL })).toHaveProperty('value', 'Díky, to dává smysl.');
    });

    it('gives up an answer on cancel', () => {
        renderChat(vi.fn());

        fireEvent.click(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL }));
        fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }));

        expect(screen.queryByRole('textbox', { name: ANSWER_LABEL })).toBeNull();
        expect(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL })).not.toBeNull();
    });

    it('holds the pinned message on top of the chat however old it is and marks it for the room', () => {
        renderChat(vi.fn(), [QUESTION, PINNED_QUESTION]);

        const messages = screen.getAllByRole('article');
        expect(messages[0]?.textContent).toContain(PINNED_QUESTION.body);
        expect(messages[0]?.textContent).toContain('Připnuto');
        expect(messages[1]?.textContent).toContain(QUESTION.body);
    });

    it('does not offer answering a message which the room does not see yet', () => {
        renderChat(vi.fn(), [PENDING_QUESTION]);

        expect(screen.getByText('Tahle zpráva čeká na schválení.')).not.toBeNull();
        expect(screen.queryByRole('button', { name: /^Odpovědět na komentář/ })).toBeNull();
    });

    it('keeps a switched-off chat readable but takes away every way of writing into it', () => {
        renderChat(vi.fn(), [QUESTION, ANSWER], false);

        expect(screen.getByText(QUESTION.body)).not.toBeNull();
        expect(screen.getByText('Chat je teď jen pro čtení.')).not.toBeNull();
        expect(screen.queryByRole('textbox', { name: NEW_MESSAGE_LABEL })).toBeNull();
        expect(screen.queryByRole('button', { name: /^Odpovědět na komentář/ })).toBeNull();
        screen
            .getAllByRole('button', { name: /^Hlasovat pro komentář/ })
            .forEach((upvoteButton) => expect(upvoteButton).toHaveProperty('disabled', true));
    });
});
