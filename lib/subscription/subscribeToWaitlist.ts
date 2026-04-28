import { APP_NAME } from '@/config';
import { supabase } from '@/lib/supabase';

/**
 * Fetch the user's IP address from a public API
 */
async function fetchIpAddress(): Promise<string | null> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = (await response.json()) as { ip: string };
        return data.ip || null;
    } catch (error) {
        console.error('Failed to fetch IP address:', error);
        return null;
    }
}

type SubscribeToWaitlistOptions = {
    fullname?: string;
    email: string;
    placeName: string;
    phone?: string;
    note?: string;
};

/**
 * Subscribe an email address to the waitlist
 *
 * @param email - The email address to subscribe to the waitlist
 * @param placeName - Name of the place where the popup is triggered (to measure effectiveness)
 * @param phone - Optional phone number
 * @param note - Optional notes (e.g., selected plan)
 */
export async function subscribeToWaitlist(options: SubscribeToWaitlistOptions) {
    const { fullname, email, placeName, phone, note } = options;

    // Get additional data for tracking
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
    const referrer = typeof window !== 'undefined' ? document.referrer : undefined;

    // Fetch IP address
    const ipAddress = await fetchIpAddress();

    if (!supabase) {
        console.warn('Supabase not configured - subscription skipped');
        return;
    }

    const { error: supabaseError } = await supabase.from('Contact').insert([
        {
            fullname: fullname || null,
            email: email || null,
            phone: phone || null,

            userAgent,
            referrer,
            ipAddress,

            appName: APP_NAME,
            placeName,
            url: window.location.href,
            userNote: note || null,

            isContacted: false,
        },
    ]);

    if (supabaseError) {
        throw new Error(supabaseError.message);
    }
}
