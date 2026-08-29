/**
 * @vitest-environment jsdom
 */

import {
    AI_TA_KRAJTA_PROMPTBOOK_CODER_BADGE_LABEL,
    AI_TA_KRAJTA_PROMPTBOOK_CODER_URL,
} from '@/businesses/ai-ta-krajta/config';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AiTaKrajtaPromptbookCoderBadge } from './AiTaKrajtaPromptbookCoderBadge';

afterEach(cleanup);

describe('AI ta Krajta Promptbook coder badge', () => {
    it('credits Promptbook coder and opens its public page', () => {
        render(<AiTaKrajtaPromptbookCoderBadge />);

        const badge = screen.getByRole('link', { name: AI_TA_KRAJTA_PROMPTBOOK_CODER_BADGE_LABEL });

        expect(badge.getAttribute('href')).toBe(AI_TA_KRAJTA_PROMPTBOOK_CODER_URL);
        expect(badge.getAttribute('target')).toBe('_blank');
        expect(badge.getAttribute('rel')).toBe('noreferrer');
    });
});
