import { NextResponse } from 'next/server';
import { getDb, ensureSchema } from '@/lib/db';

export async function GET() {
  try {
    await ensureSchema();
    const db = getDb();
    await db.execute('SELECT 1');

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch {
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 });
  }
}
