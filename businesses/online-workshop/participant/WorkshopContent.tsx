import { MarkdownContent } from '@/components/markdown-content';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { Clock3, Sparkles } from 'lucide-react';

type WorkshopContentProps = {
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
};

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Prague',
});

export function WorkshopContent({ contentBlocks, nextContentUnlockAt }: WorkshopContentProps) {
    if (contentBlocks.length === 0 && nextContentUnlockAt === null) {
        return null;
    }

    return (
        <section className="mt-8" aria-labelledby="workshop-materials-title">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h2 id="workshop-materials-title" className="text-xl font-bold text-white">
                    Materiály z workshopu
                </h2>
            </div>

            <div className="space-y-4">
                {contentBlocks.map((contentBlock) => (
                    <article
                        key={contentBlock.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-slate-200 shadow-lg sm:p-8"
                    >
                        {contentBlock.title && (
                            <h3 className="mb-5 text-xl font-bold text-white">{contentBlock.title}</h3>
                        )}
                        <MarkdownContent
                            content={contentBlock.bodyMarkdown}
                            theme="DARK"
                            className="max-w-none leading-7 text-slate-200 [&_a]:text-cyan-300 [&_a]:underline [&_code]:text-cyan-100 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white"
                        />
                    </article>
                ))}

                {nextContentUnlockAt && (
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] px-5 py-4 text-sm text-slate-400">
                        <Clock3 className="h-5 w-5 shrink-0 text-cyan-300" />
                        Další materiál se automaticky odemkne{' '}
                        {CZECH_DATE_TIME_FORMAT.format(new Date(nextContentUnlockAt))}.
                    </div>
                )}
            </div>
        </section>
    );
}
