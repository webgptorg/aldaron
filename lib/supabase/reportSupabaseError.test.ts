import { reportSupabaseError } from '@/lib/supabase/reportSupabaseError';
import { afterEach, describe, expect, it, vi } from 'vitest';

const AMBIGUOUS_COLUMN_ERROR = {
    message: 'column reference "fullname" is ambiguous',
    code: '42702',
    details: 'It could refer to either a PL/pgSQL variable or a table column.',
    hint: null,
};

function readReport(consoleErrorSpy: ReturnType<typeof vi.spyOn>): string {
    return String(consoleErrorSpy.mock.calls[0]?.[0] ?? '');
}

function spyOnConsoleError() {
    return vi.spyOn(console, 'error').mockImplementation(() => undefined);
}

describe('reportSupabaseError', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('answers with the very message which the endpoint reports to whoever asked', () => {
        spyOnConsoleError();

        expect(reportSupabaseError('`get_workshop_admin_participant_page`', AMBIGUOUS_COLUMN_ERROR)).toBe(
            AMBIGUOUS_COLUMN_ERROR.message,
        );
    });

    it('names the refused query and everything the database said about it', () => {
        const consoleErrorSpy = spyOnConsoleError();

        reportSupabaseError('`get_workshop_admin_participant_page`', AMBIGUOUS_COLUMN_ERROR);

        const report = readReport(consoleErrorSpy);
        expect(report).toContain('`get_workshop_admin_participant_page`');
        expect(report).toContain(AMBIGUOUS_COLUMN_ERROR.message);
        expect(report).toContain(AMBIGUOUS_COLUMN_ERROR.code);
        expect(report).toContain(AMBIGUOUS_COLUMN_ERROR.details);
    });

    it('says that a database which does not know this schema has to be migrated', () => {
        const consoleErrorSpy = spyOnConsoleError();

        reportSupabaseError('`get_workshop_admin_participant_page`', AMBIGUOUS_COLUMN_ERROR);

        expect(readReport(consoleErrorSpy)).toContain('migrations/*.sql');
    });

    it('leaves a refusal which no migration mends without that advice', () => {
        const consoleErrorSpy = spyOnConsoleError();

        reportSupabaseError('the gathered contacts', { message: 'Database unavailable', code: '08006' });

        const report = readReport(consoleErrorSpy);
        expect(report).toContain('Database unavailable');
        expect(report).not.toContain('migrations/*.sql');
    });

    it('shows the arguments of the refused query to a developer', () => {
        vi.stubEnv('NODE_ENV', 'development');
        const consoleErrorSpy = spyOnConsoleError();

        reportSupabaseError('`get_workshop_admin_participant_page`', AMBIGUOUS_COLUMN_ERROR, {
            target_sort_by: 'connectedAt',
            target_search_query: 'Jana Nováková',
        });

        const report = readReport(consoleErrorSpy);
        expect(report).toContain('connectedAt');
        expect(report).toContain('Jana Nováková');
    });

    it('keeps what a person searched for out of the log of a production server', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const consoleErrorSpy = spyOnConsoleError();

        reportSupabaseError('`get_workshop_admin_participant_page`', AMBIGUOUS_COLUMN_ERROR, {
            target_search_query: 'Jana Nováková',
        });

        const report = readReport(consoleErrorSpy);
        expect(report).toContain(AMBIGUOUS_COLUMN_ERROR.message);
        expect(report).not.toContain('Jana Nováková');
    });
});
