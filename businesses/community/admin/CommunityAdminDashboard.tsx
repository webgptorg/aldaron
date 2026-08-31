'use client';

import { COMMUNITY_ADMIN_PATH, COMMUNITY_WORKSHOP_SLUG } from '@/businesses/community/config';
import { CommunityMembershipAdmin } from '@/businesses/community/membership/CommunityMembershipAdmin';
import { CommunityProjectModeration } from '@/businesses/community/projects/CommunityProjectModeration';
import { WorkshopAdminDashboard } from '@/businesses/workshop-admin/WorkshopAdminDashboard';
import { Crown } from 'lucide-react';

/**
 * Supplies the community-only concerns to the reusable room administration. The dashboard itself stays independent of
 * a payment business, while this client-side wrapper can safely pass its icon and section content as a local slot.
 */
export function CommunityAdminDashboard() {
    return (
        <>
            <WorkshopAdminDashboard
                initialWorkshopSlug={COMMUNITY_WORKSHOP_SLUG}
                workshopKind="community"
                subjectLabel="komunity"
                emptyStateMessage="Komunita zatím není vytvořená. Spusťte databázovou migraci pro komunitu."
                additionalSections={[
                    {
                        value: 'memberships',
                        label: 'Placená členství',
                        icon: Crown,
                        content: <CommunityMembershipAdmin />,
                    },
                ]}
            />
            <div className="mx-auto max-w-7xl px-6 pb-8">
                <CommunityProjectModeration />
            </div>
        </>
    );
}
