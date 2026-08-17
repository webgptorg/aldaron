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
 * Participant room opened from the reminder e-mail.
 */
export const ONLINE_WORKSHOP_PARTICIPANT_PATH = `${ONLINE_WORKSHOP_PATH}/participant`;

/**
 * Stable database identity of this occurrence. A future workshop page can reuse
 * the participant miniapp with a different slug and presentation copy.
 */
export const ONLINE_WORKSHOP_SLUG = 'online-workshop-2026-08-20';

export const onlineWorkshopConfig = {
    participant: {
        title: 'Produkční kód s AI agenty',
        description: 'Místnost pro účastníky workshopu s Pavolem Hejným a Jiřím Jahnem.',
    },
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
    workshopSlug: ONLINE_WORKSHOP_SLUG,
} as const;
