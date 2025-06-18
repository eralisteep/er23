import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
        const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

    try {
        const tripId = Number(req.nextUrl.pathname.split('/').pop() || '');
        const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .order('created_at', { ascending: true });
    
        if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
        }
    
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
        const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

    try {
        const tripId = Number(req.nextUrl.pathname.split('/').pop() || '');
        const { error: locError } = await supabase
            .from('locations')
            .delete()
            .eq('trip_id', tripId);

        if (locError) {
            return NextResponse.json({ error: locError.message }, { status: 500 });
        }

        const { error: revError } = await supabase
            .from('reviews')
            .delete()
            .eq('trip_id', tripId);

        if (revError) {
            return NextResponse.json({ error: revError.message }, { status: 500 });
        }

        const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 204 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
        const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

    try {
        const tripId = Number(req.nextUrl.pathname.split('/').pop() || '');
        const { title, description, start_date, end_date, price } = await req.json();

        if (!title || !description || !start_date || !end_date || !price) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('trips')
            .update({ title, description, start_date, end_date, price })
            .eq('id', tripId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}