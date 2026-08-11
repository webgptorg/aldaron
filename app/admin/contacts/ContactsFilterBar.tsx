'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ContactedFilterValue, ContactsFilter, PresenceFilterValue } from '@/lib/contacts/filterContacts';
import { EMPTY_CONTACTS_FILTER, isContactsFilterActive } from '@/lib/contacts/filterContacts';
import { X } from 'lucide-react';
import { LabeledFilterField, LabeledFilterSelect, type FilterSelectOption } from './FilterControls';

/**
 * Options shared by every filter which only asks whether a value is filled in
 */
const PRESENCE_FILTER_OPTIONS: readonly FilterSelectOption<PresenceFilterValue>[] = [
    { value: 'ANY', label: 'Any' },
    { value: 'PRESENT', label: 'Filled in' },
    { value: 'MISSING', label: 'Missing' },
];

const CONTACTED_FILTER_OPTIONS: readonly FilterSelectOption<ContactedFilterValue>[] = [
    { value: 'ANY', label: 'All contacts' },
    { value: 'NOT_CONTACTED', label: 'Not contacted yet' },
    { value: 'CONTACTED', label: 'Already contacted' },
];

type ContactsFilterBarProps = {
    readonly filter: ContactsFilter;
    readonly onChangeFilter: (filter: ContactsFilter) => void;
};

/**
 * Everything the user can narrow the shown contacts down by
 */
export function ContactsFilterBar(props: ContactsFilterBarProps) {
    const { filter, onChangeFilter } = props;

    const changeFilter = (filterChanges: Partial<ContactsFilter>) => onChangeFilter({ ...filter, ...filterChanges });

    return (
        <div className="mb-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <LabeledFilterField label="Fulltext search" className="lg:col-span-2">
                    <Input
                        type="search"
                        placeholder="Search in name, email, note, url, ..."
                        value={filter.searchQuery}
                        onChange={(changeEvent) => changeFilter({ searchQuery: changeEvent.target.value })}
                    />
                </LabeledFilterField>
                <LabeledFilterField label="Created from">
                    <Input
                        type="date"
                        max={filter.createdToDate || undefined}
                        value={filter.createdFromDate}
                        onChange={(changeEvent) => changeFilter({ createdFromDate: changeEvent.target.value })}
                    />
                </LabeledFilterField>
                <LabeledFilterField label="Created to">
                    <Input
                        type="date"
                        min={filter.createdFromDate || undefined}
                        value={filter.createdToDate}
                        onChange={(changeEvent) => changeFilter({ createdToDate: changeEvent.target.value })}
                    />
                </LabeledFilterField>
                <LabeledFilterSelect
                    label="Contacted"
                    value={filter.contactedStatus}
                    options={CONTACTED_FILTER_OPTIONS}
                    onChange={(contactedStatus) => changeFilter({ contactedStatus })}
                />
                <LabeledFilterSelect
                    label="Email"
                    value={filter.emailPresence}
                    options={PRESENCE_FILTER_OPTIONS}
                    onChange={(emailPresence) => changeFilter({ emailPresence })}
                />
                <LabeledFilterSelect
                    label="Phone"
                    value={filter.phonePresence}
                    options={PRESENCE_FILTER_OPTIONS}
                    onChange={(phonePresence) => changeFilter({ phonePresence })}
                />
                <LabeledFilterSelect
                    label="User note"
                    value={filter.userNotePresence}
                    options={PRESENCE_FILTER_OPTIONS}
                    onChange={(userNotePresence) => changeFilter({ userNotePresence })}
                />
            </div>
            {isContactsFilterActive(filter) && (
                <Button className="mt-3" variant="ghost" size="sm" onClick={() => onChangeFilter(EMPTY_CONTACTS_FILTER)}>
                    <X className="mr-1 h-4 w-4" />
                    Clear all filters
                </Button>
            )}
        </div>
    );
}
