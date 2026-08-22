'use client';

import {
    getWorkshopKindPanelDefinitions,
    isWorkshopPanelEnabled,
    withWorkshopPanelEnabled,
    type WorkshopPanelKey,
} from '@/lib/workshops/workshopPanels';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

type WorkshopPanelSettingsProps = {
    readonly workshopKind: WorkshopKind;
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly onChange: (disabledPanels: readonly WorkshopPanelKey[]) => void;
};

/**
 * The switches which decide what the participant room offers its participants
 *
 * Note: Every panel the kind of this room can offer gets a switch here, so a panel added later needs no change of
 *       this form.
 */
export function WorkshopPanelSettings({ workshopKind, disabledPanels, onChange }: WorkshopPanelSettingsProps) {
    return (
        <fieldset className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Panely v místnosti</legend>
            <div className="space-y-3">
                {getWorkshopKindPanelDefinitions(workshopKind).map((panelDefinition) => (
                    <label key={panelDefinition.key} className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isWorkshopPanelEnabled(disabledPanels, panelDefinition.key)}
                            onChange={(event) =>
                                onChange(
                                    withWorkshopPanelEnabled(disabledPanels, panelDefinition.key, event.target.checked),
                                )
                            }
                            className="mt-0.5 h-4 w-4 shrink-0 rounded"
                        />
                        <span className="min-w-0">
                            <span className="block text-sm font-medium text-slate-700">
                                {panelDefinition.adminLabel}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                                {panelDefinition.adminDescription}
                            </span>
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
