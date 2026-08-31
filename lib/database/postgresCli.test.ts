import { describe, expect, it } from 'vitest';
import { createPostgresCommandRunner } from '@/lib/database/postgresCli';

describe('createPostgresCommandRunner', () => {
    it('streams standard output to the supplied handler', async () => {
        const outputChunks: Buffer[] = [];
        const runner = createPostgresCommandRunner({ operation: 'inspect a database backup', tool: 'pg_restore' });

        await runner(
            process.execPath,
            ['--eval', 'process.stdout.write("database backup data")'],
            (standardOutputChunk) => outputChunks.push(standardOutputChunk),
        );

        expect(Buffer.concat(outputChunks).toString()).toBe('database backup data');
    });
});
