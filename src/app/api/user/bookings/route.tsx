import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
      const { user, error } = await requireAuth(req);
  if (error) return error;
  
  try {
    const { date, trip_id, trip_title, details } = await req.json();

    if (!date || !trip_id || !trip_title) {
      return NextResponse.json({ error: 'all colums are required.' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('bookings')
      .insert([{ user_id : user.id, user_email : user.email, date, trip_id, trip_title, details }]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
      const { user, error } = await requireAuth(req);
  if (error) return error;


    try {
        const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
    
        if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
        }
    
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
