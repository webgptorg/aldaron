'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import type { ContactsExportFormat } from '@/lib/contacts/contactsExportFormats';
import { downloadContactsExport } from '@/lib/contacts/exportContacts';
import { ChevronDown, Download, ExternalLink } from 'lucide-react';

type ContactsExportButtonProps = {
    /**
     * File format this button exports to
     */
    readonly format: ContactsExportFormat;

    /**
     * The contacts of the current view, which are the ones the downloaded file holds
     */
    readonly exportedContacts: readonly AdminJoinedContact[];

    /**
     * Address which serves the very same export, opened in a new tab
     */
    readonly exportUrl: string;

    /**
     * How much of the gathered contacts is being exported, said in words for the titles of the button
     */
    readonly exportScopeDescription: string;
};

/**
 * Button which downloads one export of the contacts, with a menu which can open that export in a new tab instead
 *
 * Note: Downloading is what the button itself does, because that is what an export is asked for most of the time
 */
export function ContactsExportButton(props: ContactsExportButtonProps) {
    const { format, exportedContacts, exportUrl, exportScopeDescription } = props;

    const exportedContactsCount = exportedContacts.length;
    const isSomethingToExport = exportedContactsCount > 0;

    const downloadExportFile = () => downloadContactsExport(exportedContacts, format);

    return (
        <div className="flex items-center">
            <Button
                variant="outline"
                className="rounded-r-none"
                disabled={!isSomethingToExport}
                onClick={downloadExportFile}
                title={`Download the ${format.label} file with ${exportScopeDescription}`}
            >
                <Download className="mr-2 h-4 w-4" />
                {format.label} ({exportedContactsCount})
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-8 rounded-l-none border-l-0"
                        disabled={!isSomethingToExport}
                        aria-label={`More ways to export the ${format.label} file`}
                        title={`More ways to export the ${format.label} file`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={downloadExportFile}>
                        <Download className="mr-2 h-4 w-4" />
                        Download the file
                    </DropdownMenuItem>
                    {/* Note: A real link, so that the export can also be opened in a window of its own, copied or
                              bookmarked, and so that no popup blocker stands in the way */}
                    <DropdownMenuItem asChild>
                        <a
                            href={exportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer"
                            title={`Open the ${format.label} export of ${exportScopeDescription} in a new tab, where reloading it exports the contacts again`}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in a new tab
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
