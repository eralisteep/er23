import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

  try {
    const { trip_id, name, lat, lng, order } = await req.json();

    if (
      trip_id === undefined ||
      name === undefined ||
      lat === undefined ||
      lng === undefined ||
      order === undefined
    ) {
      return NextResponse.json({ error: 'all columns are required.' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('locations')
      .insert([{ trip_id, name, lat, lng, order }]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

  try {
    const { data, error: selectError } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true });

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
