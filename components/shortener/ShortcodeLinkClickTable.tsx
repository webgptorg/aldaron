import { formatShortcodeLinkDateTime } from '@/lib/shortener/formatShortcodeLinkDateTime';
import type { ShortcodeLinkClick } from '@/lib/shortener/shortcodeLink';
import { TableScrollArea } from '@/components/ui/table-scroll-area';

type ShortcodeLinkClickTableProps = {
    readonly shortcodeLinkClicks: readonly ShortcodeLinkClick[];
};

function getClickValue(value: string | null): string {
    return value === null || value.trim() === '' ? '—' : value;
}

/**
 * Shows every navigation of one short link. Long request headers remain readable through their title while the table
 * stays practical on a laptop and can scroll horizontally on a narrow screen.
 */
export function ShortcodeLinkClickTable({ shortcodeLinkClicks }: ShortcodeLinkClickTableProps) {
    return (
        <TableScrollArea horizontalScrollLabel="Scroll short-link click history horizontally">
            <table className="w-full min-w-[1250px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th data-table-pinned-column="true" className="px-6 py-3 font-semibold">
                            Short link opened at
                        </th>
                        <th className="px-6 py-3 font-semibold">Destination opened at</th>
                        <th className="px-6 py-3 font-semibold">IP address</th>
                        <th className="px-6 py-3 font-semibold">Referrer</th>
                        <th className="px-6 py-3 font-semibold">User agent</th>
                        <th className="px-6 py-3 font-semibold">Language</th>
                        <th className="px-6 py-3 font-semibold">Platform</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {shortcodeLinkClicks.map((shortcodeLinkClick) => (
                        <tr key={shortcodeLinkClick.id} className="align-top">
                            <td
                                data-table-pinned-column="true"
                                className="whitespace-nowrap px-6 py-4 text-slate-600"
                                title={shortcodeLinkClick.navigatedAt}
                            >
                                {formatShortcodeLinkDateTime(shortcodeLinkClick.navigatedAt)}
                            </td>
                            <td
                                className="whitespace-nowrap px-6 py-4 text-slate-600"
                                title={shortcodeLinkClick.clickedAt ?? undefined}
                            >
                                {formatShortcodeLinkDateTime(shortcodeLinkClick.clickedAt)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-slate-700">
                                {getClickValue(shortcodeLinkClick.ip)}
                            </td>
                            <td className="max-w-sm px-6 py-4 text-slate-600">
                                <span className="block truncate" title={shortcodeLinkClick.referer ?? undefined}>
                                    {getClickValue(shortcodeLinkClick.referer)}
                                </span>
                            </td>
                            <td className="max-w-lg px-6 py-4 text-slate-600">
                                <span className="block truncate" title={shortcodeLinkClick.userAgent ?? undefined}>
                                    {getClickValue(shortcodeLinkClick.userAgent)}
                                </span>
                            </td>
                            <td className="max-w-xs px-6 py-4 text-slate-600">
                                <span className="block truncate" title={shortcodeLinkClick.language ?? undefined}>
                                    {getClickValue(shortcodeLinkClick.language)}
                                </span>
                            </td>
                            <td className="max-w-xs px-6 py-4 text-slate-600">
                                <span className="block truncate" title={shortcodeLinkClick.platform ?? undefined}>
                                    {getClickValue(shortcodeLinkClick.platform)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableScrollArea>
    );
}
