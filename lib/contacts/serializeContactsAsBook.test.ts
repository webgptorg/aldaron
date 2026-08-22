import type { AdminJoinedContact, AdminWorkshopParticipation } from '@/lib/admin/adminContactJoin';
import type { Contact } from '@/lib/contacts/Contact';
import { serializeAdminJoinedContactsAsBook } from '@/lib/contacts/serializeContactsAsBook';
import { describe, expect, it } from 'vitest';

const CONTACT_RECORD: Contact = {
    id: 12,
    createdAt: '2026-08-10T10:00:00.000Z',
    fullname: 'Jana Nováková',
    email: 'JANA+lead@EXAMPLE.COM',
    phone: '+420 777 000 111',
    userNote: 'Chci materiály.',
    isContacted: false,
    ourNote: 'Ozvat se po workshopu.',
    userAgent: 'Mozilla/5.0',
    ipAddress: '203.0.113.42',
    referrer: 'https://example.com/',
    appName: 'Landing page',
    placeName: 'Online workshop',
    url: 'https://ptbk.io/cs/online-workshop',
};

const WORKSHOP_PARTICIPATION: AdminWorkshopParticipation = {
    participantId: 'participant-1',
    workshopId: 'workshop-1',
    workshopKind: 'workshop',
    workshopTitle: 'Produkční kód s AI agenty',
    workshopStartsAt: '2026-08-20T17:00:00.000Z',
    workshopEndsAt: '2026-08-20T18:30:00.000Z',
    fullname: 'Jana Nováková',
    email: 'JANA+workshop@EXAMPLE.COM',
    connectedAt: '2026-08-20T16:55:00.000Z',
    lastSeenAt: '2026-08-20T18:25:00.000Z',
    activeDurationSeconds: 4_800,
    commentCount: 2,
    reactionCount: 5,
    linkClickCount: 1,
    upvoteCount: 3,
    isInteractionBanned: false,
    isTrusted: true,
};

const JOINED_CONTACT: AdminJoinedContact = {
    ...CONTACT_RECORD,
    contactGroup: {
        normalizedEmail: 'jana@example.com',
        contacts: [CONTACT_RECORD],
        workshopParticipations: [WORKSHOP_PARTICIPATION],
    },
};

describe('serializeAdminJoinedContactsAsBook', () => {
    it('writes one full Book-style context block with the contact history and workshop activity', () => {
        const book = serializeAdminJoinedContactsAsBook([JOINED_CONTACT], '2026-08-25');

        expect(book).toMatch(/^Contacts 2026-08-25\n\nNOTE These are the contacts exported from/);
        expect(book).toContain('CONTACT Jana Nováková');
        expect(book).toContain('Normalized email: jana@example.com');
        expect(book).toContain('Contact records:\nContact #12');
        expect(book).toContain('User note: Chci materiály.');
        expect(book).toContain('Our note: Ozvat se po workshopu.');
        expect(book).toContain('Workshop attendance:\nWorkshop: Produkční kód s AI agenty');
        expect(book).toContain('Participant email: JANA+workshop@EXAMPLE.COM');
        expect(book).toContain('Active duration seconds: 4800');
        expect(book).toContain('Comments: 2');
        expect(book).toContain('Reactions: 5');
        expect(book).toContain('Material link clicks: 1');
        expect(book).toContain('Comment upvotes: 3');
    });
});
