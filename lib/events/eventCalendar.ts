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
 * Separator between the things one term is described by
 */
const EVENT_CALENDAR_DESCRIPTION_SEPARATOR = ' · ';

/**
 * What a term is, as a calendar application repeats it long after the page it was subscribed from was closed
 *
 * Note: A term is described here by the very same three things a listed term is described by, so that a calendar
 *       entry and the list it came from say the same thing about it.
 */
function createEventCalendarDescription(event: EventDetails): string {
    return [getEventTypeDefinition(event.type).label, formatEventFormat(event), formatEventPrice(event.priceCzk)].join(
        EVENT_CALENDAR_DESCRIPTION_SEPARATOR,
    );
}

/**
 * Turns one publicly listed term into the event of a published calendar, or `null` for a room which is no term at all
 *
 * Note: The term is named by its own title and led to by its public destination, so the very same entry can be read by
 *       everybody who subscribed to the calendar without carrying anybody's e-mail or name.
 * Note: A term is identified by its slug, so a moved or renamed term is updated in a calendar which already knows it
 *       rather than being added to it a second time.
 */
export function createPublicEventCalendarEventOrNull(workshop: WorkshopSummary): CalendarEvent | null {
    const publicEventLink = createPublicEventLinkOrNull(workshop);

    if (workshop.event === null || publicEventLink === null) {
        return null;
    }

    return {
        id: workshop.slug,
        title: workshop.title,
        description: createEventCalendarDescription(workshop.event),
        startsAt: workshop.startsAt,
        endsAt: getWorkshopCalendarEndsAt(workshop),
        url: createAbsoluteUrl(publicEventLink),
    };
}
