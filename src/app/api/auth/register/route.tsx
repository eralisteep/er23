import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name} = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password and name are required.' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role : 'user',
          name
         }
      },
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Registration error' }, { status: 400 });
    }

    // 2. Добавляем пользователя в свою таблицу users
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, role : 'user', name }]);

    if (insertError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }


  // Сохраняем токены в supabase-куки
  if (!data.session) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 500 });
  }

  // Сохраняем токены в supabase-куки
  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.json({ user: data.user, session: data.session });
  response.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: isProd, // secure: false на localhost!
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: isProd,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}