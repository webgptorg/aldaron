import type { CommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';

export const COMMUNITY_MEMBERSHIP_STATUS_LABELS: Readonly<Record<CommunityMembershipStatus, string>> = {
    none: 'Členství zdarma',
    pending: 'Čeká na platbu',
    active: 'Placené aktivní',
    'past-due': 'Platba po splatnosti',
    canceled: 'Placené zrušeno',
};

const COMMUNITY_MEMBERSHIP_STATUS_CLASS_NAMES: Readonly<Record<CommunityMembershipStatus, string>> = {
    none: 'bg-cyan-100 text-cyan-800',
    pending: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    'past-due': 'bg-rose-100 text-rose-800',
    canceled: 'bg-slate-100 text-slate-700',
};

export function getCommunityMembershipStatusClassName(status: CommunityMembershipStatus): string {
    return COMMUNITY_MEMBERSHIP_STATUS_CLASS_NAMES[status];
}
