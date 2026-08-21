import {
    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
    getAiSupervizeMiniWorkshopDateById,
} from '@/businesses/ai-supervize-mini/config';
import { loadAiSupervizeMiniActiveDiscount } from '@/businesses/ai-supervize-mini/discountCodeDatabase';
import {
    createAiSupervizeMiniStoredWorkshopRegistration,
    createAiSupervizeMiniWorkshopAvailabilityAfterRegistration,
    createAiSupervizeMiniWorkshopPrice,
    createAiSupervizeMiniWorkshopRegistrationContactNote,
    getAiSupervizeMiniWorkshopAvailabilityByDateId,
    type AiSupervizeMiniInvoiceType,
    type AiSupervizeMiniWorkshopRegistrationRequest,
} from '@/businesses/ai-supervize-mini/workshopRegistration';
import { loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable } from '@/businesses/ai-supervize-mini/workshopRegistrationDatabase';
import { APP_NAME } from '@/config';
import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { MAXIMAL_CONTACT_TEXT_LENGTH } from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_REGISTRATION_ERROR_MESSAGE = 'Vyplňte prosím všechny povinné údaje správně.';
const REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE = 'Registraci se nepodařilo uložit. Zkuste to prosím znovu.';
const AVAILABILITY_NOT_LOADED_ERROR_MESSAGE = 'Aktuální počet volných míst se nepodařilo ověřit. Zkuste to prosím znovu.';
const DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.';

function readTextValue(value: unknown): string | null {
    return typeof value === 'string' && value.length <= MAXIMAL_CONTACT_TEXT_LENGTH ? value : null;
}

function readRequiredTextValue(value: unknown): string | null {
    const textValue = readTextValue(value);

    return textValue === null || textValue.trim() === '' ? null : textValue;
}

function readInvoiceType(value: unknown): AiSupervizeMiniInvoiceType | null {
    return value === 'company' || value === 'individual' ? value : null;
}

function readParticipantCount(value: unknown): number | null {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function readAiSupervizeMiniWorkshopRegistrationRequest(
    body: Readonly<Record<string, unknown>>,
): AiSupervizeMiniWorkshopRegistrationRequest | null {
    const selectedDateId = readTextValue(body.selectedDateId);
    const participantCount = readParticipantCount(body.participantCount);
    const fullname = readRequiredTextValue(body.fullname);
    const email = readRequiredTextValue(body.email);
    const company = readRequiredTextValue(body.company);
    const invoiceType = readInvoiceType(body.invoiceType);
    const billingDetails = readRequiredTextValue(body.billingDetails);
    const userNote = readTextValue(body.userNote);
    const discountCode = readTextValue(body.discountCode);

    if (
        selectedDateId === null ||
        participantCount === null ||
        fullname === null ||
        email === null ||
        !isEmailAddressValid(email) ||
        company === null ||
        invoiceType === null ||
        billingDetails === null ||
        userNote === null ||
        discountCode === null
    ) {
        return null;
    }

    return {
        selectedDateId,
        participantCount,
        fullname,
        email,
        company,
        invoiceType,
        billingDetails,
        userNote,
        discountCode,
    };
}

function getFullWorkshopErrorMessage(remainingSeatCount: number): string {
    return remainingSeatCount === 0
        ? 'Tento termín už je obsazený.'
        : `V tomto termínu zbývá už jen ${remainingSeatCount} míst.`;
}

/**
 * Store the registration only after querying the current contact records again.
 * The client-side capacity is a convenience; this server-side check is the one
 * that decides whether a registration still fits into the workshop.
 */
export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);

    if (body === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const registrationRequest = readAiSupervizeMiniWorkshopRegistrationRequest(body);
    const workshopDate =
        registrationRequest === null ? null : getAiSupervizeMiniWorkshopDateById(registrationRequest.selectedDateId);

    if (registrationRequest === null || workshopDate === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    if (registrationRequest.participantCount > workshopDate.maximumParticipantCount) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();

    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { workshopAvailabilities, errorMessage } = await loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable(
        contactsTable,
    );

    if (workshopAvailabilities === null) {
        console.error('Failed to load AI Supervize Mini workshop availability before registration:', errorMessage);
        return NextResponse.json({ error: AVAILABILITY_NOT_LOADED_ERROR_MESSAGE }, { status: 500 });
    }

    const workshopAvailability = getAiSupervizeMiniWorkshopAvailabilityByDateId(
        workshopAvailabilities,
        workshopDate.id,
    );

    if (
        workshopAvailability === null ||
        registrationRequest.participantCount > workshopAvailability.remainingSeatCount
    ) {
        return NextResponse.json(
            {
                error: getFullWorkshopErrorMessage(workshopAvailability?.remainingSeatCount ?? 0),
                workshopAvailabilities,
            },
            { status: 409 },
        );
    }

    const { activeDiscount, errorMessage: discountCodeErrorMessage } = await loadAiSupervizeMiniActiveDiscount(
        registrationRequest.discountCode,
    );
    if (discountCodeErrorMessage !== null) {
        console.error('Failed to validate AI Supervize Mini registration discount code:', discountCodeErrorMessage);
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE }, { status: 503 });
    }

    const storedRegistration = createAiSupervizeMiniStoredWorkshopRegistration(
        registrationRequest,
        workshopDate,
        activeDiscount,
    );
    const contactNote = createAiSupervizeMiniWorkshopRegistrationContactNote(storedRegistration);

    if (contactNote.length > MAXIMAL_CONTACT_TEXT_LENGTH) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const { contact, errorMessage: insertErrorMessage } = await insertContact(contactsTable, {
        fullname: registrationRequest.fullname,
        email: registrationRequest.email,
        userNote: contactNote,
        placeName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
        appName: APP_NAME,
        userAgent: request.headers.get('user-agent'),
        ipAddress: readClientIpAddress(request),
        url: request.headers.get('referer'),
    });

    if (contact === null) {
        console.error('Failed to write AI Supervize Mini workshop registration:', insertErrorMessage);
        return NextResponse.json({ error: REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({
        workshopAvailabilities: createAiSupervizeMiniWorkshopAvailabilityAfterRegistration(
            workshopAvailabilities,
            workshopDate.id,
            registrationRequest.participantCount,
        ),
        workshopPrice: createAiSupervizeMiniWorkshopPrice(
            workshopDate,
            registrationRequest.participantCount,
            activeDiscount,
        ),
    });
}
