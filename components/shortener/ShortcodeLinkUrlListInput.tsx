'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

const URL_PLACEHOLDER = 'https://example.com/with/parameters?key=value';

type ShortcodeLinkUrlListInputProps = {
    /**
     * The destinations of one short link, of which there is always at least one field
     */
    readonly urls: readonly string[];

    readonly onUrlsChange: (urls: readonly string[]) => void;
};

/**
 * Edits the destinations of one short link, which both the creation and the editing of a link ask for in exactly the
 * same way.
 */
export function ShortcodeLinkUrlListInput({ urls, onUrlsChange }: ShortcodeLinkUrlListInputProps) {
    const replaceUrl = (replacedIndex: number, url: string) => {
        onUrlsChange(urls.map((currentUrl, index) => (index === replacedIndex ? url : currentUrl)));
    };

    const removeUrl = (removedIndex: number) => {
        onUrlsChange(urls.filter((_, index) => index !== removedIndex));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            type="url"
                            placeholder={URL_PLACEHOLDER}
                            value={url}
                            onChange={(event) => replaceUrl(index, event.target.value)}
                            required
                        />
                        {urls.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeUrl(index)}
                                aria-label="Remove this URL"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={() => onUrlsChange([...urls, ''])}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Another URL
            </Button>

            {urls.length > 1 && (
                <p className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <strong>Multiple URLs detected:</strong> When someone visits your short link, they will be randomly
                    redirected to one of these URLs.
                </p>
            )}
        </div>
    );
}
