'use client';

import { ImageOff, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type CommunityProjectPreviewImageProps = {
    readonly imageUrl: string | null;
    readonly title: string;
    readonly className?: string;
};

/**
 * An OG image belongs to another site and can disappear after a project was saved. The fallback keeps every card
 * visually useful rather than leaving a broken-image icon in the community grid.
 */
export function CommunityProjectPreviewImage({ imageUrl, title, className = '' }: CommunityProjectPreviewImageProps) {
    const [isImageAvailable, setIsImageAvailable] = useState(imageUrl !== null);

    useEffect(() => {
        setIsImageAvailable(imageUrl !== null);
    }, [imageUrl]);

    if (imageUrl !== null && isImageAvailable) {
        return (
            <img
                src={imageUrl}
                alt={`Náhled projektu ${title}`}
                className={`h-full w-full object-cover ${className}`}
                onError={() => setIsImageAvailable(false)}
            />
        );
    }

    return (
        <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400/20 via-slate-900 to-violet-500/20 ${className}`}
            aria-label="Náhled projektu není k dispozici"
        >
            {imageUrl === null ? <Sparkles className="h-9 w-9 text-cyan-200/80" /> : <ImageOff className="h-9 w-9 text-slate-300/70" />}
        </div>
    );
}
