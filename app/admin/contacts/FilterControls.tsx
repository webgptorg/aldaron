'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ReactNode } from 'react';

type LabeledFilterFieldProps = {
    readonly label: string;
    readonly className?: string;
    readonly children: ReactNode;
};

/**
 * One labeled control of the filter bar
 */
export function LabeledFilterField(props: LabeledFilterFieldProps) {
    const { label, className, children } = props;

    return (
        <div className={`flex flex-col gap-1 ${className || ''}`}>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            {children}
        </div>
    );
}

/**
 * One option of a filter select
 */
export type FilterSelectOption<TValue extends string> = {
    readonly value: TValue;
    readonly label: string;
};

type LabeledFilterSelectProps<TValue extends string> = {
    readonly label: string;
    readonly value: TValue;
    readonly options: readonly FilterSelectOption<TValue>[];
    readonly onChange: (value: TValue) => void;
    readonly className?: string;
};

/**
 * One labeled select of the filter bar, shared by every filter which picks one value out of a few
 */
export function LabeledFilterSelect<TValue extends string>(props: LabeledFilterSelectProps<TValue>) {
    const { label, value, options, onChange, className } = props;

    return (
        <LabeledFilterField label={label} className={className}>
            <Select value={value} onValueChange={(newValue) => onChange(newValue as TValue)}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </LabeledFilterField>
    );
}
