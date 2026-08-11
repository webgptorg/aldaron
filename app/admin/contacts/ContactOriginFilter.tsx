'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    hasSelectedContactPlaceNames,
    isContactAppNameSelected,
    isContactPlaceNameSelected,
    setContactAppNameSelected,
    setContactPlaceNameSelected,
    type ContactOriginGroup,
    type ContactOriginName,
    type ContactOriginSelection,
} from '@/lib/contacts/contactOrigins';
import { ChevronDown } from 'lucide-react';
import { LabeledFilterField } from './FilterControls';

const ALL_CONTACT_ORIGINS_LABEL = 'All app names and place names';
const MISSING_APP_NAME_LABEL = 'No app name';
const MISSING_PLACE_NAME_LABEL = 'No place name';

type ContactOriginFilterProps = {
    readonly contactOriginGroups: readonly ContactOriginGroup[];
    readonly selectedContactOrigins: readonly ContactOriginSelection[];
    readonly onChangeSelectedContactOrigins: (selections: readonly ContactOriginSelection[]) => void;
    readonly className?: string;
};

type ContactOriginCheckboxProps = {
    readonly id: string;
    readonly label: string;
    readonly checked: boolean | 'indeterminate';
    readonly isDisabled?: boolean;
    readonly onChange: () => void;
    readonly className?: string;
};

/**
 * Human-readable label for an origin name which may be missing on old contacts
 */
function getContactOriginNameLabel(originName: ContactOriginName, missingNameLabel: string): string {
    return originName ?? missingNameLabel;
}

/**
 * The summary shown while the origin selector is closed
 */
function getSelectedContactOriginsLabel(selections: readonly ContactOriginSelection[]): string {
    return selections.length === 0 ? ALL_CONTACT_ORIGINS_LABEL : `${selections.length} selected`;
}

/**
 * One accessible checkbox row used by the all, app-name, and place-name choices
 */
function ContactOriginCheckbox(props: ContactOriginCheckboxProps) {
    const { id, label, checked, isDisabled = false, onChange, className } = props;

    return (
        <div className={`flex items-center gap-2 ${className ?? ''}`}>
            <Checkbox id={id} checked={checked} disabled={isDisabled} onCheckedChange={onChange} />
            <label
                htmlFor={id}
                className={`min-w-0 cursor-pointer break-words text-sm ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                {label}
            </label>
        </div>
    );
}

/**
 * Grouped multi-selector of app names and the place names which belong to them
 */
export function ContactOriginFilter(props: ContactOriginFilterProps) {
    const { contactOriginGroups, selectedContactOrigins, onChangeSelectedContactOrigins, className } = props;
    const selectedContactOriginsLabel = getSelectedContactOriginsLabel(selectedContactOrigins);

    return (
        <LabeledFilterField label="App name / place name" className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between font-normal">
                        <span className="truncate">{selectedContactOriginsLabel}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] p-0">
                    <div className="border-b p-3 text-sm text-muted-foreground">
                        Choose an app name to include all of its places, or choose individual places.
                    </div>
                    <div className="max-h-80 overflow-y-auto p-3">
                        <ContactOriginCheckbox
                            id="contact-origin-all"
                            label={ALL_CONTACT_ORIGINS_LABEL}
                            checked={selectedContactOrigins.length === 0}
                            onChange={() => onChangeSelectedContactOrigins([])}
                        />
                        {contactOriginGroups.map((contactOriginGroup, groupIndex) => {
                            const { appName, placeNames } = contactOriginGroup;
                            const isWholeAppNameSelected = isContactAppNameSelected(selectedContactOrigins, appName);
                            const isAppNamePartiallySelected = hasSelectedContactPlaceNames(
                                selectedContactOrigins,
                                appName,
                            );
                            const appNameCheckboxState = isWholeAppNameSelected
                                ? true
                                : isAppNamePartiallySelected
                                  ? 'indeterminate'
                                  : false;
                            const appNameId = `contact-origin-app-name-${groupIndex}`;

                            return (
                                <div key={appNameId} className="mt-3 border-t pt-3 first:mt-3">
                                    <ContactOriginCheckbox
                                        id={appNameId}
                                        label={getContactOriginNameLabel(appName, MISSING_APP_NAME_LABEL)}
                                        checked={appNameCheckboxState}
                                        onChange={() =>
                                            onChangeSelectedContactOrigins(
                                                setContactAppNameSelected(
                                                    selectedContactOrigins,
                                                    appName,
                                                    !isWholeAppNameSelected,
                                                ),
                                            )
                                        }
                                        className="font-medium"
                                    />
                                    <div className="mt-2 space-y-2 pl-6">
                                        {placeNames.map((placeName, placeIndex) => {
                                            const isPlaceNameSelected = isContactPlaceNameSelected(
                                                selectedContactOrigins,
                                                appName,
                                                placeName,
                                            );
                                            const placeNameId = `${appNameId}-place-name-${placeIndex}`;

                                            return (
                                                <ContactOriginCheckbox
                                                    key={placeNameId}
                                                    id={placeNameId}
                                                    label={getContactOriginNameLabel(placeName, MISSING_PLACE_NAME_LABEL)}
                                                    checked={isWholeAppNameSelected || isPlaceNameSelected}
                                                    isDisabled={isWholeAppNameSelected}
                                                    onChange={() =>
                                                        onChangeSelectedContactOrigins(
                                                            setContactPlaceNameSelected(
                                                                selectedContactOrigins,
                                                                appName,
                                                                placeName,
                                                                !isPlaceNameSelected,
                                                            ),
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </LabeledFilterField>
    );
}
