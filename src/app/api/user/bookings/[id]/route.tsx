import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(req: NextRequest) {
        const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

    try {
        const bookingId = req.nextUrl.pathname.split('/').pop() || '';
        const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 204 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}