type DownloadTextFileOptions = {
    readonly fileName: string;
    readonly mimeType: string;
    readonly content: string;
};

/**
 * Offer a text file generated in the browser to the user as a download
 */
export function downloadTextFile(options: DownloadTextFileOptions): void {
    const { fileName, mimeType, content } = options;

    const fileUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const linkElement = document.createElement('a');
    linkElement.href = fileUrl;
    linkElement.download = fileName;

    // Note: Firefox only follows the click when the link is a part of the document
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    URL.revokeObjectURL(fileUrl);
}
