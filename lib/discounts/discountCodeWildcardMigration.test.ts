import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const DISCOUNT_CODE_WILDCARD_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0100-discount-code-wildcards.sql',
);
const DISCOUNT_CODE_WILDCARD_MIGRATION_SQL = readFileSync(DISCOUNT_CODE_WILDCARD_MIGRATION_PATH, 'utf8');

describe('discount-code wildcard migration', () => {
    it('allows terminal wildcards and shares their deterministic resolution with atomic consumption', () => {
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain("(?:_?[*])?$");
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain('CREATE OR REPLACE FUNCTION public.resolve_discount_code');
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain("right(discount.code, 1) = '*'");
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain('starts_with(');
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain('FROM public.resolve_discount_code(discount_code)');
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain('(discount.code = submitted_discount_code) DESC');
        expect(DISCOUNT_CODE_WILDCARD_MIGRATION_SQL).toContain('char_length(discount.code) DESC');
    });
});
