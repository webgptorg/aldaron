import type {
    AiSupervizeMiniDiscountCode,
    AiSupervizeMiniDiscountCodeValues,
} from '@/businesses/ai-supervize-mini/discountCode';

const AI_SUPERVIZE_MINI_ADMIN_DISCOUNT_CODES_API_PATH = '/api/admin/ai-supervize-mini/discount-codes';

type AiSupervizeMiniDiscountCodeResponse = {
    readonly discountCode?: AiSupervizeMiniDiscountCode;
    readonly error?: unknown;
};

type AiSupervizeMiniDiscountCodeListResponse = {
    readonly discountCodes?: readonly AiSupervizeMiniDiscountCode[];
    readonly error?: unknown;
};

function buildAiSupervizeMiniDiscountCodeAdminApiUrl(discountCodeId?: string): string {
    return discountCodeId === undefined
        ? AI_SUPERVIZE_MINI_ADMIN_DISCOUNT_CODES_API_PATH
        : `${AI_SUPERVIZE_MINI_ADMIN_DISCOUNT_CODES_API_PATH}/${encodeURIComponent(discountCodeId)}`;
}

async function requestAiSupervizeMiniDiscountCodeJson<ResponseBody>(
    url: string,
    requestOptions?: RequestInit,
): Promise<ResponseBody> {
    const response = await fetch(url, { ...requestOptions, cache: 'no-store' });
    const responseBody = (await response.json().catch(() => ({}))) as ResponseBody & { readonly error?: unknown };
    if (!response.ok) {
        throw new Error(
            typeof responseBody.error === 'string' ? responseBody.error : 'Discount-code administration request failed',
        );
    }

    return responseBody;
}

function createAiSupervizeMiniDiscountCodeMutation(
    method: 'POST' | 'PATCH',
    values: AiSupervizeMiniDiscountCodeValues,
): RequestInit {
    return {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    };
}

export async function fetchAdminAiSupervizeMiniDiscountCodes(): Promise<readonly AiSupervizeMiniDiscountCode[]> {
    const response = await requestAiSupervizeMiniDiscountCodeJson<AiSupervizeMiniDiscountCodeListResponse>(
        buildAiSupervizeMiniDiscountCodeAdminApiUrl(),
    );

    return response.discountCodes ?? [];
}

export async function createAdminAiSupervizeMiniDiscountCode(
    values: AiSupervizeMiniDiscountCodeValues,
): Promise<AiSupervizeMiniDiscountCode> {
    const response = await requestAiSupervizeMiniDiscountCodeJson<AiSupervizeMiniDiscountCodeResponse>(
        buildAiSupervizeMiniDiscountCodeAdminApiUrl(),
        createAiSupervizeMiniDiscountCodeMutation('POST', values),
    );
    if (response.discountCode === undefined) {
        throw new Error('Discount-code administration returned no discount code');
    }

    return response.discountCode;
}

export async function updateAdminAiSupervizeMiniDiscountCode(
    discountCodeId: string,
    values: AiSupervizeMiniDiscountCodeValues,
): Promise<AiSupervizeMiniDiscountCode> {
    const response = await requestAiSupervizeMiniDiscountCodeJson<AiSupervizeMiniDiscountCodeResponse>(
        buildAiSupervizeMiniDiscountCodeAdminApiUrl(discountCodeId),
        createAiSupervizeMiniDiscountCodeMutation('PATCH', values),
    );
    if (response.discountCode === undefined) {
        throw new Error('Discount-code administration returned no discount code');
    }

    return response.discountCode;
}

export async function deleteAdminAiSupervizeMiniDiscountCode(discountCodeId: string): Promise<void> {
    await requestAiSupervizeMiniDiscountCodeJson(buildAiSupervizeMiniDiscountCodeAdminApiUrl(discountCodeId), {
        method: 'DELETE',
    });
}
