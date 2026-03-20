import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str } from '@/lib/db';

export async function GET(req: NextRequest) {
  const businessId = new URL(req.url).searchParams.get('businessId') || '';
  if (!businessId) return NextResponse.json({});

  try {
    await ensureSchema();
    const db = getDb();

    const result = await db.execute({
      sql: 'SELECT company_name, brand_color FROM branding WHERE user_id = ?',
      args: [businessId],
    });

    if (!result.rows[0]) return NextResponse.json({});

    return NextResponse.json({
      company_name: str(result.rows[0].company_name),
      brand_color:  str(result.rows[0].brand_color),
    });
  } catch {
    return NextResponse.json({});
  }
}
