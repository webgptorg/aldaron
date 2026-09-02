'use client';

import { CommunityPaidMembersNotice } from '@/businesses/community/membership/CommunityPaidMembersNotice';
import { useCommunityMembershipPurchaseOffer } from '@/businesses/community/membership/useCommunityMembershipPurchaseOffer';
import type { WorkshopPaidMembersVideo } from '@/lib/workshops/workshopTypes';
import { createYoutubeEmbedUrl } from '@/lib/youtube/youtubeEmbed';

const PAID_MEMBERS_VIDEO_TITLE = 'Záznam workshopu je pro placené členy';
const PAID_MEMBERS_VIDEO_DESCRIPTION =
    'Celý záznam tohoto workshopu si pustí členové komunity s placeným členstvím. Odemknete ho měsíčním placeným členstvím.';
const PAID_MEMBERS_VIDEO_PREVIEW_LABEL = 'Ukázka ze záznamu';

type WorkshopPaidMembersVideoNoticeProps = {
    readonly paidMembersOnlyVideo: WorkshopPaidMembersVideo;
};

/**
 * Where the recording of the ended workshop is, for the members who may not play it.
 *
 * Note: The recording itself never reaches this component. Only the teaser an administrator published for it does, so
 *       a member who has not unlocked the recording watches that snippet rather than the workshop, and a workshop
 *       without a published teaser says the same thing without one.
 */
export function WorkshopPaidMembersVideoNotice({ paidMembersOnlyVideo }: WorkshopPaidMembersVideoNoticeProps) {
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    if (membershipPurchaseOffer === null) {
        return null;
    }

    const { previewYoutubeVideoId } = paidMembersOnlyVideo;

    return (
        <CommunityPaidMembersNotice
            title={PAID_MEMBERS_VIDEO_TITLE}
            description={PAID_MEMBERS_VIDEO_DESCRIPTION}
            onUnlockPaidMembership={membershipPurchaseOffer.openMembershipModal}
            unlockedLabel={PAID_MEMBERS_VIDEO_PREVIEW_LABEL}
            unlockedContent={
                previewYoutubeVideoId === null ? undefined : (
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-amber-200/20 bg-slate-950">
                        <iframe
                            className="absolute inset-0 h-full w-full"
                            src={createYoutubeEmbedUrl(previewYoutubeVideoId, {
                                isAutoplayed: false,
                                isInlinePlayback: true,
                                isRelatedVideoEnabled: false,
                                isControlsVisible: true,
                                isJavaScriptApiEnabled: false,
                            })}
                            title={PAID_MEMBERS_VIDEO_PREVIEW_LABEL}
                            allow="encrypted-media; fullscreen; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                )
            }
        />
    );
}
