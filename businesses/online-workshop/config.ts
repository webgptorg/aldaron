import type { WorkshopSettings } from '@/lib/workshop/workshopTypes';

/**
 * Site-relative path of the online workshop landing page
 */
export const ONLINE_WORKSHOP_PATH = '/cs/online-workshop';

/**
 * Site-relative path of the page confirming a finished registration
 *
 * Note: The registration form navigates here with a full page load on purpose. Only a real page load runs the Meta
 *       Pixel snippet again, which fires a fresh `PageView` for this very url - a client side route change would not,
 *       so a conversion defined by this url would never be reported.
 */
export const ONLINE_WORKSHOP_THANK_YOU_PATH = `${ONLINE_WORKSHOP_PATH}/dekujeme`;

/**
 * Site-relative path of the page a registered participant spends the workshop on
 */
export const ONLINE_WORKSHOP_PARTICIPANT_PATH = `${ONLINE_WORKSHOP_PATH}/participant`;

/**
 * Identifier under which everything about this workshop is stored in the database
 *
 * Note: Every row of the workshop tables carries it, so a second workshop can live in the very same tables without
 *       ever meeting the content, the chat or the reactions of this one.
 */
export const ONLINE_WORKSHOP_ID = 'cs-online-workshop';

export const onlineWorkshopConfig = {
    date: {
        weekdayLabel: 'čtvrtek',
        dateLabel: '20. 8. 2026',
        time: '19:00',
        durationLabel: '60 minut + Q&A',

        // Note: Machine readable counterpart of the labels above, used to build the calendar links of the thank you
        //       page. The offset is the Prague summer time, so it has to be revisited together with the labels.
        startsAt: '2026-08-20T19:00:00+02:00',
        endsAt: '2026-08-20T20:30:00+02:00',
    },
    registrationPlaceName: 'OnlineWorkshopRegistration',
} as const;

/**
 * Settings the participant page runs on until the administration saves its own
 *
 * Note: They repeat nothing - the moment of the start is the very same one the landing page and the calendar links
 *       are built from.
 */
export const ONLINE_WORKSHOP_DEFAULT_SETTINGS: WorkshopSettings = {
    workshopId: ONLINE_WORKSHOP_ID,
    title: 'Jak s AI agenty psát produkční kód',
    startsAt: new Date(onlineWorkshopConfig.date.startsAt).toISOString(),
    youtubeVideoId: null,
    isStreamLive: false,
    streamNote: null,
    isChatEnabled: true,
};
