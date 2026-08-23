import { downloadBlobFile } from '@/lib/downloadBlobFile';

type DownloadTextFileOptions = {
    readonly fileName: string;
    readonly mimeType: string;
    readonly content: string;
};

/**
 * Offer a text file generated in the browser to the user as a download
 */
export function downloadTextFile({ fileName, mimeType, content }: DownloadTextFileOptions): void {
    downloadBlobFile({ fileName, blob: new Blob([content], { type: mimeType }) });
}
