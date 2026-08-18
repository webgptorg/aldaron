import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopContentEditor } from '@/businesses/workshop-admin/WorkshopContentEditor';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';

type WorkshopContentAdminProps = {
    readonly workshopStartsAt: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly onCreate: (values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onUpdate: (contentId: string, values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onDelete: (contentId: string) => Promise<void>;
    readonly onUnlockNow: (contentId: string) => Promise<boolean>;
};

export function WorkshopContentAdmin({
    workshopStartsAt,
    contentBlocks,
    onCreate,
    onUpdate,
    onDelete,
    onUnlockNow,
}: WorkshopContentAdminProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Časovaný Markdown obsah</h2>
            <p className="mt-1 text-sm text-slate-500">
                Změny, smazání i publikace se připojeným účastníkům projeví živě.
            </p>
            <div className="mt-6 space-y-4">
                {contentBlocks.map((contentBlock) => (
                    <WorkshopContentEditor
                        key={contentBlock.id}
                        contentBlock={contentBlock}
                        defaultUnlockAt={workshopStartsAt}
                        defaultSortOrder={contentBlock.sortOrder}
                        onSave={(values) => onUpdate(contentBlock.id, values)}
                        onDelete={() => onDelete(contentBlock.id)}
                        onUnlockNow={() => onUnlockNow(contentBlock.id)}
                    />
                ))}
                <WorkshopContentEditor
                    contentBlock={null}
                    defaultUnlockAt={workshopStartsAt}
                    defaultSortOrder={contentBlocks.length * 10}
                    onSave={onCreate}
                />
            </div>
        </section>
    );
}
