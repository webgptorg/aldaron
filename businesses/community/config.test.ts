import {
    COMMUNITY_CALENDAR_PATH,
    COMMUNITY_PATH,
    createCommunityCalendarSubscriptionUrl,
} from '@/businesses/community/config';
import { describe, expect, it } from 'vitest';

describe('community calendar configuration', () => {
    it('keeps the subscription feed directly below the stable community route', () => {
        expect(COMMUNITY_CALENDAR_PATH).toBe(COMMUNITY_PATH + '/calendar.ics');
        expect(createCommunityCalendarSubscriptionUrl()).toBe('webcal://ptbk.io/cs/komunita/calendar.ics');
    });
});
