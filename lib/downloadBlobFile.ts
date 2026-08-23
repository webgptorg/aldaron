type DownloadBlobFileOptions = {
    readonly fileName: string;
    readonly blob: Blob;
};

/**
 * Offer a file generated in the browser to the user as a download
 */
export function downloadBlobFile({ fileName, blob }: DownloadBlobFileOptions): void {
    const fileUrl = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.href = fileUrl;
    linkElement.download = fileName;

    // Note: Firefox only follows the click when the link is a part of the document
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    URL.revokeObjectURL(fileUrl);
}
