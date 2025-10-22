'use client';

import { titleToName } from '@promptbook/utils';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { classNames } from '@/lib/utils';
import { useUserSession } from '@/hooks/use-user-session';
import { getSupabaseForBrowser } from '@/lib/supabase';
import { QrCode } from 'react-qr-code';

type UrlShortenerProps = {
    /**
     * Optional CSS class name which will be added to root <div> element
     */
    readonly className?: string;
};

/**
 * Renders a URL Shortener app
 */
export function UrlShortener(props: UrlShortenerProps): JSX.Element {
    const { className } = props;

    const generateShortCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const [urls, setUrls] = useState<string[]>(['']);
    const [displayText, setDisplayText] = useState('');
    const [error, setError] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [linkHtml, setLinkHtml] = useState('');
    const [linkMarkdown, setLinkMarkdown] = useState('');
    const [isShortener, setIsShortener] = useState(true);
    const [shortCode, setShortCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useUtm, setUseUtm] = useState(false);
    const [previewShortcodes, setPreviewShortcodes] = useState(() =>
        Array.from({ length: 5 }, () => generateShortCode()),
    );
    const [selectedShortcode, setSelectedShortcode] = useState(previewShortcodes[0]);
    const [customPrefix, setCustomPrefix] = useState('');
    const [utmParams, setUtmParams] = useState({
        source: '',
        medium: '',
        campaign: '',
        term: '',
        content: '',
    });

    const userSession = useUserSession();

    const regenerateShortcodes = useCallback(() => {
        const prefix = customPrefix ? titleToName(customPrefix) + '-' : '';
        const newCodes = Array.from({ length: 5 }, () => prefix + generateShortCode());
        setPreviewShortcodes(newCodes);
        setSelectedShortcode(newCodes[0]);
    }, [customPrefix]);

    // Debounced version of regenerateShortcodes
    useEffect(() => {
        const timeoutId = setTimeout(regenerateShortcodes, 300);
        return () => clearTimeout(timeoutId);
    }, [customPrefix, regenerateShortcodes]);

    const addUrlField = () => {
        setUrls([...urls, '']);
    };

    const removeUrlField = (index: number) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

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
                new URL(url.trim());
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
                const shortcode = selectedShortcode || generateShortCode();
                const { error } = await getSupabaseForBrowser()
                    .from('ShortcodeLink')
                    .insert({
                        type: 'CUSTOM',
                        shortcode,
                        url: processedUrls,
                        ownerEmail: userSession?.email || null,
                    });

                if (error) {
                    throw error;
                }

                const shortUrl = `https://ptbk.io/${shortcode}`;
                setShortCode(shortcode);
                setLinkHtml(`<a href="${shortUrl}">${text}</a>`);
                setLinkMarkdown(`[${text}](${shortUrl})`);

                // Regenerate shortcodes after successful creation
                regenerateShortcodes();
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
                isShortener ? `https://ptbk.io/${shortCode}` : urls[0]
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
            <div className="container">
                <Head>
                    <title>URL Shortener</title>
                    <meta name="description" content="Create short URLs and track clicks" />
                </Head>

                <h1>🔗 URL Shortener</h1>
                <p>Create a custom text link that wraps any URL or generate a short URL.</p>

                <div className="form">
                    <div className="toggle-container">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={isShortener}
                                onChange={(e) => setIsShortener(e.target.checked)}
                            />
                            <span className="toggle-text">Using URL shortener</span>
                        </label>
                    </div>

                    <div className="field-box">
                        <label>URLs:</label>
                        {urls.map((url, index) => (
                            <div key={index} className="url-input-container">
                                <input
                                    type="url"
                                    placeholder="https://example.com/with/parameters?key=value"
                                    value={url}
                                    onChange={(e) => updateUrl(index, e.target.value)}
                                    required
                                />
                                {urls.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeUrlField(index)}
                                        className="remove-url-btn"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addUrlField} className="add-url-btn">
                            Add Another URL
                        </button>
                        {urls.length > 1 && (
                            <div className="info-box">
                                <p>
                                    <strong>Multiple URLs detected:</strong> When someone visits your short link,
                                    they will be randomly redirected to one of these URLs.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="field-box">
                        <label htmlFor="display-text">Display Text (optional):</label>
                        <input
                            type="text"
                            id="display-text"
                            placeholder="Will use URL path or domain if left empty"
                            value={displayText}
                            onChange={(e) => setDisplayText(e.target.value)}
                        />
                    </div>

                    {isShortener && (
                        <div className="field-box">
                            <div className="shortcode-header">
                                <label>Select Shortcode:</label>
                                <div className="prefix-input">
                                    <input
                                        type="text"
                                        placeholder="Custom prefix (optional)"
                                        value={customPrefix}
                                        onChange={(e) => setCustomPrefix(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="shortcode-controls">
                                <select
                                    value={selectedShortcode}
                                    onChange={(e) => setSelectedShortcode(e.target.value)}
                                    className="shortcode-select"
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
                                    className="refresh-button"
                                    title="Refresh shortcodes"
                                >
                                    🔄
                                </button>
                            </div>
                            {selectedShortcode && (
                                <p className="preview-url">
                                    Preview URL: https://ptbk.io/{selectedShortcode}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="field-box">
                        <label className="toggle-label">
                            <input type="checkbox" checked={useUtm} onChange={(e) => setUseUtm(e.target.checked)} />
                            <span className="toggle-text">Add UTM Parameters</span>
                        </label>

                        {useUtm && (
                            <div className="utm-fields">
                                <div className="utm-field">
                                    <label htmlFor="utm-source">Source:</label>
                                    <input
                                        type="text"
                                        id="utm-source"
                                        placeholder="google, facebook"
                                        value={utmParams.source}
                                        onChange={(e) => updateUtmParam('source', e.target.value)}
                                    />
                                </div>
                                <div className="utm-field">
                                    <label htmlFor="utm-medium">Medium:</label>
                                    <input
                                        type="text"
                                        id="utm-medium"
                                        placeholder="social, display, cpm, ppc, cpc, organic, affiliate, email, referral,..."
                                        value={utmParams.medium}
                                        onChange={(e) => updateUtmParam('medium', e.target.value)}
                                    />
                                </div>
                                <div className="utm-field">
                                    <label htmlFor="utm-content">Content:</label>
                                    <input
                                        type="text"
                                        id="utm-content"
                                        placeholder="post-2025-05-05-001"
                                        value={utmParams.content}
                                        onChange={(e) => updateUtmParam('content', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button
                        onClick={handleCreateLink}
                        disabled={isLoading}
                        className={classNames('primary-button', isLoading ? 'loading-button' : '')}
                    >
                        {isLoading ? 'Creating...' : isShortener ? 'Create Short URL' : 'Create Link'}
                    </button>
                </div>

                {showResult && (
                    <div className="result">
                        <p>
                            <strong>Your {isShortener ? 'shortened' : 'wrapped'} link:</strong>
                        </p>
                        <div className="link-container">
                            <p dangerouslySetInnerHTML={{ __html: linkHtml }} />
                            <button onClick={handleCopyLink} className="copy-btn">
                                Copy Rich Hyperlink
                            </button>
                        </div>
                        <p>
                            <em>Click the link above to test it</em>
                        </p>

                        <div className="format-notice">
                            <p>
                                <small>
                                    Note: The "Copy Rich Hyperlink" button attempts to copy the link with
                                    its formatting intact. This works best when pasting into applications that
                                    support rich text (like Word, Google Docs, email composers, and some web forms).
                                    If the destination only supports plain text, you'll need to use the code
                                    below.
                                </small>
                            </p>
                        </div>

                        {isShortener && (
                            <div className="qr-section">
                                <h3>QR Code:</h3>
                                <div className="qr-container">
                                    <QrCode
                                        value={`https://ptbk.io/${shortCode}`}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="code-section">
                            <h3>HTML Code:</h3>
                            <button onClick={handleCopyHtml} className="copy-btn">
                                Copy HTML
                            </button>
                            <textarea id="html-code" rows={3} readOnly value={linkHtml} />
                        </div>

                        <div className="code-section">
                            <h3>Markdown Code:</h3>
                            <button onClick={handleCopyMarkdown} className="copy-btn">
                                Copy Markdown
                            </button>
                            <textarea id="markdown-code" rows={3} readOnly value={linkMarkdown} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
