'use client';

import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

const COPIED_CONFIRMATION_MILLISECONDS = 1_500;

type CopyTextButtonProps = {
    readonly text: string;
    readonly label: string;
};

/**
 * Puts one plain text into the clipboard and says so for a moment afterwards.
 */
export function CopyTextButton({ text, label }: CopyTextButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isCopied) {
            return;
        }

        const timeoutId = setTimeout(() => setIsCopied(false), COPIED_CONFIRMATION_MILLISECONDS);

        return () => clearTimeout(timeoutId);
    }, [isCopied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopy()} aria-label={label}>
            {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
}
