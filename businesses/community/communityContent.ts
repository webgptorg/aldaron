import { COMMUNITY_CALENDAR_PATH } from '@/businesses/community/config';
import type { WorkshopConnectionDetails } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';

/**
 * Keeps Czech community copy beside the Czech route. A future English route can provide its own factory without
 * duplicating the room mechanics or tying a translation to a database row.
 */
export function createCzechCommunityConnectionDetails(community: WorkshopDetails): WorkshopConnectionDetails {
    return {
        title: community.title,
        description: community.description,
        dateLabel: 'Kdykoli online',
        durationLabel: 'Stálý přístup',
        roomLabel: 'Komunita Promptbooku',
        connectionHeading: 'Připojit se do komunity',
        connectionDescription: 'Jméno se zobrazí u vašich komentářů. E-mail ostatní členové komunity neuvidí.',
        submitLabel: 'Vstoupit do komunity',
        language: 'cs',
    };
}

export const CZECH_COMMUNITY_ROOM_COPY = {
    roomSubtitle: 'Komunita Promptbooku',
    materialsTitle: 'Materiály komunity',
    unavailableConnectionMessage: 'Připojení ke komunitě se nepodařilo ověřit.',
} as const;

export const CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY = {
    title: 'Termíny akcí Promptbooku',
    description:
        'Vyberte si termín v kalendáři nebo v kartách. Odkaz vás vezme přímo do místnosti workshopu se stejnými údaji, u placených akcí na jejich stránku.',
    emptyMessage: 'Zatím není publikovaný žádný termín. Další sem přidáme hned po zveřejnění.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
    calendarFeedUrl: createAbsoluteUrl(COMMUNITY_CALENDAR_PATH),
} as const;
