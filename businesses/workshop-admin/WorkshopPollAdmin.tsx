'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWorkshopPollVoteCount } from '@/lib/workshops/workshopPollValues';
import type { WorkshopPoll } from '@/lib/workshops/workshopTypes';
import { CirclePlus, Lock, Minus, Send, Vote } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const MINIMAL_OPTION_COUNT = 2;
const MAXIMAL_OPTION_COUNT = 8;

type WorkshopPollAdminProps = {
    readonly polls: readonly WorkshopPoll[];
    readonly onCreate: (values: { readonly question: string; readonly options: readonly string[] }) => Promise<boolean>;
    readonly onClose: (pollId: string) => Promise<boolean>;
};

/**
 * Administration of community polls. Its form has no room-specific request logic: the shared dashboard supplies the
 * same authenticated API boundary it uses for content and moderation.
 */
export function WorkshopPollAdmin({ polls, onCreate, onClose }: WorkshopPollAdminProps) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<readonly string[]>(['', '']);
    const [formError, setFormError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [closingPollId, setClosingPollId] = useState<string | null>(null);

    const changeOption = (optionIndex: number, nextOption: string) =>
        setOptions((currentOptions) =>
            currentOptions.map((currentOption, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? nextOption : currentOption,
            ),
        );

    const removeOption = (optionIndex: number) =>
        setOptions((currentOptions) => currentOptions.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex));

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedQuestion = question.trim();
        const trimmedOptions = options.map((option) => option.trim());
        if (!trimmedQuestion || trimmedOptions.some((option) => !option)) {
            setFormError('Napište otázku a každou možnost.');
            return;
        }
        if (new Set(trimmedOptions.map((option) => option.toLowerCase())).size !== trimmedOptions.length) {
            setFormError('Každá možnost musí být jiná.');
            return;
        }

        setFormError(null);
        setIsCreating(true);
        const isCreated = await onCreate({ question: trimmedQuestion, options: trimmedOptions });
        setIsCreating(false);
        if (isCreated) {
            setQuestion('');
            setOptions(['', '']);
        }
    };

    const handleClose = async (pollId: string) => {
        if (!window.confirm('Opravdu hlasování ukončit? Výsledky zůstanou členům viditelné.')) {
            return;
        }

        setClosingPollId(pollId);
        await onClose(pollId);
        setClosingPollId((currentPollId) => (currentPollId === pollId ? null : currentPollId));
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <Vote className="h-5 w-5 text-cyan-600" /> Ankety komunity
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        Členové mohou zvolit jednu možnost a svůj hlas změnit, dokud anketu neukončíte. Vidí pouze
                        součty, ne to, kdo kterou možnost vybral.
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {polls.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Zatím není vytvořená žádná anketa.
                    </p>
                ) : (
                    polls.map((poll) => (
                        <div key={poll.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-slate-950">{poll.question}</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {getWorkshopPollVoteCount(poll)} hlasů ·{' '}
                                        {poll.isClosed ? 'Hlasování ukončeno' : 'Hlasování probíhá'}
                                    </p>
                                </div>
                                {!poll.isClosed && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={closingPollId === poll.id}
                                        onClick={() => void handleClose(poll.id)}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        {closingPollId === poll.id ? 'Ukončuji…' : 'Ukončit hlasování'}
                                    </Button>
                                )}
                            </div>
                            <ol className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                                {poll.options.map((option) => (
                                    <li key={option.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                                        <span className="min-w-0 break-words">{option.label}</span>
                                        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                                            {option.voteCount}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-dashed border-cyan-300 bg-cyan-50/50 p-5">
                <h3 className="font-semibold text-slate-950">Nová anketa</h3>
                <label className="mt-4 block text-sm font-medium text-slate-700">
                    Otázka
                    <Input
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        maxLength={500}
                        placeholder="Například: Kterému tématu se máme věnovat příště?"
                        className="mt-1.5 bg-white"
                    />
                </label>
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Možnosti</p>
                    {options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                                value={option}
                                onChange={(event) => changeOption(optionIndex, event.target.value)}
                                maxLength={200}
                                placeholder={`Možnost ${optionIndex + 1}`}
                                className="bg-white"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={options.length <= MINIMAL_OPTION_COUNT}
                                onClick={() => removeOption(optionIndex)}
                                aria-label={`Odebrat možnost ${optionIndex + 1}`}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={options.length >= MAXIMAL_OPTION_COUNT}
                        onClick={() => setOptions((currentOptions) => [...currentOptions, ''])}
                    >
                        <CirclePlus className="mr-2 h-4 w-4" /> Přidat možnost
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                        <Send className="mr-2 h-4 w-4" /> {isCreating ? 'Vytvářím…' : 'Vytvořit anketu'}
                    </Button>
                </div>
                {formError !== null && <p className="mt-3 text-sm text-red-700">{formError}</p>}
            </form>
        </section>
    );
}
