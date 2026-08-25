import {
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    getCommunityMembershipPaidPlan,
    type CommunityMembershipBillingCycle,
} from '@/businesses/community/membership/membershipConfig';
import {
    COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME,
    createCommunityMembershipRegistrationContactNote,
    createStoredCommunityMembershipRegistration,
    type CommunityMembershipRegistrationRequest,
} from '@/businesses/community/membership/membershipRegistration';
import { APP_NAME } from '@/config';
import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { MAXIMAL_CONTACT_TEXT_LENGTH } from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { consumeDiscountCode } from '@/lib/discounts/discountCodeDatabase';
import { EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE } from '@/lib/discounts/discountCodeMessages';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_REGISTRATION_ERROR_MESSAGE = 'Vyplňte prosím jméno, platný e-mail a vyberte členství.';
const REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE = 'Přihlášku se nepodařilo uložit. Zkuste to prosím znovu.';
const DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.';

function readTextValue(value: unknown): string | null {
    return typeof value === 'string' && value.length <= MAXIMAL_CONTACT_TEXT_LENGTH ? value : null;
}

function readRequiredTextValue(value: unknown): string | null {
    const textValue = readTextValue(value)?.trim();

    return textValue ? textValue : null;
}

function readBillingCycle(value: unknown): CommunityMembershipBillingCycle | null {
    return value === 'monthly' || value === 'yearly' ? value : null;
}

function readCommunityMembershipRegistrationRequest(
    body: Readonly<Record<string, unknown>>,
): CommunityMembershipRegistrationRequest | null {
    const planId = readTextValue(body.planId);
    const billingCycle = readBillingCycle(body.billingCycle);
    const fullname = readRequiredTextValue(body.fullname);
    const email = readRequiredTextValue(body.email);
    const discountCode = readTextValue(body.discountCode);

    if (
        planId === null ||
        billingCycle === null ||
        fullname === null ||
        email === null ||
        !isEmailAddressValid(email) ||
        discountCode === null
    ) {
        return null;
    }

    return { planId, billingCycle, fullname, email, discountCode };
}

/**
 * Stores an application for a paid membership. The page does not pretend to charge a visitor:
 * it reserves the server-calculated quote so the membership team can send the activation link.
 */
export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);
    const registrationRequest = body === null ? null : readCommunityMembershipRegistrationRequest(body);
    const plan = registrationRequest === null ? null : getCommunityMembershipPaidPlan(registrationRequest.planId);

    if (registrationRequest === null || plan === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    // A limited code is consumed atomically with its remaining-use check. The saved quote then
    // contains exactly the discount the applicant is entitled to when their activation is completed.
    const discountCodeConsumption = await consumeDiscountCode(registrationRequest.discountCode, plan.discountPlaceId);
    if (discountCodeConsumption.errorMessage !== null) {
        console.error('Failed to validate community membership discount code:', discountCodeConsumption.errorMessage);
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE }, { status: 503 });
    }
    if (discountCodeConsumption.status === 'exhausted') {
        return NextResponse.json({ error: EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE }, { status: 409 });
    }

    const activeDiscount = discountCodeConsumption.activeDiscount;
    const storedRegistration = createStoredCommunityMembershipRegistration(registrationRequest, plan, activeDiscount);
    const contactNote = createCommunityMembershipRegistrationContactNote(storedRegistration);
    if (contactNote.length > MAXIMAL_CONTACT_TEXT_LENGTH) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const { contact, errorMessage } = await insertContact(contactsTable, {
        fullname: registrationRequest.fullname,
        email: registrationRequest.email,
        userNote: contactNote,
        placeName: COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME,
        appName: APP_NAME,
        userAgent: request.headers.get('user-agent'),
        ipAddress: readClientIpAddress(request),
        url: request.headers.get('referer'),
    });
    if (contact === null) {
        console.error('Failed to write community membership registration:', errorMessage);
        return NextResponse.json({ error: REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({
        membershipPrice: createCommunityMembershipPrice(plan, registrationRequest.billingCycle, activeDiscount),
        planName: plan.name,
        trialDays: COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    });
}
