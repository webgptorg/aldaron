import type { StructuredDataNode } from '@/lib/metadata/structured-data';

/**
 * Serializes a schema.org node without allowing its data to escape a JSON-LD script element
 */
export function serializeStructuredDataNode(node: StructuredDataNode): string {
    return JSON.stringify(node).replace(/</g, '\\u003c');
}
