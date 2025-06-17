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
        const locationId = req.nextUrl.pathname.split('/').pop() || '';
        const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
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
        const locationId = req.nextUrl.pathname.split('/').pop() || '';
        const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 204 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}