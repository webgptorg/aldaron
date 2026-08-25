import {
    getWorkshopKindPanelDefinitions,
    isWorkshopPanelEnabled,
    isWorkshopPanelKey,
    isWorkshopPanelOffered,
    normalizeWorkshopDisabledPanels,
    withWorkshopPanelEnabled,
    WORKSHOP_PANEL_DEFINITIONS,
} from '@/lib/workshops/workshopPanels';
import { describe, expect, it } from 'vitest';

describe('workshop panels', () => {
    it('describes every panel exactly once, so the administration lists no panel twice', () => {
        const panelKeys = WORKSHOP_PANEL_DEFINITIONS.map((panelDefinition) => panelDefinition.key);

        expect(new Set(panelKeys).size).toBe(panelKeys.length);
        expect(panelKeys).toContain('chat');
        expect(panelKeys).toContain('reactions');
        expect(panelKeys).toContain('watching-count');
        WORKSHOP_PANEL_DEFINITIONS.forEach((panelDefinition) => {
            expect(panelDefinition.adminLabel.length).toBeGreaterThan(0);
            expect(panelDefinition.adminDescription.length).toBeGreaterThan(0);
        });
    });

    it('offers every panel a workshop never switched off, including one added later', () => {
        expect(isWorkshopPanelEnabled([], 'chat')).toBe(true);
        expect(isWorkshopPanelEnabled(['reactions'], 'chat')).toBe(true);
        expect(isWorkshopPanelEnabled(['chat'], 'chat')).toBe(false);
        expect(isWorkshopPanelEnabled(['chat', 'watching-count'], 'watching-count')).toBe(false);
    });

    it('recognizes only a panel of the registry', () => {
        expect(isWorkshopPanelKey('chat')).toBe(true);
        expect(isWorkshopPanelKey('watching-count')).toBe(true);
        expect(isWorkshopPanelKey('stage')).toBe(false);
        expect(isWorkshopPanelKey(7)).toBe(false);
        expect(isWorkshopPanelKey(null)).toBe(false);
    });

    it('reads stored panels without letting an unknown or a repeated key through', () => {
        expect(normalizeWorkshopDisabledPanels(['chat', 'stage', 'chat'])).toEqual(['chat']);
        expect(normalizeWorkshopDisabledPanels([])).toEqual([]);
        expect(normalizeWorkshopDisabledPanels(null)).toEqual([]);
        expect(normalizeWorkshopDisabledPanels('chat')).toEqual([]);
    });

    it('switches one panel without touching the others and keeps the order of the registry', () => {
        expect(withWorkshopPanelEnabled([], 'chat', false)).toEqual(['chat']);
        expect(withWorkshopPanelEnabled(['chat'], 'chat', true)).toEqual([]);
        expect(withWorkshopPanelEnabled(['watching-count'], 'chat', false)).toEqual(['chat', 'watching-count']);
        expect(withWorkshopPanelEnabled(['chat', 'chat'], 'reactions', false)).toEqual(['chat', 'reactions']);
    });

    it('drops an unknown key while switching, so a stored typo cannot survive a save', () => {
        expect(withWorkshopPanelEnabled(['stage', 'chat'], 'reactions', false)).toEqual(['chat', 'reactions']);
    });

    it('leaves the panels of a live room out of a calm one', () => {
        expect(getWorkshopKindPanelDefinitions('workshop').map((panelDefinition) => panelDefinition.key)).toEqual([
            'chat',
            'reactions',
            'watching-count',
        ]);
        expect(getWorkshopKindPanelDefinitions('community').map((panelDefinition) => panelDefinition.key)).toEqual([
            'chat',
        ]);
    });

    it('offers a panel only when the kind of the room has it and nobody switched it off', () => {
        expect(isWorkshopPanelOffered('workshop', [], 'reactions')).toBe(true);
        expect(isWorkshopPanelOffered('workshop', ['reactions'], 'reactions')).toBe(false);
        expect(isWorkshopPanelOffered('community', [], 'chat')).toBe(true);
        expect(isWorkshopPanelOffered('community', ['chat'], 'chat')).toBe(false);
        expect(isWorkshopPanelOffered('community', [], 'reactions')).toBe(false);
        expect(isWorkshopPanelOffered('community', [], 'watching-count')).toBe(false);
    });
});
