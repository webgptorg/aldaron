import type { StructuredDataNode } from '@/lib/metadata/structured-data';

type StructuredDataProps = {
    /**
     * Schema.org nodes to embed into the page
     */
    readonly nodes: readonly StructuredDataNode[];
};

/**
 * Serializes a schema.org node, escaping the characters which would otherwise break out of the `<script>` element
 */
function serializeStructuredDataNode(node: StructuredDataNode): string {
    return JSON.stringify(node).replace(/</g, '\\u003c');
}

/**
 * Embeds schema.org structured data as JSON-LD, which is the format Google recommends
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
export function StructuredData({ nodes }: StructuredDataProps) {
    return (
        <>
            {nodes.map((node, nodeIndex) => (
                <script
                    key={`${node['@type']}-${nodeIndex}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeStructuredDataNode(node) }}
                />
            ))}
        </>
    );
}
