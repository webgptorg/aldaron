import { describe, expect, it } from 'vitest';
import type { Contact } from './Contact';
import {
    DEFAULT_CONTACTS_VIEW_STATE,
    parseContactsViewState,
    serializeContactsViewState,
    type ContactsViewState,
} from './contactsViewState';
import { describeContactsExportScope } from './exportContacts';
import {
    DEFAULT_CONTACTS_FILTER,
    EMPTY_CONTACTS_FILTER,
    filterContacts,
    isContactsFilterActive,
} from './filterContacts';
import { getContactOriginGroups, normalizeContactOriginSelections } from './contactOrigins';
import {
    CONTACTS_PER_PAGE_OPTIONS,
    DEFAULT_CONTACTS_PER_PAGE,
    paginateContacts,
    parseContactsPerPage,
} from './paginateContacts';
import { getContactLink } from './contactLinks';
import { serializeContactsAsCsv } from './serializeContactsAsCsv';
import { serializeContactsAsVcard } from './serializeContactsAsVcard';
import { DEFAULT_CONTACTS_SORT_STATE, sortContacts, toggleContactsSortState } from './sortContacts';

/**
 * Build one contact where only the interesting values are filled in
 */
function buildContact(contactValues: Partial<Contact>): Contact {
    return {
        id: 1,
        createdAt: '2026-07-01T10:00:00.000Z',
        fullname: null,
        email: null,
        phone: null,
        userNote: null,
        isContacted: null,
        ourNote: null,
        userAgent: null,
        ipAddress: null,
        referrer: null,
        appName: null,
        placeName: null,
        url: null,
        ...contactValues,
    };
}

const NOVAK = buildContact({
    id: 1,
    fullname: 'Jan Novák',
    email: 'jan@example.com',
    createdAt: '2026-07-01T10:00:00.000Z',
    userNote: 'Chce "AI", hned;\nzavolat',
});

const CAPEK = buildContact({
    id: 2,
    fullname: 'Karel Čapek',
    phone: '+420123456789',
    isContacted: true,
    createdAt: '2026-07-15T10:00:00.000Z',
});

const ANONYMOUS = buildContact({ id: 3, createdAt: '2026-06-01T10:00:00.000Z' });

const ALL_CONTACTS = [NOVAK, CAPEK, ANONYMOUS];

/**
 * Contact gathered by a landing page, with everything the export has to deal with filled in
 *
 * Note: It is deliberately kept out of `ALL_CONTACTS`, it only serves the export tests
 */
const HEJNY = buildContact({
    id: 810,
    fullname: 'Pavol Hejný',
    email: 'me@pavolhejny.com',
    phone: '+420777777777',
    userNote: 'Online workshop registration Date: čtvrtek 20. 8. 2026 19:00',
    isContacted: true,
    ourNote: 'Zavolat po workshopu',
    appName: 'Landing page',
    placeName: 'OnlineWorkshopRegistration',
    url: 'https://ptbk.io/cs/online-workshop',
    createdAt: '2026-08-11T04:19:04.597Z',
});

/**
 * Read the value of one property of the first card, with the folded lines joined back together
 */
function readVcardPropertyValue(vcard: string, propertyName: string): string | null {
    const propertyLine = vcard
        .replace(/\r\n /g, '')
        .split('\r\n')
        .find((line) => line.startsWith(`${propertyName}:`));

    return propertyLine === undefined ? null : propertyLine.slice(propertyName.length + 1);
}

describe('filterContacts', () => {
    it('lets everything through with the empty filter', () => {
        expect(filterContacts(ALL_CONTACTS, EMPTY_CONTACTS_FILTER)).toHaveLength(3);
        expect(isContactsFilterActive(EMPTY_CONTACTS_FILTER)).toBe(false);
    });

    it('shows only the contacts which were not contacted yet by default', () => {
        expect(filterContacts(ALL_CONTACTS, DEFAULT_CONTACTS_FILTER).map((contact) => contact.id)).toEqual([1, 3]);
    });

    it('finds by fulltext across the columns even without the diacritics', () => {
        const foundContacts = filterContacts(ALL_CONTACTS, { ...EMPTY_CONTACTS_FILTER, searchQuery: 'capek' });
        expect(foundContacts.map((contact) => contact.id)).toEqual([2]);
    });

    it('requires every single word of the fulltext query', () => {
        expect(filterContacts(ALL_CONTACTS, { ...EMPTY_CONTACTS_FILTER, searchQuery: 'jan example' })).toHaveLength(1);
        expect(filterContacts(ALL_CONTACTS, { ...EMPTY_CONTACTS_FILTER, searchQuery: 'jan capek' })).toHaveLength(0);
    });

    it('filters by the presence of the email and of the phone', () => {
        expect(filterContacts(ALL_CONTACTS, { ...EMPTY_CONTACTS_FILTER, emailPresence: 'PRESENT' })).toHaveLength(1);
        expect(filterContacts(ALL_CONTACTS, { ...EMPTY_CONTACTS_FILTER, emailPresence: 'MISSING' })).toHaveLength(2);
        expect(filterContacts(ALL_CONTACTS, { ...EMPTY_CONTACTS_FILTER, phonePresence: 'PRESENT' })).toHaveLength(1);
    });

    it('filters by a date range which includes both of its bounds', () => {
        const contactsFromJuly = filterContacts(ALL_CONTACTS, {
            ...EMPTY_CONTACTS_FILTER,
            createdFromDate: '2026-07-01',
            createdToDate: '2026-07-15',
        });
        expect(contactsFromJuly.map((contact) => contact.id)).toEqual([1, 2]);
    });

    it('filters by a whole app name and by multiple place names below one app name', () => {
        const contactsWithOrigins = [
            buildContact({ id: 4, appName: 'Landing page', placeName: 'Online workshop' }),
            buildContact({ id: 5, appName: 'Landing page', placeName: 'Newsletter' }),
            buildContact({ id: 6, appName: 'Landing page', placeName: null }),
            buildContact({ id: 7, appName: 'Podcast', placeName: 'Online workshop' }),
        ];

        const contactsFromLandingPage = filterContacts(contactsWithOrigins, {
            ...EMPTY_CONTACTS_FILTER,
            contactOriginSelections: [{ appName: 'Landing page' }],
        });
        const contactsFromSelectedLandingPagePlaces = filterContacts(contactsWithOrigins, {
            ...EMPTY_CONTACTS_FILTER,
            contactOriginSelections: [
                { appName: 'Landing page', placeName: 'Newsletter' },
                { appName: 'Landing page', placeName: 'Online workshop' },
            ],
        });

        expect(contactsFromLandingPage.map((contact) => contact.id)).toEqual([4, 5, 6]);
        expect(contactsFromSelectedLandingPagePlaces.map((contact) => contact.id)).toEqual([4, 5]);
    });

    it('keeps place names scoped to their app name and can select multiple app names', () => {
        const contactsWithOrigins = [
            buildContact({ id: 4, appName: 'Landing page', placeName: 'Registration' }),
            buildContact({ id: 5, appName: 'Podcast', placeName: 'Registration' }),
            buildContact({ id: 6, appName: 'Podcast', placeName: 'Episode page' }),
        ];

        const contactsFromSelectedOrigins = filterContacts(contactsWithOrigins, {
            ...EMPTY_CONTACTS_FILTER,
            contactOriginSelections: [
                { appName: 'Landing page', placeName: 'Registration' },
                { appName: 'Podcast' },
            ],
        });

        expect(contactsFromSelectedOrigins.map((contact) => contact.id)).toEqual([4, 5, 6]);
    });

    it('keeps the contacts without an app name or place name selectable', () => {
        const contactsWithOrigins = [
            buildContact({ id: 4, appName: null, placeName: null }),
            buildContact({ id: 5, appName: 'Landing page', placeName: null }),
        ];

        const contactsWithoutOriginNames = filterContacts(contactsWithOrigins, {
            ...EMPTY_CONTACTS_FILTER,
            contactOriginSelections: [{ appName: null, placeName: null }],
        });

        expect(contactsWithoutOriginNames.map((contact) => contact.id)).toEqual([4]);
    });

    it('recognizes an origin selection as an active filter', () => {
        expect(
            isContactsFilterActive({
                ...EMPTY_CONTACTS_FILTER,
                contactOriginSelections: [{ appName: 'Landing page' }],
            }),
        ).toBe(true);
    });
});

describe('contact origins', () => {
    it('derives unique place names grouped below their app names', () => {
        const contactsWithOrigins = [
            buildContact({ appName: 'Podcast', placeName: 'Episode page' }),
            buildContact({ appName: 'Landing page', placeName: 'Newsletter' }),
            buildContact({ appName: 'Landing page', placeName: 'Newsletter' }),
            buildContact({ appName: 'Landing page', placeName: null }),
            buildContact({ appName: null, placeName: 'Imported' }),
        ];

        expect(getContactOriginGroups(contactsWithOrigins)).toEqual([
            { appName: 'Landing page', placeNames: ['Newsletter', null] },
            { appName: 'Podcast', placeNames: ['Episode page'] },
            { appName: null, placeNames: ['Imported'] },
        ]);
    });

    it('normalizes duplicate and overlapping selections before matching or sharing them', () => {
        expect(
            normalizeContactOriginSelections([
                { appName: ' Landing page ', placeName: 'Online workshop' },
                { appName: 'Landing page', placeName: 'Online workshop' },
                { appName: 'Landing page' },
            ]),
        ).toEqual([{ appName: 'Landing page' }]);
    });
});

describe('sortContacts', () => {
    it('sorts the newest contacts first by default', () => {
        expect(sortContacts(ALL_CONTACTS, DEFAULT_CONTACTS_SORT_STATE).map((contact) => contact.id)).toEqual([2, 1, 3]);
    });

    it('keeps the contacts with an empty value at the end in both directions', () => {
        const ascending = sortContacts(ALL_CONTACTS, { columnKey: 'fullname', direction: 'ASCENDING' });
        const descending = sortContacts(ALL_CONTACTS, { columnKey: 'fullname', direction: 'DESCENDING' });
        expect(ascending.map((contact) => contact.id)).toEqual([1, 2, 3]);
        expect(descending.map((contact) => contact.id)).toEqual([2, 1, 3]);
    });

    it('turns the direction around on the same column and starts fresh on another one', () => {
        expect(toggleContactsSortState(DEFAULT_CONTACTS_SORT_STATE, 'createdAt').direction).toBe('ASCENDING');
        expect(toggleContactsSortState(DEFAULT_CONTACTS_SORT_STATE, 'email')).toEqual({
            columnKey: 'email',
            direction: 'ASCENDING',
        });
    });

    it('never mutates the given contacts', () => {
        const originalContacts = [...ALL_CONTACTS];
        sortContacts(ALL_CONTACTS, { columnKey: 'email', direction: 'ASCENDING' });
        expect(ALL_CONTACTS).toEqual(originalContacts);
    });
});

describe('getContactLink', () => {
    it('links an email address and phone number with their matching browser protocols', () => {
        expect(getContactLink(NOVAK, 'email')).toEqual({ href: 'mailto:jan@example.com' });
        expect(getContactLink(CAPEK, 'phone')).toEqual({ href: 'tel:+420123456789' });
    });

    it('links both URL-valued columns in a new tab', () => {
        expect(getContactLink(HEJNY, 'url')).toEqual({
            href: 'https://ptbk.io/cs/online-workshop',
            target: '_blank',
            rel: 'noopener noreferrer',
        });
        expect(
            getContactLink(buildContact({ referrer: 'https://example.com/search?q=promptbook' }), 'referrer'),
        ).toEqual({
            href: 'https://example.com/search?q=promptbook',
            target: '_blank',
            rel: 'noopener noreferrer',
        });
    });

    it('keeps missing, ordinary, and unsafe URL values as plain text', () => {
        expect(getContactLink(ANONYMOUS, 'email')).toBeNull();
        expect(getContactLink(NOVAK, 'fullname')).toBeNull();
        expect(getContactLink(buildContact({ url: 'javascript:alert()' }), 'url')).toBeNull();
    });
});

describe('paginateContacts', () => {
    const PAGINATED_CONTACTS = Array.from({ length: 250 }, (_, index) => buildContact({ id: index + 1 }));

    it('offers every required page size and defaults to 100 contacts', () => {
        expect(CONTACTS_PER_PAGE_OPTIONS).toEqual([50, 100, 200, 500, 'ALL']);
        expect(DEFAULT_CONTACTS_PER_PAGE).toBe(100);
    });

    it('shows 100 contacts on the default page size', () => {
        const contactsPage = paginateContacts(PAGINATED_CONTACTS, 2, DEFAULT_CONTACTS_PER_PAGE);

        expect(contactsPage.pageContacts).toHaveLength(100);
        expect(contactsPage.pageContacts[0].id).toBe(101);
        expect(contactsPage.pageContacts.at(-1)?.id).toBe(200);
        expect(contactsPage).toMatchObject({
            currentPage: 2,
            totalPages: 3,
            totalContactsCount: 250,
            firstContactNumber: 101,
            lastContactNumber: 200,
        });
    });

    it('shows every contact on one page when all contacts are selected', () => {
        const contactsPage = paginateContacts(PAGINATED_CONTACTS, 2, 'ALL');

        expect(contactsPage.pageContacts).toEqual(PAGINATED_CONTACTS);
        expect(contactsPage).toMatchObject({
            currentPage: 1,
            totalPages: 1,
            firstContactNumber: 1,
            lastContactNumber: 250,
        });
    });

    it('keeps the table on its last available page after a filter removes contacts', () => {
        const contactsPage = paginateContacts(PAGINATED_CONTACTS.slice(0, 120), 5, 50);

        expect(contactsPage.pageContacts).toHaveLength(20);
        expect(contactsPage.pageContacts[0].id).toBe(101);
        expect(contactsPage).toMatchObject({
            currentPage: 3,
            totalPages: 3,
            firstContactNumber: 101,
            lastContactNumber: 120,
        });
    });

    it('understands the page size which the select or a link says', () => {
        expect(parseContactsPerPage('200')).toBe(200);
        expect(parseContactsPerPage('all')).toBe('ALL');
        expect(parseContactsPerPage('7')).toBeNull();
    });
});

describe('the shared link to one view of the contacts table', () => {
    /**
     * View which somebody narrowed down, sorted and paged through before sharing the link to it
     */
    const SHARED_VIEW_STATE: ContactsViewState = {
        filter: {
            ...EMPTY_CONTACTS_FILTER,
            searchQuery: 'novák praha',
            createdFromDate: '2026-07-01',
            emailPresence: 'PRESENT',
            contactOriginSelections: [
                { appName: 'Landing page', placeName: 'Online workshop' },
                { appName: 'Podcast' },
            ],
        },
        sortState: { columnKey: 'fullname', direction: 'ASCENDING' },
        contactsPerPage: 200,
        currentPage: 3,
    };

    it('carries no parameter at all for the view which the dashboard opens with', () => {
        expect(serializeContactsViewState(DEFAULT_CONTACTS_VIEW_STATE, new URLSearchParams()).toString()).toBe('');
        expect(parseContactsViewState(new URLSearchParams())).toEqual(DEFAULT_CONTACTS_VIEW_STATE);
    });

    it('opens exactly the same view which it was written from', () => {
        const searchParams = serializeContactsViewState(SHARED_VIEW_STATE, new URLSearchParams());

        expect(parseContactsViewState(searchParams)).toEqual(SHARED_VIEW_STATE);
    });

    it('keeps the parameters which do not describe the view, like the admin token', () => {
        const searchParams = serializeContactsViewState(SHARED_VIEW_STATE, new URLSearchParams('token=secret'));

        expect(searchParams.get('token')).toBe('secret');
        expect(searchParams.get('search')).toBe('novák praha');
        expect(searchParams.get('origins')).not.toBeNull();
    });

    it('drops the parameters of the values which went back to the default', () => {
        const searchParams = serializeContactsViewState(
            DEFAULT_CONTACTS_VIEW_STATE,
            new URLSearchParams('token=secret&page=3&perPage=200&sortBy=fullname'),
        );

        expect(searchParams.toString()).toBe('token=secret');
    });

    it('still opens when a value of the link makes no sense', () => {
        const viewState = parseContactsViewState(
            new URLSearchParams(
                'contacted=maybe&sortBy=salary&page=0&perPage=7&createdFrom=yesterday&origins=not-json',
            ),
        );

        expect(viewState).toEqual(DEFAULT_CONTACTS_VIEW_STATE);
    });

    it('understands a link written by hand, no matter the letter case', () => {
        const viewState = parseContactsViewState(
            new URLSearchParams('contacted=any&sortBy=email&sortDirection=descending&perPage=all'),
        );

        expect(viewState).toEqual({
            ...DEFAULT_CONTACTS_VIEW_STATE,
            filter: EMPTY_CONTACTS_FILTER,
            sortState: { columnKey: 'email', direction: 'DESCENDING' },
            contactsPerPage: 'ALL',
        });
    });

    it('shows the very same contacts as the view it was shared from', () => {
        const searchParams = serializeContactsViewState(
            { ...DEFAULT_CONTACTS_VIEW_STATE, filter: { ...EMPTY_CONTACTS_FILTER, searchQuery: 'capek' } },
            new URLSearchParams(),
        );
        const { filter, sortState, contactsPerPage, currentPage } = parseContactsViewState(searchParams);

        const contactsPage = paginateContacts(
            sortContacts(filterContacts(ALL_CONTACTS, filter), sortState),
            currentPage,
            contactsPerPage,
        );

        expect(contactsPage.pageContacts.map((contact) => contact.id)).toEqual([2]);
    });
});

describe('the scope of the export', () => {
    const GATHERED_CONTACTS = Array.from({ length: 250 }, (_, index) =>
        buildContact({ id: index + 1, email: index % 2 === 0 ? `contact-${index}@example.com` : null }),
    );

    /**
     * The current view of the dashboard, which is exactly what gets exported
     */
    const exportedContacts = sortContacts(
        filterContacts(GATHERED_CONTACTS, { ...EMPTY_CONTACTS_FILTER, emailPresence: 'PRESENT' }),
        DEFAULT_CONTACTS_SORT_STATE,
    );

    it('is every contact which matches the filter, not only the ones on the shown page', () => {
        const contactsPage = paginateContacts(exportedContacts, 1, DEFAULT_CONTACTS_PER_PAGE);

        expect(contactsPage.pageContacts).toHaveLength(100);
        expect(exportedContacts).toHaveLength(125);
    });

    it('says how much of the gathered contacts is being exported', () => {
        expect(describeContactsExportScope(exportedContacts.length, GATHERED_CONTACTS.length)).toBe(
            '125 of 250 contacts which match the filter, across all pages',
        );
    });

    it('says that everything is being exported when the filter narrows nothing down', () => {
        expect(describeContactsExportScope(GATHERED_CONTACTS.length, GATHERED_CONTACTS.length)).toBe(
            'all 250 contacts',
        );
    });

    it('keeps the wording readable when nothing was gathered at all', () => {
        expect(describeContactsExportScope(0, 0)).toBe('no contacts');
    });

    it('still names the whole amount when the filter matches nothing', () => {
        expect(describeContactsExportScope(0, 250)).toBe('0 of 250 contacts which match the filter, across all pages');
    });
});

describe('serializeContactsAsCsv', () => {
    const csv = serializeContactsAsCsv([NOVAK]);

    it('starts with the byte order mark and with the header of every column', () => {
        expect(csv.charCodeAt(0)).toBe(0xfeff);
        expect(csv.split('\r\n')[0]).toContain('"createdAt","fullname","email","phone","userNote","isContacted"');
    });

    it('escapes the quotes and keeps the newlines inside of a quoted field', () => {
        expect(csv).toContain('"Chce ""AI"", hned;\nzavolat"');
    });

    it('writes the date and the switch in a machine readable way', () => {
        expect(serializeContactsAsCsv([CAPEK])).toContain('"yes"');
        expect(csv).toMatch(/"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"/);
    });
});

describe('serializeContactsAsVcard', () => {
    it('writes one well formed card per contact', () => {
        const vcard = serializeContactsAsVcard(ALL_CONTACTS);
        expect(vcard.match(/^BEGIN:VCARD$/gm)).toHaveLength(3);
        expect(vcard.match(/^END:VCARD$/gm)).toHaveLength(3);
        expect(vcard).toContain('VERSION:3.0');
    });

    it('splits the full name into the given name and the family name', () => {
        expect(serializeContactsAsVcard([CAPEK])).toContain('N:Čapek;Karel;;;');
    });

    it('falls back to something readable when there is no name at all', () => {
        expect(serializeContactsAsVcard([ANONYMOUS])).toContain('FN:Contact #3');
    });

    it('escapes the characters which have a special meaning', () => {
        const vcard = serializeContactsAsVcard([NOVAK]);
        expect(vcard).toContain('hned\\;');
        expect(vcard).toContain('\\n');
    });

    it('folds every line to the length required by the specification', () => {
        const contactWithLongNote = buildContact({ id: 4, userNote: 'a'.repeat(500), fullname: 'Dlouhá Poznámka' });
        const vcard = serializeContactsAsVcard([contactWithLongNote]);

        for (const line of vcard.split('\r\n')) {
            expect(line.length).toBeLessThanOrEqual(75);
        }
    });

    it('writes the revision as an ISO timestamp', () => {
        expect(serializeContactsAsVcard([NOVAK])).toContain('REV:2026-07-01T10:00:00.000Z');
    });

    it('omits the properties which have no value', () => {
        expect(serializeContactsAsVcard([ANONYMOUS])).not.toContain('EMAIL');
    });

    it('says where the contact was gathered and then repeats the user note', () => {
        expect(readVcardPropertyValue(serializeContactsAsVcard([HEJNY]), 'NOTE')).toBe(
            'Promptbook contact from Landing page -> OnlineWorkshopRegistration\\n' +
                'Online workshop registration Date: čtvrtek 20. 8. 2026 19:00',
        );
    });

    it('leaves out the organization and the url, because they describe our landing page and not the contact', () => {
        const vcard = serializeContactsAsVcard([HEJNY]);

        expect(vcard).not.toContain('ORG:');
        expect(vcard).not.toContain('URL:');
        expect(vcard).not.toContain('https://ptbk.io/cs/online-workshop');
    });

    it('leaves out our own workflow, which is whether the contact was already contacted and our internal note', () => {
        const vcard = serializeContactsAsVcard([HEJNY]);

        expect(vcard).not.toContain('Is Contacted');
        expect(vcard).not.toContain('Zavolat po workshopu');
    });

    it('drops the separator of the origin when only the application is known', () => {
        const contactWithoutPlace = buildContact({ id: 5, appName: 'Landing page' });

        expect(readVcardPropertyValue(serializeContactsAsVcard([contactWithoutPlace]), 'NOTE')).toBe(
            'Promptbook contact from Landing page',
        );
    });

    it('still marks the card as ours when there is neither an application nor a place', () => {
        expect(readVcardPropertyValue(serializeContactsAsVcard([ANONYMOUS]), 'NOTE')).toBe('Promptbook contact');
    });
});
