'use client';

import { ShortcodeLinkUrlListInput } from '@/components/shortener/ShortcodeLinkUrlListInput';
import { classNames } from '@/lib/classNames';
import { createPublicShortcodeLinkUrl, type ShortcodeLink } from '@/lib/shortener/shortcodeLink';
import { createAdminShortcodeLink } from '@/lib/shortener/shortcodeLinkAdminApiClient';
import { isAbsoluteUrl } from '@/lib/shortener/isAbsoluteUrl';
import { titleToName } from '@promptbook/utils';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

const PROMPTBOOK_QR_CODE = dynamic(() => import('@promptbook/components').then((module) => module.PromptbookQrCode), {
    ssr: false,
});

const SHORTCODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SHORTCODE_LENGTH = 6;
const SHORTCODE_PREVIEW_COUNT = 5;

function generateShortcode(): string {
    let shortcode = '';

    for (let index = 0; index < SHORTCODE_LENGTH; index++) {
        shortcode += SHORTCODE_CHARACTERS.charAt(Math.floor(Math.random() * SHORTCODE_CHARACTERS.length));
    }

    return shortcode;
}

function createShortcodePreviews(customPrefix: string): string[] {
    const prefix = customPrefix ? titleToName(customPrefix) + '-' : '';

    return Array.from({ length: SHORTCODE_PREVIEW_COUNT }, () => prefix + generateShortcode());
}

type UrlShortenerProps = {
    /**
     * Optional CSS class name which will be added to root <div> element
     */
    readonly className?: string;

    /**
     * Told about every short link which has just been persisted, so that a listing of them can catch up
     */
    readonly onShortcodeLinkCreated?: (shortcodeLink: ShortcodeLink) => void;
};

/**
 * Renders a URL Shortener app
 */
export function UrlShortener(props: UrlShortenerProps) {
    const { className, onShortcodeLinkCreated } = props;

    const [urls, setUrls] = useState<readonly string[]>(['']);
    const [displayText, setDisplayText] = useState('');
    const [error, setError] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [linkHtml, setLinkHtml] = useState('');
    const [linkMarkdown, setLinkMarkdown] = useState('');
    const [isShortener, setIsShortener] = useState(true);
    const [shortCode, setShortCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useUtm, setUseUtm] = useState(false);
    const [previewShortcodes, setPreviewShortcodes] = useState(() => createShortcodePreviews(''));
    const [selectedShortcode, setSelectedShortcode] = useState(previewShortcodes[0]);
    const [customPrefix, setCustomPrefix] = useState('');
    const [utmParams, setUtmParams] = useState({
        source: '',
        medium: '',
        campaign: '',
        term: '',
        content: '',
    });

    const regenerateShortcodes = useCallback(() => {
        const newShortcodes = createShortcodePreviews(customPrefix);
        setPreviewShortcodes(newShortcodes);
        setSelectedShortcode(newShortcodes[0]);
    }, [customPrefix]);

    // Debounced version of regenerateShortcodes
    useEffect(() => {
        const timeoutId = setTimeout(regenerateShortcodes, 300);
        return () => clearTimeout(timeoutId);
    }, [customPrefix, regenerateShortcodes]);

    const updateUtmParam = (field: keyof typeof utmParams, value: string) => {
        setUtmParams((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addUtmParams = (url: string): string => {
        if (!useUtm) return url;

        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        // Add UTM parameters if they have values
        if (utmParams.source) params.set('utm_source', utmParams.source);
        if (utmParams.medium) params.set('utm_medium', utmParams.medium);
        if (utmParams.campaign) params.set('utm_campaign', utmParams.campaign);
        if (utmParams.term) params.set('utm_term', utmParams.term);
        if (utmParams.content) params.set('utm_content', utmParams.content);

        // Reconstruct URL with new parameters
        urlObj.search = params.toString();
        return urlObj.toString();
    };

    const handleCreateLink = async () => {
        const validUrls = urls.filter((url) => url.trim());

        if (validUrls.length === 0) {
            setError('Please enter at least one URL');
            return;
        }

        let text = displayText.trim();

        try {
            // Validate all URLs
            for (const url of validUrls) {
                if (!isAbsoluteUrl(url.trim())) {
                    throw new Error('Every URL must be a valid absolute URL');
                }
            }
            setError('');
            setIsLoading(true);

            // If no display text provided, infer it from first URL
            if (!text && validUrls[0]) {
                const urlObj = new URL(validUrls[0].trim());
                const pathSegments = urlObj.pathname.split('/').filter(Boolean);
                text = (pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : urlObj.hostname) || 'link';
            }

            // Add UTM parameters to all URLs if enabled
            const processedUrls = validUrls.map((url) => addUtmParams(url.trim()));

            if (isShortener) {
                // Use the selected shortcode or generate a new one if none selected
                const createdShortcodeLink = await createAdminShortcodeLink({
                    shortcode: selectedShortcode || generateShortcode(),
                    urls: processedUrls,
                    note: null,
                    landingPage: null,
                });
                const shortUrl = createPublicShortcodeLinkUrl(createdShortcodeLink.shortcode);
                setShortCode(createdShortcodeLink.shortcode);
                setLinkHtml(`<a href="${shortUrl}">${text}</a>`);
                setLinkMarkdown(`[${text}](${shortUrl})`);

                // Regenerate shortcodes after successful creation
                regenerateShortcodes();
                onShortcodeLinkCreated?.(createdShortcodeLink);
            } else {
                // Regular link wrapping - use first URL
                const firstUrl = processedUrls[0] || '';
                setLinkHtml(`<a href="${firstUrl}">${text}</a>`);
                setLinkMarkdown(`[${text}](${firstUrl})`);
            }

            setShowResult(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyHtml = () => {
        const textarea = document.getElementById('html-code') as HTMLTextAreaElement;
        textarea.select();
        document.execCommand('copy');
    };

    const handleCopyMarkdown = () => {
        const textarea = document.getElementById('markdown-code') as HTMLTextAreaElement;
        textarea.select();
        document.execCommand('copy');
    };

    const handleCopyLink = async () => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `<a href="${
                isShortener ? createPublicShortcodeLinkUrl(shortCode) : urls[0]
            }">${displayText}</a>`;
            const linkElement = tempDiv.firstChild;

            if (navigator.clipboard && navigator.clipboard.write) {
                const html = new Blob([tempDiv.innerHTML], { type: 'text/html' });
                const plain = new Blob([displayText], { type: 'text/plain' });

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': html,
                        'text/plain': plain,
                    }),
                ]);
            } else {
                // Fallback
                document.body.appendChild(tempDiv);
                const range = document.createRange();
                range.selectNode(linkElement as Node);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
                document.execCommand('copy');
                selection?.removeAllRanges();
                document.body.removeChild(tempDiv);
            }
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    const handleDownloadQR = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${shortCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className={classNames('url-shortener', className)}>
            <div className="container mx-auto my-12 max-w-4xl space-y-12">
                <div className="space-y-2">
                    <h1>🔗 URL Shortener</h1>
                    <p>Create a custom text link that wraps any URL or generate a short URL.</p>
                </div>

                <div className="space-y-6">
                    <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-900">Using URL shortener</span>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={isShortener}
                                    onChange={(e) => setIsShortener(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:content-[''] after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                        <label className="block text-lg font-medium text-gray-900">URLs</label>
                        <ShortcodeLinkUrlListInput urls={urls} onUrlsChange={setUrls} />
                    </div>

                    <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                        <label htmlFor="display-text" className="block text-lg font-medium text-gray-900">
                            Display Text (optional)
                        </label>
                        <input
                            type="text"
                            id="display-text"
                            placeholder="Will use URL path or domain if left empty"
                            value={displayText}
                            onChange={(e) => setDisplayText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>

                    {isShortener && (
                        <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="block text-lg font-medium text-gray-900">Select Shortcode</label>
                                <input
                                    type="text"
                                    placeholder="Custom prefix (optional)"
                                    value={customPrefix}
                                    onChange={(e) => setCustomPrefix(e.target.value)}
                                    className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedShortcode}
                                    onChange={(e) => setSelectedShortcode(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    {previewShortcodes.map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={regenerateShortcodes}
                                    className="rounded-md bg-gray-50 p-2 text-gray-600 hover:bg-gray-100"
                                    title="Refresh shortcodes"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h5M20 20v-5h-5M4 4l16 16"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {selectedShortcode && (
                                <p className="text-sm text-gray-500">
                                    Preview URL: {createPublicShortcodeLinkUrl(selectedShortcode)}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-900">Add UTM Parameters</span>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={useUtm}
                                    onChange={(e) => setUseUtm(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:content-[''] after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                            </label>
                        </div>

                        {useUtm && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="utm-source" className="block text-sm font-medium text-gray-700">
                                        Source
                                    </label>
                                    <input
                                        type="text"
                                        id="utm-source"
                                        placeholder="google, facebook"
                                        value={utmParams.source}
                                        onChange={(e) => updateUtmParam('source', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="utm-medium" className="block text-sm font-medium text-gray-700">
                                        Medium
                                    </label>
                                    <input
                                        type="text"
                                        id="utm-medium"
                                        placeholder="cpc, organic, social"
                                        value={utmParams.medium}
                                        onChange={(e) => updateUtmParam('medium', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="utm-content" className="block text-sm font-medium text-gray-700">
                                        Content
                                    </label>
                                    <input
                                        type="text"
                                        id="utm-content"
                                        placeholder="promo, banner"
                                        value={utmParams.content}
                                        onChange={(e) => updateUtmParam('content', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

                    <button
                        onClick={handleCreateLink}
                        disabled={isLoading}
                        className={classNames(
                            'w-full rounded-md bg-blue-600 py-3 px-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                            isLoading ? 'cursor-not-allowed opacity-50' : '',
                        )}
                    >
                        {isLoading ? 'Creating...' : isShortener ? 'Create Short URL' : 'Create Link'}
                    </button>
                </div>

                {showResult && (
                    <div className="space-y-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Your {isShortener ? 'shortened' : 'wrapped'} link is ready!
                        </h2>
                        <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
                            <p
                                className="overflow-hidden text-ellipsis whitespace-nowrap text-blue-600"
                                dangerouslySetInnerHTML={{ __html: linkHtml }}
                            />
                            <button
                                onClick={handleCopyLink}
                                className="ml-4 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                            Note: The "Copy" button attempts to copy the link with its formatting intact. This works
                            best when pasting into applications that support rich text (like Word, Google Docs, email
                            composers, and some web forms). If the destination only supports plain text, you'll need to
                            use the code below.
                        </div>

                        {isShortener && (
                            <div className="text-center">
                                <h3 className="text-lg font-medium">QR Code</h3>
                                <div className="mt-2 inline-block rounded-lg bg-white p-4 shadow-md">
                                    <PROMPTBOOK_QR_CODE value={createPublicShortcodeLinkUrl(shortCode)} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">HTML Code</h3>
                            <div className="flex items-center">
                                <textarea
                                    id="html-code"
                                    rows={3}
                                    readOnly
                                    value={linkHtml}
                                    className="w-full rounded-l-md border-gray-300 font-mono text-sm shadow-sm"
                                />
                                <button
                                    onClick={handleCopyHtml}
                                    className="rounded-r-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Markdown Code</h3>
                            <div className="flex items-center">
                                <textarea
                                    id="markdown-code"
                                    rows={3}
                                    readOnly
                                    value={linkMarkdown}
                                    className="w-full rounded-l-md border-gray-300 font-mono text-sm shadow-sm"
                                />
                                <button
                                    onClick={handleCopyMarkdown}
                                    className="rounded-r-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
