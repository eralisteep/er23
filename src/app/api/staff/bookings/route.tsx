import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req, 'staff');
  if (error) return error;

  try {
    const { data, error: selectError } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
