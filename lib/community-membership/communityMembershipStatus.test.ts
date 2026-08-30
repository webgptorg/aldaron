import { createCommunityMembershipStatusFromSubscription } from '@/lib/community-membership/communityMembershipStatus';
import { describe, expect, it } from 'vitest';

describe('community membership status', () => {
    it('counts a running and a trialing subscription as a paid membership', () => {
        expect(createCommunityMembershipStatusFromSubscription('active')).toBe('active');
        expect(createCommunityMembershipStatusFromSubscription('trialing')).toBe('active');
    });

    it('keeps a membership whose payment is being retried', () => {
        expect(createCommunityMembershipStatusFromSubscription('past_due')).toBe('past-due');
        expect(createCommunityMembershipStatusFromSubscription('unpaid')).toBe('past-due');
    });

    it('waits for a subscription whose first payment has not gone through yet', () => {
        expect(createCommunityMembershipStatusFromSubscription('incomplete')).toBe('pending');
    });

    it('ends a membership the gate has given up on, including a state it may add later', () => {
        expect(createCommunityMembershipStatusFromSubscription('canceled')).toBe('canceled');
        expect(createCommunityMembershipStatusFromSubscription('incomplete_expired')).toBe('canceled');
        expect(createCommunityMembershipStatusFromSubscription('paused')).toBe('canceled');
    });
});
