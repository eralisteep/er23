import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  // Получаем токен из cookie
  const token = req.cookies.get('sb-access-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No token provided.' }, { status: 401 });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }

  return NextResponse.json({ user: data.user }, { status: 200 });
}