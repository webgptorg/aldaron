import { createCalendarSubscriptionLinks } from '@/lib/calendar/create-calendar-links';
import { classNames } from '@/lib/classNames';
import { CalendarPlus, Rss } from 'lucide-react';

const SUBSCRIBE_TO_CALENDAR_COPY = {
    googleCalendarLabel: 'Přidat do Google Kalendáře',
    webcalLabel: 'Jiná kalendářová aplikace',
} as const;

type SubscribeToCalendarLinksProps = {
    /**
     * Absolute url of the published calendar a visitor subscribes to
     */
    readonly calendarFeedUrl: string;
    readonly className?: string;
};

const SUBSCRIBE_TO_CALENDAR_LINK_CLASS_NAME =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';

/**
 * Puts a whole published calendar into the calendar application of a visitor, so that every term it will ever carry
 * arrives there on its own
 *
 * Note: A subscription is offered rather than a download of what is published right now, which is what keeps a moved
 *       or newly published term correct in the calendar of everybody who took it.
 */
export function SubscribeToCalendarLinks({ calendarFeedUrl, className }: SubscribeToCalendarLinksProps) {
    const { googleCalendarUrl, webcalUrl } = createCalendarSubscriptionLinks(calendarFeedUrl);

    return (
        <div className={classNames('flex flex-wrap items-center gap-2', className)}>
            <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(
                    SUBSCRIBE_TO_CALENDAR_LINK_CLASS_NAME,
                    'border-cyan-200/30 bg-cyan-300/10 text-cyan-100 hover:border-cyan-200/60 hover:bg-cyan-300/20 hover:text-white',
                )}
            >
                <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                {SUBSCRIBE_TO_CALENDAR_COPY.googleCalendarLabel}
            </a>
            <a
                href={webcalUrl}
                className={classNames(
                    SUBSCRIBE_TO_CALENDAR_LINK_CLASS_NAME,
                    'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white',
                )}
            >
                <Rss className="h-3.5 w-3.5" aria-hidden="true" />
                {SUBSCRIBE_TO_CALENDAR_COPY.webcalLabel}
            </a>
        </div>
    );
}
