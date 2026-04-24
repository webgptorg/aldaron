import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { clickId } = (await request.json()) as { clickId?: number };

        if (!clickId || typeof clickId !== 'number') {
            return new NextResponse('clickId is required and must be a number', { status: 400 });
        }

        const { error } = await supabase
            .from('ShortcodeLinkClick')
            .update({ clickedAt: new Date().toISOString() })
            .eq('id', clickId);

        if (error) {
            console.error('Error updating click:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
