import { createInMemorySupabaseClient } from '@/lib/e2e/inMemorySupabase';
import { describe, expect, it } from 'vitest';

describe('the isolated E2E Supabase store', () => {
    it('persists inserted contact rows and returns the matching rows to a later query', async () => {
        const supabase = createInMemorySupabaseClient();

        const insertedContact = await supabase
            .from('Contact')
            .insert({ email: 'e2e@example.com', placeName: 'newsletter', userNote: 'Keep me posted.' })
            .select()
            .single();
        const matchingContacts = await supabase.from('Contact').select('userNote').eq('placeName', 'newsletter');

        expect(insertedContact.error).toBeNull();
        expect(insertedContact.data).toMatchObject({ email: 'e2e@example.com', placeName: 'newsletter' });
        expect(matchingContacts).toMatchObject({
            data: [expect.objectContaining({ email: 'e2e@example.com', userNote: 'Keep me posted.' })],
            error: null,
        });
    });
});
