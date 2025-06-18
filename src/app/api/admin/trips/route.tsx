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
    const { start_date, end_date, price, title, description } = await req.json();

    if (!start_date || !end_date || !price || !title || !description) {
      return NextResponse.json({ error: 'all colums are required.' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('trips')
      .insert([{ user_id : user.id, start_date, end_date, price, title, description }]);

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
        const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: true });
    
        if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
        }
    
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
        const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

    try {
        const tripId = req.nextUrl.pathname.split('/').pop() || '';
        const { title, description, start_date, end_date, price } = await req.json();

        const { data, error } = await supabase
        .from('trips')
        .update({ title, description, start_date, end_date, price })
        .eq('id', tripId)
        .select('*');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}