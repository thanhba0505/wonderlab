import { NextResponse } from 'next/server';
import pkg from '../../../package.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'wonderlab-client',
    timestamp: new Date().toISOString(),
    version: pkg.version,
  });
}
