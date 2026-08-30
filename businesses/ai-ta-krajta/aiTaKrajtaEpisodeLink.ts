import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';

/**
 * Where one episode is opened outside this page, and what that offer is called
 */
export type AiTaKrajtaEpisodeLink = {
    readonly label: string;
    readonly url: string;
};

/**
 * The link an episode is primarily offered under
 *
 * Note: The show is made as a video, so the episode is opened on YouTube whenever there is a video of it. Only an
 *       episode which was never published there falls back to the page of the podcast host, and an episode which no
 *       source links at all is offered nothing rather than a dead link.
 *
 * @returns where the episode leads, `null` when no source names a place to open it at
 */
export function getAiTaKrajtaEpisodeLink(episode: AiTaKrajtaEpisode): AiTaKrajtaEpisodeLink | null {
    if (episode.videoUrl !== null) {
        return { label: 'Otevřít na YouTube', url: episode.videoUrl };
    }

    if (episode.pageUrl !== null) {
        return { label: 'Otevřít u vydavatele', url: episode.pageUrl };
    }

    return null;
}
