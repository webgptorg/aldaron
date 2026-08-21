const CSV_FIELD_SEPARATOR = ',';
const CSV_LINE_SEPARATOR = '\r\n';

/**
 * Byte order mark which tells spreadsheet editors that the file is UTF-8, otherwise they mangle the diacritics.
 */
const UTF8_BYTE_ORDER_MARK = '\ufeff';

export type CsvColumn<Row> = {
    readonly header: string;
    readonly getValue: (row: Row) => string | number | boolean | null | undefined;
};

/**
 * Wraps every field in quotes, so commas, line breaks, and quotes within the source values remain valid CSV.
 */
function escapeCsvField(value: string | number | boolean | null | undefined): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/**
 * Serializes a stable set of columns as a spreadsheet-friendly UTF-8 CSV document.
 */
export function serializeRowsAsCsv<Row>(rows: readonly Row[], columns: readonly CsvColumn<Row>[]): string {
    const headerRow = columns.map((column) => escapeCsvField(column.header)).join(CSV_FIELD_SEPARATOR);
    const dataRows = rows.map((row) => columns.map((column) => escapeCsvField(column.getValue(row))).join(CSV_FIELD_SEPARATOR));

    return UTF8_BYTE_ORDER_MARK + [headerRow, ...dataRows].join(CSV_LINE_SEPARATOR) + CSV_LINE_SEPARATOR;
}
