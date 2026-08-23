'use client';

import { CopyTextButton } from '@/components/shortener/CopyTextButton';
import { Button } from '@/components/ui/button';
import { createPublicShortcodeLinkUrl, type ShortcodeLink } from '@/lib/shortener/shortcodeLink';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' });

function formatShortcodeLinkDateTime(timestamp: string): string {
    return CZECH_DATE_TIME_FORMAT.format(new Date(timestamp));
}

type ShortcodeLinkTableProps = {
    readonly shortcodeLinks: readonly ShortcodeLink[];
    readonly editedShortcodeLinkId: number | null;
    readonly deletedShortcodeLinkId: number | null;
    readonly onEdit: (shortcodeLink: ShortcodeLink) => void;
    readonly onDelete: (shortcodeLink: ShortcodeLink) => void;
};

/**
 * Shows every short link there is, together with what each one leads to and the two actions which change it.
 */
export function ShortcodeLinkTable({
    shortcodeLinks,
    editedShortcodeLinkId,
    deletedShortcodeLinkId,
    onEdit,
    onDelete,
}: ShortcodeLinkTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-6 py-3 font-semibold">Short link</th>
                        <th className="px-6 py-3 font-semibold">Destinations</th>
                        <th className="px-6 py-3 font-semibold">Note</th>
                        <th className="px-6 py-3 font-semibold">Landing page</th>
                        <th className="px-6 py-3 font-semibold">Created</th>
                        <th className="px-6 py-3 text-right font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {shortcodeLinks.map((shortcodeLink) => {
                        const publicUrl = createPublicShortcodeLinkUrl(shortcodeLink.shortcode);
                        const isDeleted = deletedShortcodeLinkId === shortcodeLink.id;
                        const isEdited = editedShortcodeLinkId === shortcodeLink.id;

                        return (
                            <tr key={shortcodeLink.id} className={isEdited ? 'bg-cyan-50/60 align-top' : 'align-top'}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={publicUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono font-semibold text-cyan-700 hover:underline"
                                        >
                                            {shortcodeLink.shortcode}
                                        </a>
                                        <CopyTextButton text={publicUrl} label={`Copy ${publicUrl}`} />
                                    </div>
                                </td>
                                <td className="max-w-sm px-6 py-4">
                                    <ul className="space-y-1">
                                        {shortcodeLink.urls.map((url, index) => (
                                            <li key={index} className="truncate">
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title={url}
                                                    className="text-slate-600 hover:text-cyan-700 hover:underline"
                                                >
                                                    {url}
                                                </a>
                                            </li>
                                        ))}
                                        {shortcodeLink.urls.length === 0 && (
                                            <li className="text-rose-600">No destination</li>
                                        )}
                                    </ul>
                                </td>
                                <td className="max-w-xs px-6 py-4 text-slate-600">
                                    <span className="line-clamp-3" title={shortcodeLink.note ?? undefined}>
                                        {shortcodeLink.note ?? '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {shortcodeLink.landingPage === null ? (
                                        <span className="text-slate-400">Redirect</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            Landing page
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                    {formatShortcodeLinkDateTime(shortcodeLink.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={publicUrl} target="_blank" rel="noreferrer" aria-label="Open">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isDeleted}
                                            onClick={() => onEdit(shortcodeLink)}
                                        >
                                            <Pencil className="mr-1.5 h-4 w-4" /> Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            disabled={isDeleted}
                                            onClick={() => onDelete(shortcodeLink)}
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                            {isDeleted ? 'Deleting…' : 'Delete'}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
