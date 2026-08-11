import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseClientMock, getUnauthorizedResponseOrNullMock } = vi.hoisted(() => ({
    createSupabaseClientMock: vi.fn(),
    getUnauthorizedResponseOrNullMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseClient: createSupabaseClientMock,
}));

import { DELETE, PATCH } from './route';

type ContactMutationDatabase = {
    readonly from: ReturnType<typeof vi.fn>;
    readonly update: ReturnType<typeof vi.fn>;
    readonly deleteContact: ReturnType<typeof vi.fn>;
    readonly equal: ReturnType<typeof vi.fn>;
    readonly limit: ReturnType<typeof vi.fn>;
    readonly select: ReturnType<typeof vi.fn>;
};

/**
 * Build a minimal Supabase mutation chain and keep every link observable for safety assertions
 */
function createContactMutationDatabase(contact: Readonly<Record<string, unknown>>): ContactMutationDatabase {
    const maybeSingle = vi.fn().mockResolvedValue({ data: contact, error: null });
    const select = vi.fn(() => ({ maybeSingle }));
    const limit = vi.fn(() => ({ select }));
    const equal = vi.fn(() => ({ limit }));
    const update = vi.fn(() => ({ eq: equal }));
    const deleteContact = vi.fn(() => ({ eq: equal }));
    const from = vi.fn(() => ({ update, delete: deleteContact }));

    return { from, update, deleteContact, equal, limit, select };
}

/**
 * Create an authorized-looking request. Authentication itself is mocked because these tests cover database scoping.
 */
function createContactRequest(method: 'PATCH' | 'DELETE', body: Readonly<Record<string, unknown>>): NextRequest {
    return new NextRequest('http://localhost/api/contacts?token=test-token', {
        method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('contact mutations', () => {
    beforeEach(() => {
        createSupabaseClientMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
    });

    it('updates just the requested contact with LIMIT 1', async () => {
        const database = createContactMutationDatabase({ id: 37, fullname: 'Updated name' });
        createSupabaseClientMock.mockReturnValue({ from: database.from });

        const response = await PATCH(createContactRequest('PATCH', { id: 37, fullname: 'Updated name' }));

        expect(response.status).toBe(200);
        expect(database.update).toHaveBeenCalledWith({ fullname: 'Updated name' });
        expect(database.equal).toHaveBeenCalledWith('id', 37);
        expect(database.limit).toHaveBeenCalledWith(1);
        expect(database.select).toHaveBeenCalledWith();
    });

    it('deletes just the requested contact with LIMIT 1', async () => {
        const database = createContactMutationDatabase({ id: 54 });
        createSupabaseClientMock.mockReturnValue({ from: database.from });

        const response = await DELETE(createContactRequest('DELETE', { id: 54 }));

        expect(response.status).toBe(200);
        expect(database.deleteContact).toHaveBeenCalledWith();
        expect(database.equal).toHaveBeenCalledWith('id', 54);
        expect(database.limit).toHaveBeenCalledWith(1);
        expect(database.select).toHaveBeenCalledWith('id');
    });
});
