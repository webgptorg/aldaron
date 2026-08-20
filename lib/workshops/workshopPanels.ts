/**
 * One part of the participant room which an admin can take away from the participants of a single workshop
 */
export type WorkshopPanelDefinition = {
    readonly key: string;

    /**
     * How the administration calls this panel
     */
    readonly adminLabel: string;

    /**
     * What the administration promises happens in the room once this panel is switched off
     */
    readonly adminDescription: string;
};

/**
 * Every switchable panel of the participant room, in the order the administration offers them
 *
 * Note: This is the one place a new panel is registered. The administration renders a switch for every entry and the
 *       room asks this very registry whether to show that panel, so a new panel needs no change of either of them.
 */
export const WORKSHOP_PANEL_DEFINITIONS = [
    {
        key: 'chat',
        adminLabel: 'Chat',
        adminDescription: 'Vypnutý chat zůstane vidět, ale účastníci do něj nemohou psát ani hlasovat.',
    },
    {
        key: 'reactions',
        adminLabel: 'Reakce účastníků',
        adminDescription: 'Vypnuté reakce zmizí ze stránky. Reakce poslané z administrace se dál zobrazují.',
    },
    {
        key: 'watching-count',
        adminLabel: 'Počet sledujících',
        adminDescription: 'Vypnutý počet zmizí ze stránky a místnost ho už nepočítá.',
    },
] as const satisfies readonly WorkshopPanelDefinition[];

export type WorkshopPanelKey = (typeof WORKSHOP_PANEL_DEFINITIONS)[number]['key'];

const WORKSHOP_PANEL_KEYS: ReadonlySet<string> = new Set(
    WORKSHOP_PANEL_DEFINITIONS.map((panelDefinition) => panelDefinition.key),
);

export function isWorkshopPanelKey(value: unknown): value is WorkshopPanelKey {
    return typeof value === 'string' && WORKSHOP_PANEL_KEYS.has(value);
}

/**
 * Reads the switched-off panels of a workshop
 *
 * Note: A panel this version of the room does not know is left out, so an unknown key can never hide a panel which
 *       nothing can switch back on.
 */
export function normalizeWorkshopDisabledPanels(value: unknown): readonly WorkshopPanelKey[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return Array.from(new Set(value.filter(isWorkshopPanelKey)));
}

/**
 * Whether the room still offers a panel to its participants
 *
 * Note: Only a panel which was explicitly switched off is gone, so every workshop offers a panel added later.
 */
export function isWorkshopPanelEnabled(disabledPanels: readonly string[], panelKey: WorkshopPanelKey): boolean {
    return !disabledPanels.includes(panelKey);
}

/**
 * The switched-off panels of a workshop after one of them was switched on or off
 *
 * Note: The result follows the registry, so the stored panels never carry a duplicate or an unknown key.
 */
export function withWorkshopPanelEnabled(
    disabledPanels: readonly string[],
    panelKey: WorkshopPanelKey,
    isEnabled: boolean,
): readonly WorkshopPanelKey[] {
    return WORKSHOP_PANEL_DEFINITIONS.map((panelDefinition) => panelDefinition.key).filter((currentPanelKey) =>
        currentPanelKey === panelKey ? !isEnabled : disabledPanels.includes(currentPanelKey),
    );
}
