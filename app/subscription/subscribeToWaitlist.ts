import { APP_NAME } from '@/config';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe an email address to the waitlist
 *
 * @param email - The email address to subscribe to the waitlist
 * @param placeName - Name of the place where the popup is triggered (to measure effectiveness)
 */
export async function subscribeToWaitlist(email: string, placeName: string) {
    // Get additional data for tracking
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
    const referrer = typeof window !== 'undefined' ? document.referrer : undefined;

    const { error: supabaseError } = await supabase.from('WaitlistContact').insert([
        {
            email,
            userAgent,
            referrer,
            // Note: ipAddress would need to be handled server-side for security

            appName: APP_NAME,
            placeName,
        },
    ]);

    if (supabaseError) {
        throw new Error(supabaseError.message);
    }
}
