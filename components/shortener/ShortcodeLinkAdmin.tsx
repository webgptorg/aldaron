'use client';

import { ShortcodeLinkEditForm } from '@/components/shortener/ShortcodeLinkEditForm';
import { ShortcodeLinkTable } from '@/components/shortener/ShortcodeLinkTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UrlShortener } from '@/components/url-shortener';
import {
    createPublicShortcodeLinkUrl,
    type ShortcodeLink,
    type ShortcodeLinkValues,
} from '@/lib/shortener/shortcodeLink';
import {
    deleteAdminShortcodeLink,
    fetchAdminShortcodeLinks,
    updateAdminShortcodeLink,
} from '@/lib/shortener/shortcodeLinkAdminApiClient';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const SHORTCODE_LINK_LOADING_ERROR_MESSAGE = 'The short links could not be loaded';
const SHORTCODE_LINK_SAVING_ERROR_MESSAGE = 'The short link could not be saved';
const SHORTCODE_LINK_DELETION_ERROR_MESSAGE = 'The short link could not be deleted';

/**
 * Whether one short link answers to what an administrator is looking for.
 */
function isShortcodeLinkMatchingSearch(shortcodeLink: ShortcodeLink, normalizedSearchQuery: string): boolean {
    const searchedTexts = [shortcodeLink.shortcode, shortcodeLink.note ?? '', ...shortcodeLink.urls];

    return searchedTexts.some((searchedText) => searchedText.toLowerCase().includes(normalizedSearchQuery));
}

function filterShortcodeLinks(shortcodeLinks: readonly ShortcodeLink[], searchQuery: string): readonly ShortcodeLink[] {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    if (normalizedSearchQuery === '') {
        return shortcodeLinks;
    }

    return shortcodeLinks.filter((shortcodeLink) =>
        isShortcodeLinkMatchingSearch(shortcodeLink, normalizedSearchQuery),
    );
}

/**
 * Holds the list of every short link and the writes which change it, while the creation of a new link stays in the
 * shortener form and the editing of an existing one in its own form.
 */
export function ShortcodeLinkAdmin() {
    const [shortcodeLinks, setShortcodeLinks] = useState<readonly ShortcodeLink[]>([]);
    const [editedShortcodeLink, setEditedShortcodeLink] = useState<ShortcodeLink | null>(null);
    const [deletedShortcodeLinkId, setDeletedShortcodeLinkId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadShortcodeLinks = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            const loadedShortcodeLinks = await fetchAdminShortcodeLinks();
            setShortcodeLinks(loadedShortcodeLinks);
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : SHORTCODE_LINK_LOADING_ERROR_MESSAGE);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadShortcodeLinks();
    }, [loadShortcodeLinks]);

    const handleSave = async (values: ShortcodeLinkValues): Promise<boolean> => {
        if (editedShortcodeLink === null) {
            return false;
        }

        try {
            await updateAdminShortcodeLink(editedShortcodeLink.id, values);
            setEditedShortcodeLink(null);
            return loadShortcodeLinks();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : SHORTCODE_LINK_SAVING_ERROR_MESSAGE);
            return false;
        }
    };

    const handleDelete = async (shortcodeLink: ShortcodeLink) => {
        const isDeletionConfirmed = window.confirm(
            `Delete ${createPublicShortcodeLinkUrl(shortcodeLink.shortcode)} for good, together with the clicks measured on it?`,
        );
        if (!isDeletionConfirmed) {
            return;
        }

        setDeletedShortcodeLinkId(shortcodeLink.id);
        try {
            await deleteAdminShortcodeLink(shortcodeLink.id);
            if (editedShortcodeLink?.id === shortcodeLink.id) {
                setEditedShortcodeLink(null);
            }
            await loadShortcodeLinks();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : SHORTCODE_LINK_DELETION_ERROR_MESSAGE);
        } finally {
            setDeletedShortcodeLinkId(null);
        }
    };

    const shownShortcodeLinks = useMemo(
        () => filterShortcodeLinks(shortcodeLinks, searchQuery),
        [shortcodeLinks, searchQuery],
    );

    return (
        <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
            <UrlShortener onShortcodeLinkCreated={() => void loadShortcodeLinks()} />

            {editedShortcodeLink !== null && (
                <ShortcodeLinkEditForm
                    shortcodeLink={editedShortcodeLink}
                    onSave={handleSave}
                    onCancelEditing={() => setEditedShortcodeLink(null)}
                />
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">All shortened links</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {shownShortcodeLinks.length === shortcodeLinks.length
                                ? `${shortcodeLinks.length} links`
                                : `${shownShortcodeLinks.length} of ${shortcodeLinks.length} links`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search shortcode, URL or note"
                            className="w-64"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void loadShortcodeLinks()}
                            disabled={isLoading}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {errorMessage !== null && (
                    <p className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading the short links…
                    </div>
                ) : shownShortcodeLinks.length === 0 ? (
                    <p className="px-6 py-16 text-center text-sm text-slate-500">
                        {shortcodeLinks.length === 0
                            ? 'There is no shortened link yet.'
                            : 'No shortened link matches the search.'}
                    </p>
                ) : (
                    <ShortcodeLinkTable
                        shortcodeLinks={shownShortcodeLinks}
                        editedShortcodeLinkId={editedShortcodeLink?.id ?? null}
                        deletedShortcodeLinkId={deletedShortcodeLinkId}
                        onEdit={setEditedShortcodeLink}
                        onDelete={(shortcodeLink) => void handleDelete(shortcodeLink)}
                    />
                )}
            </section>
        </div>
    );
}
