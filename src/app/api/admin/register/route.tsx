import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
      const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;


  try {
    const { email, password, role, name } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, name and role are required.' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name },
      },
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Registration error' }, { status: 400 });
    }

    // 2. Добавляем пользователя в свою таблицу users
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, role, name }]);

    if (insertError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
      const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

  try {
    const { data, error: selectError } = await supabase
      .from('users')
      .select('*')
      .order('role', { ascending: true });

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}