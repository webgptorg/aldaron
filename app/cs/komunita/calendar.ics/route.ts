import {
    COMMUNITY_CALENDAR_FILE_NAME,
    COMMUNITY_CALENDAR_NAME,
} from '@/businesses/community/config';
import { createIcalendarContent } from '@/lib/calendar/create-calendar-links';
import { createPublicEventCalendarEventOrNull } from '@/lib/events/eventCalendar';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';

export const dynamic = 'force-dynamic';

const COMMUNITY_CALENDAR_CONTENT_TYPE = 'text/calendar; charset=utf-8';
const COMMUNITY_CALENDAR_CACHE_CONTROL = 'no-store';

/**
 * Serves the published event terms which the community lists as one live iCalendar feed.
 *
 * Note: Both a calendar subscription and a fresh download read the current terms at request time, so a newly
 * published, moved, or withdrawn term needs no deployment.
 */
export async function GET(): Promise<Response> {
    const workshops = await loadPublishedWorkshopSummaries();
    const calendarEvents = workshops.flatMap((workshop) => {
        const calendarEvent = createPublicEventCalendarEventOrNull(workshop);
        return calendarEvent === null ? [] : [calendarEvent];
    });

    return new Response(createIcalendarContent(calendarEvents, COMMUNITY_CALENDAR_NAME), {
        headers: {
            'Content-Type': COMMUNITY_CALENDAR_CONTENT_TYPE,
            'Content-Disposition': 'inline; filename="' + COMMUNITY_CALENDAR_FILE_NAME + '"',
            'Cache-Control': COMMUNITY_CALENDAR_CACHE_CONTROL,
        },
    });
}
