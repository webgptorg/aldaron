/**
 * The two kinds of surface a form of this application is filled in on: the light public pages, and the dark rooms
 * members read.
 *
 * Note: A form which is offered in both places is written once and told which surface it is on, so the same field
 *       never exists twice merely because one page is dark.
 */
export type FormSurfaceAppearance = 'light' | 'dark';

type FormSurfaceClassNames = {
    readonly label: string;
    readonly input: string;
    readonly hint: string;
    readonly heading: string;
    readonly mutedText: string;
    readonly strikethroughText: string;
};

export const FORM_SURFACE_CLASS_NAMES: Readonly<Record<FormSurfaceAppearance, FormSurfaceClassNames>> = {
    light: {
        label: 'text-slate-700',
        input: '',
        hint: 'text-slate-500',
        heading: 'text-slate-950',
        mutedText: 'text-slate-500',
        strikethroughText: 'text-slate-400 decoration-slate-400/80',
    },
    dark: {
        label: 'text-slate-200',
        input: 'border-white/15 bg-slate-950/70 text-white placeholder:text-slate-600',
        hint: 'text-slate-400',
        heading: 'text-white',
        mutedText: 'text-slate-400',
        strikethroughText: 'text-slate-500 decoration-slate-500/80',
    },
};
