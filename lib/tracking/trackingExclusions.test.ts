import { isThirdPartyTrackingAllowed, removeSensitiveTrackingParameters } from '@/lib/tracking/trackingExclusions';
import { describe, expect, it } from 'vitest';

describe('sensitive page tracking exclusions', () => {
    it('excludes admin and workshop participant pages', () => {
        expect(isThirdPartyTrackingAllowed('/admin')).toBe(false);
        expect(isThirdPartyTrackingAllowed('/admin/workshops')).toBe(false);
        expect(isThirdPartyTrackingAllowed('/cs/online-workshop/participant')).toBe(false);
        expect(isThirdPartyTrackingAllowed('/cs/online-workshop')).toBe(true);
    });

    it('removes bearer and identity parameters from recorded URLs', () => {
        const sanitizedUrl = removeSensitiveTrackingParameters(
            'https://promptbook.studio/admin?token=secret&email=jane%40example.com&view=workshops',
        );

        expect(sanitizedUrl).toBe('https://promptbook.studio/admin?view=workshops');
    });
});
