import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function requireAuth(req: NextRequest, role?: string) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    return { user: null, error: NextResponse.json({ error: 'Not authorized' }, { status: 401 }) };
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
  if (role) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    if (userData?.role !== role) {
      return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
  }
  return { user: data.user, error: null };
}