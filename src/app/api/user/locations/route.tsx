import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const trip_id = req.nextUrl.searchParams.get('trip_id');
    if (!trip_id) {
      return NextResponse.json({ error: 'trip_id is required.' }, { status: 400 });
    }

    const { data, error: selectError } = await supabase
      .from('locations')
      .select('*')
      .eq('trip_id', trip_id)
      .order('created_at', { ascending: true });

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
