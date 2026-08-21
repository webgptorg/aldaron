import {
    WORKSHOP_ADMIN_EXPORT_KINDS,
    buildWorkshopAdminExportFileName,
    createWorkshopAdminExportFile,
    serializeWorkshopAdminParticipantsAsCsv,
    serializeWorkshopAdminParticipantsAsVcard,
} from '@/lib/workshops/workshopAdminExports';
import type { WorkshopAdminParticipant, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: 'workshop-id',
    slug: 'production-code-with-agents',
    title: 'Produkční kód s AI agenty',
    description: 'Praktický online workshop.',
    startsAt: '2026-08-20T17:00:00.000Z',
    endsAt: '2026-08-20T18:30:00.000Z',
    youtubeVideoId: null,
    isPublished: true,
    allowedReactions: ['👍', '🚀'],
    disabledPanels: [],
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
};

const PARTICIPANT: WorkshopAdminParticipant = {
    id: 'participant-id',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
    connectedAt: '2026-08-20T16:55:00.000Z',
    lastSeenAt: '2026-08-20T18:25:00.000Z',
    isInteractionBanned: false,
    isTrusted: true,
    activeDurationSeconds: 4_800,
    commentCount: 2,
    reactionCount: 5,
    linkClickCount: 1,
    upvoteCount: 3,
};

describe('workshop admin exports', () => {
    it('offers a deliberately finite export for each workshop administration section', () => {
        expect(WORKSHOP_ADMIN_EXPORT_KINDS).toEqual([
            'settings',
            'participants',
            'participants-vcard',
            'comments',
            'reactions',
            'content',
            'timeline',
        ]);
    });

    it('writes the full participant activity summary as a spreadsheet-friendly CSV', () => {
        const csv = serializeWorkshopAdminParticipantsAsCsv([PARTICIPANT]);

        expect(csv.charCodeAt(0)).toBe(0xfeff);
        expect(csv).toContain('"Jméno","E-mail","Registrace","Naposledy aktivní"');
        expect(csv).toContain('"Jana Nováková","jana@example.com"');
        expect(csv).toContain('"4800","2","5","1","3","ano","ne"');
    });

    it('writes a useful contact card for each filtered participant', () => {
        const vcard = serializeWorkshopAdminParticipantsAsVcard(WORKSHOP, [PARTICIPANT]);

        expect(vcard).toContain('BEGIN:VCARD');
        expect(vcard).toContain('N:Nováková;Jana;;;');
        expect(vcard).toContain('EMAIL;TYPE=INTERNET:jana@example.com');
        expect(vcard).toContain('UID:workshop-participant-participant-id');
        expect(vcard).toContain('Účastník workshopu: Produkční kód s AI agenty');
    });

    it('uses the matching MIME type and filename for participant vCards', () => {
        const exportFile = createWorkshopAdminExportFile('participants-vcard', {
            workshop: WORKSHOP,
            participants: [PARTICIPANT],
        });

        expect(exportFile.mimeType).toBe('text/vcard;charset=utf-8');
        expect(exportFile.fileExtension).toBe('vcf');
        expect(buildWorkshopAdminExportFileName(WORKSHOP, 'participants-vcard')).toBe(
            'production-code-with-agents-participants-vcard.vcf',
        );
    });
});
