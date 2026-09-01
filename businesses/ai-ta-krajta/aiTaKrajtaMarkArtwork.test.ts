import {
    AI_TA_KRAJTA_MARK_BODY_SHAPE_IDS,
    AI_TA_KRAJTA_MARK_HEAD_AND_NECK_SHAPE_IDS,
    AI_TA_KRAJTA_MARK_SHAPES,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { describe, expect, it } from 'vitest';

describe('AI ta Krajta mark artwork', () => {
    it('keeps every canonical shape in exactly one uncoiling layer', () => {
        const uncoilingShapeIds = [...AI_TA_KRAJTA_MARK_BODY_SHAPE_IDS, ...AI_TA_KRAJTA_MARK_HEAD_AND_NECK_SHAPE_IDS];
        const canonicalShapeIds = AI_TA_KRAJTA_MARK_SHAPES.map((shape) => shape.id);

        expect(new Set(uncoilingShapeIds)).toHaveLength(uncoilingShapeIds.length);
        expect([...uncoilingShapeIds].sort()).toEqual([...canonicalShapeIds].sort());
    });
});
