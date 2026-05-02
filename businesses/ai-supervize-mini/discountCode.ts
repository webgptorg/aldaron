import { aiSupervizeMiniWorkshopConfig } from '@/businesses/ai-supervize-mini/config';

export function normalizeAiSupervizeMiniDiscountCode(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
}

export function getAiSupervizeMiniDiscountCode(value: string) {
    const normalizedDiscountCode = normalizeAiSupervizeMiniDiscountCode(value);

    if (!normalizedDiscountCode) {
        return null;
    }

    return aiSupervizeMiniWorkshopConfig.discount.validCodeRegex.test(normalizedDiscountCode)
        ? normalizedDiscountCode
        : null;
}
