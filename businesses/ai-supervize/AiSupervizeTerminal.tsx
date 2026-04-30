'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type AiSupervizeTerminalMetric = {
    metric: string;
    before: number;
    after: number;
    unit: string;
};

type AiSupervizeTerminalProps = {
    className?: string;
    titleBarText?: string;
    commandName?: string;
    commandAction?: string;
    commandArgs?: string;
    initializingText?: string;
    okLines?: string[];
    reportTitle?: string;
    reportSubtitle?: string;
    doneText?: string;
    metrics?: AiSupervizeTerminalMetric[];
    height?: number;
};

const DEFAULT_METRICS: AiSupervizeTerminalMetric[] = [
    { metric: 'Čas do merge', before: 5.2, after: 3.1, unit: ' dny' },
    { metric: 'Rework kódu', before: 28, after: 15, unit: ' %' },
    { metric: 'Code review', before: 3.8, after: 2.2, unit: ' hod' },
    { metric: 'Bugy / sprint', before: 8, after: 4, unit: '' },
];

const BAR_W = 24;
const SEP = '─'.repeat(52);

function asciiBar(value: number, fill: number, maxValue: number): string {
    const filled = Math.round((value / maxValue) * BAR_W * fill);
    return '█'.repeat(filled) + '░'.repeat(BAR_W - filled);
}

type TLine = {
    key: string;
    delay: number;
    node: (fill: number) => ReactNode;
};

function buildLines({
    commandName,
    commandAction,
    commandArgs,
    initializingText,
    okLines,
    reportTitle,
    reportSubtitle,
    doneText,
    metrics,
}: Required<Omit<AiSupervizeTerminalProps, 'className' | 'titleBarText' | 'height'>>): TLine[] {
    const maxValue = Math.max(...metrics.map((m) => m.before), 1);

    return [
        {
            key: 'cmd',
            delay: 0,
            node: () => (
                <span>
                    <span className="text-emerald-400">❯ </span>
                    <span className="text-white">{commandName}</span>
                    <span className="text-slate-300"> {commandAction}</span>
                    <span className="text-cyan-400"> {commandArgs}</span>
                </span>
            ),
        },
        { key: 'b0', delay: 200, node: () => <span>&nbsp;</span> },
        {
            key: 'init',
            delay: 600,
            node: () => <span className="text-slate-400"> {initializingText}</span>,
        },
        ...okLines.map((line, index) => ({
            key: `ok${index}`,
            delay: index === 0 ? 700 : index === 1 ? 450 : 550,
            node: () => (
                <span>
                    <span className="text-slate-600"> [</span>
                    <span className="text-emerald-400">✓</span>
                    <span className="text-slate-600">]</span>
                    <span className="text-slate-400"> {line}</span>
                </span>
            ),
        })),
        { key: 'b1', delay: 300, node: () => <span>&nbsp;</span> },
        { key: 'sep1', delay: 150, node: () => <span className="text-slate-700">{SEP}</span> },
        {
            key: 'hdr',
            delay: 80,
            node: () => (
                <span>
                    <span className="text-slate-600"> </span>
                    <span className="text-cyan-400 font-bold">{reportTitle}</span>
                    <span className="text-slate-600"> · {reportSubtitle}</span>
                </span>
            ),
        },
        { key: 'sep2', delay: 80, node: () => <span className="text-slate-700">{SEP}</span> },
        { key: 'b2', delay: 200, node: () => <span>&nbsp;</span> },
        ...metrics.flatMap((m, i) => [
            {
                key: `m${i}-label`,
                delay: i === 0 ? 200 : 350,
                node: () => <span className="text-slate-300"> {m.metric}</span>,
            },
            {
                key: `m${i}-before`,
                delay: 60,
                node: (fill: number) => (
                    <span>
                        <span className="text-slate-600"> before </span>
                        <span className="text-slate-500">{asciiBar(m.before, fill, maxValue)}</span>
                        <span className="text-slate-500">
                            {' '}
                            {m.before}
                            {m.unit}
                        </span>
                    </span>
                ),
            },
            {
                key: `m${i}-after`,
                delay: 40,
                node: (fill: number) => (
                    <span>
                        <span className="text-slate-600"> after </span>
                        <span className="text-cyan-400">{asciiBar(m.after, fill, maxValue)}</span>
                        <span className="text-cyan-300">
                            {' '}
                            {m.after}
                            {m.unit}
                        </span>
                        <span className="text-emerald-400"> −{Math.round((1 - m.after / m.before) * 100)}%</span>
                    </span>
                ),
            },
            { key: `m${i}-b`, delay: 60, node: () => <span>&nbsp;</span> },
        ]),
        { key: 'sep3', delay: 150, node: () => <span className="text-slate-700">{SEP}</span> },
        ...metrics.map((m, i) => ({
            key: `s${i}`,
            delay: 130,
            node: () => (
                <span>
                    <span className="text-emerald-400"> ✓ </span>
                    <span className="text-slate-400" style={{ display: 'inline-block', minWidth: '14ch' }}>
                        {m.metric}
                    </span>
                    <span className="text-slate-500">
                        {m.before}
                        {m.unit}
                    </span>
                    <span className="text-slate-600"> → </span>
                    <span className="text-cyan-300">
                        {m.after}
                        {m.unit}
                    </span>
                    <span className="text-emerald-400"> −{Math.round((1 - m.after / m.before) * 100)} %</span>
                </span>
            ),
        })),
        { key: 'b3', delay: 200, node: () => <span>&nbsp;</span> },
        {
            key: 'done',
            delay: 300,
            node: () => <span className="text-slate-400"> {doneText}</span>,
        },
    ];
}

function TerminalMetrics(props: Required<Omit<AiSupervizeTerminalProps, 'className' | 'titleBarText'>>) {
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [barFill, setBarFill] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lines = useMemo(() => buildLines(props), [props]);
    const barStartStep = lines.findIndex((l) => l.key === 'm0-before');

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started || step >= lines.length) return;
        const id = setTimeout(() => setStep((s) => s + 1), lines[step]!.delay);
        return () => clearTimeout(id);
    }, [started, step, lines]);

    useEffect(() => {
        if (step < barStartStep || barFill >= 1) return;
        const id = setInterval(() => setBarFill((f) => Math.min(1, f + 1 / BAR_W)), 38);
        return () => clearInterval(id);
    }, [step, barStartStep, barFill]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [step]);

    return (
        <div
            ref={containerRef}
            style={{
                height: `${props.height}px`,
                overscrollBehavior: 'contain',
            }}
            className="scrollbar-none max-w-full overflow-x-auto overflow-y-auto font-mono text-[11px] leading-[1.65] sm:text-xs"
        >
            {lines.slice(0, step).map((line) => (
                <div key={line.key}>{line.node(barFill)}</div>
            ))}
            <div className="flex items-center">
                {step >= lines.length && <span className="text-emerald-400 mr-1">❯ </span>}
                <span className="inline-block w-[7px] h-[13px] bg-slate-400 animate-pulse" />
            </div>
        </div>
    );
}

export function AiSupervizeTerminal({
    className = '',
    titleBarText = 'promptbook-supervize - bash - 80×24',
    commandName = 'promptbook-supervize',
    commandAction = 'analyze',
    commandArgs = '--sprint 12 --compare baseline',
    initializingText = 'Initializing Promptbook AI Supervision v2.4.1...',
    okLines = ['Configuration loaded', 'Fetching sprint metrics', 'Baseline comparison ready'],
    reportTitle = 'METRICS REPORT',
    reportSubtitle = 'sprint-12 vs baseline',
    doneText = 'Analysis complete. Ready for supervision setup.',
    metrics = DEFAULT_METRICS,
    height = 420,
}: AiSupervizeTerminalProps) {
    const terminalProps = {
        commandName,
        commandAction,
        commandArgs,
        initializingText,
        okLines,
        reportTitle,
        reportSubtitle,
        doneText,
        metrics,
        height,
    };

    return (
        <div
            className={`min-w-0 overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950 shadow-2xl ${className}`}
        >
            <div className="flex items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-3 flex-1 truncate text-center font-mono text-xs text-slate-500 select-none">
                    {titleBarText}
                </span>
            </div>

            <div className="p-5">
                <TerminalMetrics {...terminalProps} />
            </div>
        </div>
    );
}
