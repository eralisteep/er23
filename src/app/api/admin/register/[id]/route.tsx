import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/utils/requireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Изменить роль пользователя и в user_metadata, и в таблице users
export async function PUT(req: NextRequest) {
  // Получаем params асинхронно!
  // @ts-ignore
  const { params } = await req;
  const id = params.id;
  const { user, error } = await requireAuth(req, 'admin');
  if (error) return error;

  const { role } = await req.json();
  if (!role) {
    return NextResponse.json({ error: 'role is required' }, { status: 400 });
  }

  // 1. Обновить роль в user_metadata
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { role },
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 2. Обновить роль в таблице users
  const { error: dbError } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true});
}
