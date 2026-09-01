import {
    AI_TA_KRAJTA_COLLABORATION_GUIDES,
    AI_TA_KRAJTA_MEDIA_KIT_STATISTICS,
    AI_TA_KRAJTA_PARTNERSHIP_OFFERS,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMediaKitContent';
import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_MEDIA_KIT_CONTACT_SECTION_ID,
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    DEFAULT_AI_TA_KRAJTA_COLLABORATION_KIND,
    createAiTaKrajtaMediaKitCollaborationPath,
    readAiTaKrajtaCollaborationKind,
} from '@/businesses/ai-ta-krajta/config';
import { describe, expect, it } from 'vitest';

const COLLABORATION_KINDS = AI_TA_KRAJTA_COLLABORATION_OPTIONS.map((option) => option.id);

describe('AI ta Krajta media kit content', () => {
    it('uses one valid inquiry kind in every media-kit link target', () => {
        const kindsUsedByTheMediaKit = [
            ...AI_TA_KRAJTA_PARTNERSHIP_OFFERS.map((offer) => offer.collaborationKind),
            ...AI_TA_KRAJTA_COLLABORATION_GUIDES.map((guide) => guide.collaborationKind),
        ];

        expect(kindsUsedByTheMediaKit.every((kind) => COLLABORATION_KINDS.includes(kind))).toBe(true);
    });

    it('builds a direct contact link with the requested kind of inquiry', () => {
        expect(createAiTaKrajtaMediaKitCollaborationPath('partnerstvi')).toBe(
            AI_TA_KRAJTA_MEDIA_KIT_PATH +
                '?collaboration=partnerstvi#' +
                AI_TA_KRAJTA_MEDIA_KIT_CONTACT_SECTION_ID,
        );
    });

    it('does not let a hand-written contact link choose an unsupported inquiry kind', () => {
        expect(readAiTaKrajtaCollaborationKind('neexistujici')).toBe(DEFAULT_AI_TA_KRAJTA_COLLABORATION_KIND);
        expect(readAiTaKrajtaCollaborationKind('tema')).toBe('tema');
    });

    it('keeps the handoff public proof block to its five approved statistics', () => {
        expect(AI_TA_KRAJTA_MEDIA_KIT_STATISTICS).toHaveLength(5);
    });
});
