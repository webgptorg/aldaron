import { NextRequest } from 'next/server';
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

import { DELETE, PATCH } from './route';

type ContactMutationDatabase = {
    readonly from: ReturnType<typeof vi.fn>;
    readonly update: ReturnType<typeof vi.fn>;
    readonly deleteContact: ReturnType<typeof vi.fn>;
    readonly equal: ReturnType<typeof vi.fn>;
    readonly order: ReturnType<typeof vi.fn>;
    readonly limit: ReturnType<typeof vi.fn>;
    readonly select: ReturnType<typeof vi.fn>;
};

/**
 * Build a minimal Supabase mutation chain and keep every link observable for safety assertions
 *
 * Note: The chain follows what PostgREST accepts, a `limit` is only reachable through an explicit `order`
 */
function createContactMutationDatabase(contact: Readonly<Record<string, unknown>>): ContactMutationDatabase {
    const maybeSingle = vi.fn().mockResolvedValue({ data: contact, error: null });
    const select = vi.fn(() => ({ maybeSingle }));
    const limit = vi.fn(() => ({ select }));
    const order = vi.fn(() => ({ limit }));
    const equal = vi.fn(() => ({ order }));
    const update = vi.fn(() => ({ eq: equal }));
    const deleteContact = vi.fn(() => ({ eq: equal }));
    const from = vi.fn(() => ({ update, delete: deleteContact }));

    return { from, update, deleteContact, equal, order, limit, select };
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

/**
 * Both mutations which are scoped down to exactly one contact, so that the scoping is checked for each of them
 */
const ONE_CONTACT_MUTATIONS: readonly {
    readonly name: string;
    readonly method: 'PATCH' | 'DELETE';
    readonly route: (request: NextRequest) => Promise<Response>;
    readonly body: Readonly<Record<string, unknown>>;
}[] = [
    { name: 'updating', method: 'PATCH', route: PATCH, body: { id: 37, ourNote: 'Called them' } },
    { name: 'deleting', method: 'DELETE', route: DELETE, body: { id: 37 } },
];

describe('contact mutations', () => {
    beforeEach(() => {
        createSupabaseServiceRoleClientMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
    });

    it('updates just the requested contact with LIMIT 1', async () => {
        const database = createContactMutationDatabase({ id: 37, fullname: 'Updated name' });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await PATCH(createContactRequest('PATCH', { id: 37, fullname: 'Updated name' }));

        expect(response.status).toBe(200);
        expect(database.update).toHaveBeenCalledWith({ fullname: 'Updated name' });
        expect(database.equal).toHaveBeenCalledWith('id', 37);
        expect(database.limit).toHaveBeenCalledWith(1);
        expect(database.select).toHaveBeenCalledWith();
    });

    it('changes both the note of the user and our own note in one update', async () => {
        const database = createContactMutationDatabase({ id: 37 });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await PATCH(
            createContactRequest('PATCH', { id: 37, userNote: 'Wants a demo', ourNote: 'Call after the workshop' }),
        );

        expect(response.status).toBe(200);
        expect(database.update).toHaveBeenCalledWith({ userNote: 'Wants a demo', ourNote: 'Call after the workshop' });
    });

    it('deletes just the requested contact with LIMIT 1', async () => {
        const database = createContactMutationDatabase({ id: 54 });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await DELETE(createContactRequest('DELETE', { id: 54 }));

        expect(response.status).toBe(200);
        expect(database.deleteContact).toHaveBeenCalledWith();
        expect(database.equal).toHaveBeenCalledWith('id', 54);
        expect(database.limit).toHaveBeenCalledWith(1);
        expect(database.select).toHaveBeenCalledWith('id');
    });

    // Note: Without the explicit order PostgREST refuses the mutation with "A 'limit' was applied without an explicit
    //       'order'", which used to break the editing of a contact
    for (const mutation of ONE_CONTACT_MUTATIONS) {
        it(`orders by the unique id when ${mutation.name}, because the limit needs an explicit order`, async () => {
            const database = createContactMutationDatabase({ id: 37 });
            createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

            const response = await mutation.route(createContactRequest(mutation.method, mutation.body));

            expect(response.status).toBe(200);
            expect(database.order).toHaveBeenCalledWith('id');
        });
    }

    // Note: Row level security keeps the contacts closed for the public key of the database, so a mutation which is
    //       not carried by the service role key must not even be attempted
    for (const mutation of ONE_CONTACT_MUTATIONS) {
        it(`says that the contacts cannot be reached when ${mutation.name} without the service role key`, async () => {
            createSupabaseServiceRoleClientMock.mockReturnValue(null);

            const response = await mutation.route(createContactRequest(mutation.method, mutation.body));

            expect(response.status).toBe(503);
        });

        it(`reads the contacts out of the "Contact" table when ${mutation.name}`, async () => {
            const database = createContactMutationDatabase({ id: 37 });
            createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

            await mutation.route(createContactRequest(mutation.method, mutation.body));

            expect(database.from).toHaveBeenCalledWith('Contact');
        });
    }
});
