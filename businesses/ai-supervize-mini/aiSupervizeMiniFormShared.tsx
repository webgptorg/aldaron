'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SharedFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
    error?: string | null;
    showValidation?: boolean;
    autoComplete?: string;
    type?: string;
    className?: string;
    inputClassName?: string;
};

type SharedTextareaProps = SharedFieldProps & {
    minHeightClassName?: string;
};

type SubmitAiSupervizeMiniLeadOptions = {
    fullname: string;
    email: string;
    placeName: string;
    summaryTitle: string;
    summaryLines: string[];
    payload: Record<string, unknown>;
};

export function isValidEmail(value: string) {
    return emailPattern.test(value);
}

export async function submitAiSupervizeMiniLead(options: SubmitAiSupervizeMiniLeadOptions) {
    const { fullname, email, placeName, summaryTitle, summaryLines, payload } = options;

    const contactNote = [summaryTitle, ...summaryLines, '', JSON.stringify(payload, null, 4)].join('\n');

    await subscribeToWaitlist({
        fullname,
        email,
        placeName,
        note: contactNote,
    });
}

export function AiSupervizeMiniTextField({
    id,
    label,
    value,
    onChange,
    placeholder,
    description,
    error,
    showValidation,
    autoComplete,
    type = 'text',
    className,
    inputClassName,
}: SharedFieldProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label}
            </label>
            <Input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-invalid={showValidation && !!error}
                className={cn(
                    'mt-2 h-11',
                    showValidation && error && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                    inputClassName,
                )}
                autoComplete={autoComplete}
            />
            {showValidation && error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : (
                description && <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
        </div>
    );
}

export function AiSupervizeMiniTextareaField({
    id,
    label,
    value,
    onChange,
    placeholder,
    description,
    error,
    showValidation,
    className,
    inputClassName,
    minHeightClassName = 'min-h-[96px]',
}: SharedTextareaProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label}
            </label>
            <Textarea
                id={id}
                name={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-invalid={showValidation && !!error}
                className={cn(
                    'mt-2',
                    minHeightClassName,
                    showValidation && error && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                    inputClassName,
                )}
            />
            {showValidation && error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : (
                description && <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
        </div>
    );
}

export function AiSupervizeMiniErrorAlert({ message }: { message: string }) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>;
}

export function AiSupervizeMiniSuccessState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
    );
}
