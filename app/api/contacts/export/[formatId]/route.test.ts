import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock, getUnauthorizedResponseOrNullMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
    getUnauthorizedResponseOrNullMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));

// Note: Only the key with which the database is opened is mocked, so that the tests really go through the one place
//       which reaches the contacts and would notice if it stopped asking for the service role key.
vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { GET } from './route';

const NOVAK = {
    id: 1,
    fullname: 'Jan Novák',
    email: 'jan@example.com',
    isContacted: false,
    createdAt: '2026-07-01T10:00:00.000Z',
};

const CAPEK = {
    id: 2,
    fullname: 'Karel Čapek',
    phone: '+420123456789',
    isContacted: false,
    createdAt: '2026-07-15T10:00:00.000Z',
};

const ALREADY_ANSWERED = {
    id: 3,
    fullname: 'Božena Němcová',
    isContacted: true,
    createdAt: '2026-06-01T10:00:00.000Z',
};

/**
 * Let the database answer with the given contacts, in the order in which they are gathered
 */
function serveContacts(contacts: ReadonlyArray<Readonly<Record<string, unknown>>>): void {
    const order = vi.fn().mockResolvedValue({ data: contacts, error: null });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));

    createSupabaseServiceRoleClientMock.mockReturnValue({ from });
}

/**
 * Ask for one export exactly as the link which the dashboard opens in a new tab does
 */
function requestContactsExport(formatId: string, viewSearchParams = ''): Promise<Response> {
    const searchParams = `token=test-token${viewSearchParams === '' ? '' : `&${viewSearchParams}`}`;

    return GET(new NextRequest(`http://localhost/api/contacts/export/${formatId}?${searchParams}`), {
        params: Promise.resolve({ formatId }),
    });
}

describe('the export of the contacts served in a new tab', () => {
    beforeEach(() => {
        createSupabaseServiceRoleClientMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        serveContacts([CAPEK, NOVAK, ALREADY_ANSWERED]);
    });

    it('is refused without the admin token, which opens the dashboard itself', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(
            NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        );

        const response = await requestContactsExport('CSV');

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('serves the CSV file of the contacts which the link asks for', async () => {
        const response = await requestContactsExport('CSV', 'search=%C4%8Dapek&contacted=ANY');
        const exportedFile = await response.text();

        expect(response.status).toBe(200);
        expect(exportedFile).toContain('Karel Čapek');
        expect(exportedFile).not.toContain('Jan Novák');
    });

    it('serves the vCard file of the very same view', async () => {
        const response = await requestContactsExport('vcard', 'search=%C4%8Dapek&contacted=ANY');
        const exportedFile = await response.text();

        expect(response.status).toBe(200);
        expect(exportedFile).toContain('BEGIN:VCARD');
        expect(exportedFile).toContain('FN:Karel Čapek');
        expect(exportedFile).not.toContain('FN:Jan Novák');
    });

    it('sorts the exported contacts the way the link says', async () => {
        const response = await requestContactsExport('CSV', 'sortBy=fullname&sortDirection=ASCENDING');
        const exportedNames = (await response.text()).split('\r\n').slice(1, 3);

        expect(exportedNames[0]).toContain('Jan Novák');
        expect(exportedNames[1]).toContain('Karel Čapek');
    });

    // Note: A link without any parameter of the view is the default view of the dashboard, which are the leads nobody
    //       has answered yet
    it('leaves out the contacts which were already answered, exactly as the dashboard does by default', async () => {
        const exportedFile = await (await requestContactsExport('CSV')).text();

        expect(exportedFile).toContain('Jan Novák');
        expect(exportedFile).toContain('Karel Čapek');
        expect(exportedFile).not.toContain('Božena Němcová');
    });

    it('reads the contacts again on every request, so that reloading the tab is up to date', async () => {
        const firstExportedFile = await (await requestContactsExport('CSV')).text();
        expect(firstExportedFile).not.toContain('Alois Jirásek');

        serveContacts([{ ...NOVAK, id: 4, fullname: 'Alois Jirásek' }]);
        const secondExportedFile = await (await requestContactsExport('CSV')).text();

        expect(secondExportedFile).toContain('Alois Jirásek');
        expect(secondExportedFile).not.toContain('Karel Čapek');
    });

    it('is shown in the tab, kept out of every cache and saved under the name of its format', async () => {
        const response = await requestContactsExport('CSV');

        expect(response.headers.get('Content-Type')).toContain('text/plain');
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(response.headers.get('Content-Disposition')).toMatch(/^inline; filename="contacts-[\d-]+\.csv"$/);
    });

    it('says that there is no such export instead of serving an empty one', async () => {
        const response = await requestContactsExport('xlsx');

        expect(response.status).toBe(404);
    });

    it('says that the contacts cannot be reached without the service role key', async () => {
        createSupabaseServiceRoleClientMock.mockReturnValue(null);

        const response = await requestContactsExport('CSV');

        expect(response.status).toBe(503);
    });
});
