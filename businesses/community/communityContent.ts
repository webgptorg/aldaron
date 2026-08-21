import type { WorkshopConnectionDetails } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import type { WorkshopStageEmptyState } from '@/businesses/online-workshop/participant/WorkshopStage';
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

export const CZECH_COMMUNITY_EMPTY_STAGE: WorkshopStageEmptyState = {
    title: 'Na komunitním jevišti teď není živý stream',
    description: 'Až moderátor spustí YouTube stream, objeví se tady automaticky.',
};

export const CZECH_COMMUNITY_ROOM_COPY = {
    roomSubtitle: 'Komunita Promptbooku',
    materialsTitle: 'Materiály komunity',
    unavailableConnectionMessage: 'Připojení ke komunitě se nepodařilo ověřit.',
} as const;

export const CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY = {
    title: 'Workshopy Promptbooku',
    description: 'Vyberte si workshop. Odkaz vás vezme přímo do jeho místnosti se stejnými údaji.',
    emptyMessage: 'Zatím není publikovaný žádný workshop. Další termíny sem přidáme hned po zveřejnění.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
} as const;
