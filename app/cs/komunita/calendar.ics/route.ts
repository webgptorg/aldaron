import { COMMUNITY_CALENDAR_FILE_NAME, COMMUNITY_CALENDAR_NAME } from '@/businesses/community/config';
import { createIcalendarContent } from '@/lib/calendar/create-calendar-links';
import { createPublicEventCalendarEventOrNull } from '@/lib/events/eventCalendar';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';

export const dynamic = 'force-dynamic';

const COMMUNITY_CALENDAR_CONTENT_TYPE = 'text/calendar; charset=utf-8';

/**
 * Note: A subscribed calendar asks for this address again and again, and every one of those questions has to be
 *       answered with the terms which are published right now rather than with the ones which were published when the
 *       application was built.
 */
const COMMUNITY_CALENDAR_CACHE_CONTROL = 'no-store';

/**
 * Serves the very same published terms the community lists as one calendar to subscribe to
 *
 * Note: A term published, moved or withdrawn in the administration therefore reaches the calendar of every member who
 *       subscribed, without anybody deploying anything.
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
            'Content-Disposition': `inline; filename="${COMMUNITY_CALENDAR_FILE_NAME}"`,
            'Cache-Control': COMMUNITY_CALENDAR_CACHE_CONTROL,
        },
    });
}
