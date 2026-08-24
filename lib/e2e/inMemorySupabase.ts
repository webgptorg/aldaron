import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A private test-server switch. It is deliberately not a NEXT_PUBLIC_ value,
 * so browsers can neither see nor enable the isolated store.
 */
export const E2E_IN_MEMORY_SUPABASE_ENVIRONMENT_VARIABLE = 'E2E_IN_MEMORY_SUPABASE';

type InMemoryRow = Record<string, unknown>;

type InMemoryQueryResult = {
    readonly data: readonly InMemoryRow[];
    readonly error: null;
    readonly count: null;
};

type InMemorySingleQueryResult = {
    readonly data: InMemoryRow | null;
    readonly error: null;
};

type InMemoryOrder = {
    readonly column: string;
    readonly ascending: boolean;
};

function compareInMemoryValues(left: unknown, right: unknown): number {
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }

    return String(left).localeCompare(String(right));
}

function areInMemoryRows(values: InMemoryRow | readonly InMemoryRow[]): values is readonly InMemoryRow[] {
    return Array.isArray(values);
}

class InMemoryTable {
    private readonly rows: InMemoryRow[] = [];
    private nextId = 1;

    public insert(values: InMemoryRow): InMemoryRow {
        const row = {
            ...values,
            id: values.id ?? this.nextId++,
            createdAt: values.createdAt ?? new Date().toISOString(),
        };

        this.rows.push(row);
        return row;
    }

    public getRows(): readonly InMemoryRow[] {
        return this.rows;
    }
}

/**
 * The small PostgREST-shaped query surface public pages exercise. Its Contact
 * rows persist for the lifetime of the E2E server, while every other table is
 * an empty, successful result so optional database-backed public content stays
 * optional just as it is without configured data.
 */
class InMemoryQuery {
    private readonly predicates: Array<(row: InMemoryRow) => boolean> = [];
    private readonly orders: InMemoryOrder[] = [];
    private rangeStart = 0;
    private rangeEnd: number | null = null;

    public constructor(
        private readonly table: InMemoryTable,
        private readonly selectedRows: readonly InMemoryRow[] | null = null,
    ) {}

    public select(_columns?: string): this {
        return this;
    }

    public eq(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] === value);
        return this;
    }

    public neq(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== value);
        return this;
    }

    public is(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] === value);
        return this;
    }

    public in(column: string, values: readonly unknown[]): this {
        this.predicates.push((row) => values.includes(row[column]));
        return this;
    }

    public gte(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) >= 0);
        return this;
    }

    public gt(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) > 0);
        return this;
    }

    public lte(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) <= 0);
        return this;
    }

    public lt(column: string, value: unknown): this {
        this.predicates.push((row) => row[column] !== undefined && compareInMemoryValues(row[column], value) < 0);
        return this;
    }

    public order(column: string, options: { readonly ascending?: boolean } = {}): this {
        this.orders.push({ column, ascending: options.ascending ?? true });
        return this;
    }

    public limit(count: number): this {
        this.rangeEnd = this.rangeStart + count - 1;
        return this;
    }

    public range(from: number, to: number): this {
        this.rangeStart = from;
        this.rangeEnd = to;
        return this;
    }

    public insert(values: InMemoryRow | readonly InMemoryRow[]): InMemoryMutation {
        const submittedRows: readonly InMemoryRow[] = areInMemoryRows(values) ? values : [values];
        const insertedRows = submittedRows.map((value) => this.table.insert(value));
        return new InMemoryMutation(this.table, insertedRows);
    }

    public update(values: InMemoryRow): InMemoryMutation {
        const updatedRows = this.getRows().map((row) => Object.assign(row, values));
        return new InMemoryMutation(this.table, updatedRows);
    }

    public delete(): InMemoryMutation {
        return new InMemoryMutation(this.table, this.getRows());
    }

    public async single(): Promise<InMemorySingleQueryResult> {
        return { data: this.getRows()[0] ?? null, error: null };
    }

    public async maybeSingle(): Promise<InMemorySingleQueryResult> {
        return { data: this.getRows()[0] ?? null, error: null };
    }

    public then<TResult1 = InMemoryQueryResult, TResult2 = never>(
        onfulfilled?: ((value: InMemoryQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return Promise.resolve(this.getResult()).then(onfulfilled, onrejected);
    }

    private getResult(): InMemoryQueryResult {
        return { data: this.getRows(), error: null, count: null };
    }

    private getRows(): readonly InMemoryRow[] {
        const rows = (this.selectedRows ?? this.table.getRows()).filter((row) =>
            this.predicates.every((predicate) => predicate(row)),
        );

        rows.sort((left, right) => {
            for (const { column, ascending } of this.orders) {
                if (left[column] === right[column]) {
                    continue;
                }

                const direction = ascending ? 1 : -1;
                return left[column]! < right[column]! ? -direction : direction;
            }

            return 0;
        });

        return rows.slice(this.rangeStart, this.rangeEnd === null ? undefined : this.rangeEnd + 1);
    }
}

class InMemoryMutation {
    public constructor(
        private readonly table: InMemoryTable,
        private readonly changedRows: readonly InMemoryRow[],
    ) {}

    public select(_columns?: string): InMemoryQuery {
        return new InMemoryQuery(this.table, this.changedRows);
    }
}

/**
 * Creates one isolated Supabase-compatible store for a test server. It keeps
 * the public server endpoints and validation real without requiring a private
 * Supabase credential on a developer machine.
 */
export function createInMemorySupabaseClient(): SupabaseClient {
    const tables = new Map<string, InMemoryTable>();

    const getTable = (tableName: string): InMemoryTable => {
        const existingTable = tables.get(tableName);
        if (existingTable !== undefined) {
            return existingTable;
        }

        const table = new InMemoryTable();
        tables.set(tableName, table);
        return table;
    };

    return {
        from: (tableName: string) => new InMemoryQuery(getTable(tableName)),
        rpc: async () => ({ data: [], error: null }),
    } as unknown as SupabaseClient;
}

let e2eInMemorySupabaseClient: SupabaseClient | null = null;

/**
 * Return the isolated client only for the Playwright-owned test server.
 */
export function getE2eInMemorySupabaseClientOrNull(): SupabaseClient | null {
    if (process.env[E2E_IN_MEMORY_SUPABASE_ENVIRONMENT_VARIABLE] !== 'true') {
        return null;
    }

    e2eInMemorySupabaseClient ??= createInMemorySupabaseClient();
    return e2eInMemorySupabaseClient;
}
