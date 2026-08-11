import type { Contact, ContactColumnKey } from './Contact';
import { getContactColumnDefinition, type ContactColumnLinkKind } from './contactColumnDefinitions';

/**
 * Properties needed to render one contact value as a link
 */
export type ContactLink = {
    readonly href: string;
    readonly target?: '_blank';
    readonly rel?: string;
};

const WEB_URL_PROTOCOLS = new Set(['http:', 'https:']);
const EXTERNAL_LINK_TARGET = '_blank';
const EXTERNAL_LINK_RELATIONSHIP = 'noopener noreferrer';

/**
 * Build a link to a web page only when its protocol is safe to open from the dashboard
 */
function createWebUrlLink(urlValue: string): ContactLink | null {
    try {
        const url = new URL(urlValue);

        if (!WEB_URL_PROTOCOLS.has(url.protocol)) {
            return null;
        }

        return {
            href: url.toString(),
            target: EXTERNAL_LINK_TARGET,
            rel: EXTERNAL_LINK_RELATIONSHIP,
        };
    } catch {
        return null;
    }
}

/**
 * Build the appropriate link for one non-empty contact value
 */
function createContactLink(linkKind: ContactColumnLinkKind, linkValue: string): ContactLink | null {
    switch (linkKind) {
        case 'EMAIL':
            return { href: `mailto:${linkValue}` };
        case 'PHONE':
            return { href: `tel:${linkValue}` };
        case 'WEB_URL':
            return createWebUrlLink(linkValue);
    }
}

/**
 * Get the link behavior of one contact cell, or `null` when it is ordinary text
 */
export function getContactLink(contact: Contact, columnKey: ContactColumnKey): ContactLink | null {
    const { linkKind } = getContactColumnDefinition(columnKey);
    const contactValue = contact[columnKey];

    if (linkKind === undefined || typeof contactValue !== 'string') {
        return null;
    }

    const linkValue = contactValue.trim();

    if (linkValue === '') {
        return null;
    }

    return createContactLink(linkKind, linkValue);
}
