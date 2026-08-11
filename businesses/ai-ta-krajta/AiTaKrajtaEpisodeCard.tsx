import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/config';
import { createYoutubeThumbnailUrl, createYoutubeWatchUrl, extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * One highlighted episode, shown as its still image which leads to the episode on YouTube
 *
 * Note: A still image instead of a player on purpose - a page with several embedded players loads a whole YouTube
 *       for each of them before the visitor asks for a single one.
 */
export function AiTaKrajtaEpisodeCard({ episode }: { readonly episode: AiTaKrajtaEpisode }) {
    const youtubeVideoId = extractYoutubeVideoId(episode.youtubeVideo);

    if (youtubeVideoId === null) {
        return null;
    }

    return (
        <Link
            href={createYoutubeWatchUrl(youtubeVideoId)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] transition-colors hover:border-white/25 hover:bg-white/[0.07]"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
                <Image
                    src={createYoutubeThumbnailUrl(youtubeVideoId)}
                    alt={episode.title}
                    width={640}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold leading-snug text-white">{episode.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{episode.description}</p>
            </div>
        </Link>
    );
}
