/**
 * The habits of one show, which everything reading its episodes has to know and none of which is a rule of podcasts
 *
 * Note: The show says them once and every source of its archive is read by them, so the same episode is titled and
 *       summarized identically whether it was read from the feed, from the video channel or from the list kept here.
 */
export type PodcastShowConventions = {
    /**
     * Name of the show as it repeats at the beginning of every episode title, so that a listing can drop it
     */
    readonly showTitle?: string;

    /**
     * Phrases after which a description stops summarizing the episode and starts listing links, sponsors or chapters
     */
    readonly summaryStopPhrases?: readonly string[];
};

/**
 * Cuts a description at the point where it stops summarizing and starts listing links, sponsors or chapters
 *
 * @param descriptionText whole description of the episode as plain text
 * @param summaryStopPhrases headings the editors of this one show type into every description
 */
export function createPodcastEpisodeSummary(
    descriptionText: string,
    summaryStopPhrases: readonly string[] = [],
): string {
    const stopIndex = summaryStopPhrases.reduce((earliestStopIndex, stopPhrase) => {
        const phraseIndex = descriptionText.indexOf(stopPhrase);

        return phraseIndex === -1 ? earliestStopIndex : Math.min(earliestStopIndex, phraseIndex);
    }, descriptionText.length);

    return descriptionText.slice(0, stopIndex).trim();
}
