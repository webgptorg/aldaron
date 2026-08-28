import type { CalendarEvent } from '@/lib/calendar/create-calendar-links';
import type { EventDetails } from '@/lib/events/event';
import { createPublicEventLinkOrNull } from '@/lib/events/eventLinks';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition } from '@/lib/events/eventTypes';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import { getWorkshopCalendarEndsAt } from '@/lib/workshops/workshopCalendar';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * Details of a public term which remain useful after a calendar application has hidden the original page.
 */
function createPublicEventCalendarDescription(event: EventDetails): string {
    return [
        getEventTypeDefinition(event.type).label,
        formatEventFormat(event),
        formatEventPrice(event.priceCzk),
    ].join(' · ');
}

/**
 * Turns one publicly listed term into a privacy-safe calendar event.
 *
 * Note: The URL deliberately has no member-specific query parameters, so the exact same event can appear in a shared
 * subscription and in an individually downloaded file.
 */
export function createPublicEventCalendarEventOrNull(workshop: WorkshopSummary): CalendarEvent | null {
    const event = workshop.event;
    if (event === null) {
        return null;
    }

    const eventLink = createPublicEventLinkOrNull(workshop);
    if (eventLink === null) {
        return null;
    }

    return {
        id: workshop.slug,
        title: workshop.title,
        description: createPublicEventCalendarDescription(event),
        startsAt: workshop.startsAt,
        endsAt: getWorkshopCalendarEndsAt(workshop),
        url: createAbsoluteUrl(eventLink),
    };
}
