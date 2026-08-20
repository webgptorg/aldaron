/**
 * How a panel of the room looks once an admin switched it off but the room still shows it
 *
 * Note: A panel which stays readable only fades, so the room does not lose the content a participant is reading.
 *       A panel with nothing left to read is not rendered at all and therefore takes no space of the page.
 */
export const WORKSHOP_FADED_PANEL_CLASS_NAME = 'opacity-60 saturate-50 transition-opacity';
