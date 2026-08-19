/**
 * @vitest-environment jsdom
 */

import { WorkshopWatchingBadge } from '@/businesses/online-workshop/participant/WorkshopWatchingBadge';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('workshop watching badge', () => {
    afterEach(() => {
        cleanup();
    });

    it('tells the participant how many people watch with them', () => {
        render(<WorkshopWatchingBadge watchingParticipantCount={3} />);

        expect(screen.getByText('Sledují 3 lidé')).not.toBeNull();
    });

    it('stays hidden when the audience could not be counted', () => {
        const { container } = render(<WorkshopWatchingBadge watchingParticipantCount={0} />);

        expect(container.textContent).toBe('');
    });
});
