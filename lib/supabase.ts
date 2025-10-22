import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('!!! supabaseUrl', supabaseUrl);
console.log('!!! supabaseAnonKey', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export function getSupabaseForBrowser() {
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export type WaitlistContact = {
    id: string;
    createdAt: string;
    email: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
};

/*
CREATE TABLE IF NOT EXISTS "WaitlistContact" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL,
    userAgent TEXT,
    ipAddress INET,
    referrer TEXT
);
*/
