import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Получаем токен из cookie вручную
  const token = req.cookies.get('sb-access-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const user = data.user;

  const pathname = req.nextUrl.pathname;

  // Проверка для /admin
  if (pathname.startsWith('/admin')) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Проверка для /staff
  if (pathname.startsWith('/staff')) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (userData?.role !== 'staff') {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Проверка для /dashboard (любой авторизованный)
  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/dashboard/:path*'],
};