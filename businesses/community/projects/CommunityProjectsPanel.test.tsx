/**
 * @vitest-environment jsdom
 */

import { CommunityProjectsPanel } from '@/businesses/community/projects/CommunityProjectsPanel';
import { MOCK_COMMUNITY_PROJECTS } from '@/lib/community/communityProjectsMockData';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

const MEMBER_FULLNAME = 'Jana Sdílející';

function renderPanel() {
    render(<CommunityProjectsPanel memberFullname={MEMBER_FULLNAME} />);
}

function getProjectArticles(): readonly HTMLElement[] {
    return screen.getAllByRole('article');
}

describe('community projects panel', () => {
    it('shows every shared project, newest first', () => {
        renderPanel();

        const projectHeadings = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
        expect(projectHeadings).toHaveLength(MOCK_COMMUNITY_PROJECTS.length);
        expect(projectHeadings[0]).toBe('Generátor nabídek z e-mailu');
    });

    it('keeps only the projects of the chosen category', () => {
        renderPanel();

        fireEvent.click(screen.getByRole('button', { name: 'Obsah a tvorba' }));

        expect(getProjectArticles()).toHaveLength(1);
        expect(screen.getByRole('heading', { level: 3, name: 'Mikropříběhy z vývoje' })).not.toBeNull();
    });

    it('shares a project of this member and puts it at the top of the list', () => {
        renderPanel();

        fireEvent.click(screen.getByRole('button', { name: /^Sdílet projekt$/ }));
        fireEvent.change(screen.getByLabelText('Název projektu'), { target: { value: 'Můj nový nástroj' } });
        fireEvent.change(screen.getByLabelText('Odkaz na projekt'), {
            target: { value: 'https://example.com/nastroj' },
        });
        fireEvent.change(screen.getByLabelText('Co jste vytvořili'), {
            target: { value: 'Nástroj, který mi hlídá termíny v projektech.' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Publikovat projekt/ }));

        const firstProject = getProjectArticles()[0];
        expect(within(firstProject).getByRole('heading', { level: 3 }).textContent).toBe('Můj nový nástroj');
        expect(within(firstProject).getByText(new RegExp(MEMBER_FULLNAME))).not.toBeNull();
        expect(within(firstProject).getByText('Váš projekt')).not.toBeNull();
    });

    it('explains an unusable link instead of sharing the project', () => {
        renderPanel();

        fireEvent.click(screen.getByRole('button', { name: /^Sdílet projekt$/ }));
        fireEvent.change(screen.getByLabelText('Název projektu'), { target: { value: 'Nástroj bez odkazu' } });
        fireEvent.change(screen.getByLabelText('Co jste vytvořili'), {
            target: { value: 'Popis, který je dostatečně dlouhý.' },
        });
        fireEvent.change(screen.getByLabelText('Odkaz na projekt'), { target: { value: 'promptbook.studio' } });
        fireEvent.click(screen.getByRole('button', { name: /Publikovat projekt/ }));

        expect(screen.getByRole('alert').textContent).toContain('odkaz');
        expect(getProjectArticles()).toHaveLength(MOCK_COMMUNITY_PROJECTS.length);
    });

    it('likes and unlikes a project without counting the like twice', () => {
        renderPanel();

        const likeButton = screen.getByRole('button', { name: 'Líbí se mi projekt Mikropříběhy z vývoje' });
        expect(likeButton.textContent).toContain('21');

        fireEvent.click(likeButton);
        expect(likeButton.textContent).toContain('22');
        expect(likeButton.getAttribute('aria-pressed')).toBe('true');

        fireEvent.click(likeButton);
        expect(likeButton.textContent).toContain('21');
        expect(likeButton.getAttribute('aria-pressed')).toBe('false');
    });
});
