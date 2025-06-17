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
    const { comment, trip_id } = await req.json();

    if (!comment) {
      return NextResponse.json({ error: 'Comment and trip_id are required.' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('reviews')
      .insert([{ user_id : user.id, user_email : user.email, user_name : user.user_metadata.name, trip_id, comment }]);

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
    const trip_id = req.nextUrl.searchParams.get('trip_id');
    if (trip_id){
        const { data, error: fetchError } = await supabase
            .from('reviews')
            .select('*')
            .eq('trip_id', trip_id)
            .order('created_at', { ascending: false });

        if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }
        return NextResponse.json(data, { status: 200 });
    } else {
        const { data, error: fetchError } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }
        return NextResponse.json(data, { status: 200 });

    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
