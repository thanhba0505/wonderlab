import { NextResponse } from 'next/server';
import clientPkg from '../../../package.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  const commit =
    process.env.RENDER_GIT_COMMIT ||
    process.env.NEXT_PUBLIC_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    undefined;

  return NextResponse.json({
    status: 'ok',
    service: 'wonderlab-client',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || clientPkg.version || '0.4.0',
    ...(commit ? { commit } : {}),
  });
}
