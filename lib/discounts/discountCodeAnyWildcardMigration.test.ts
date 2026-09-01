import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0110-discount-code-any-wildcards.sql',
);
const DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_SQL = readFileSync(DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_PATH, 'utf8');

describe('discount-code any-wildcard migration', () => {
    it('widens wildcard syntax and resolves each rule through one anchored glob matcher', () => {
        expect(DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_SQL).toContain("code ~ '^[A-Z0-9*]+(?:_[A-Z0-9*]+)*$'");
        expect(DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_SQL).toContain("position('*' IN discount.code) > 0");
        expect(DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_SQL).toContain(
            "submitted_discount_code ~ ('^' || replace(discount.code, '*', '.*') || '$')",
        );
        expect(DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_SQL).toContain(
            "char_length(replace(discount.code, '*', '')) DESC",
        );
        expect(DISCOUNT_CODE_ANY_WILDCARD_MIGRATION_SQL).toContain('CREATE OR REPLACE FUNCTION public.resolve_discount_code');
    });
});
