const CZECH_LOCALE = 'cs-CZ';

/**
 * The three Czech grammatical forms a counted noun needs
 */
type CzechCountedForms<Form> = {
    /**
     * Form which belongs to exactly one thing
     */
    readonly one: Form;

    /**
     * Form which belongs to two, three or four things
     */
    readonly few: Form;

    /**
     * Form which belongs to five and more things, and to none
     */
    readonly many: Form;
};

/**
 * Picks the Czech grammatical form which belongs to a count
 */
function selectCzechCountedForm<Form>(count: number, forms: CzechCountedForms<Form>): Form {
    if (count === 1) {
        return forms.one;
    }
    if (count >= 2 && count <= 4) {
        return forms.few;
    }

    return forms.many;
}

/**
 * Says in Czech how many people are watching the workshop right now
 */
export function formatWorkshopWatchingCountLabel(watchingParticipantCount: number): string {
    const { verb, noun } = selectCzechCountedForm(watchingParticipantCount, {
        one: { verb: 'Sleduje', noun: 'člověk' },
        few: { verb: 'Sledují', noun: 'lidé' },
        many: { verb: 'Sleduje', noun: 'lidí' },
    });

    return `${verb} ${watchingParticipantCount.toLocaleString(CZECH_LOCALE)} ${noun}`;
}
