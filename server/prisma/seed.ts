import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const isProd = process.env.NODE_ENV === 'production';
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@wonderlab.local';
  const rawPassword = process.env.SEED_ADMIN_PASSWORD;

  if (isProd && !rawPassword) {
    console.warn(
      '[Seed] Warning: SEED_ADMIN_PASSWORD is not configured in production. Skipping admin seed to prevent default credentials.',
    );
    return;
  }

  const effectivePassword = rawPassword || 'Admin@Wonderlab2026!';

  // Hash password using Argon2id with OWASP recommended configuration
  const passwordHash = await argon2.hash(effectivePassword, {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      username,
      email,
      passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log(`[Seed] Seeded admin user: ${admin.username} (Role: ${admin.role})`);

  // Seed Central Gateway S2S connection
  const gatewayConn = await prisma.serviceConnection.upsert({
    where: { slug: 'central-gateway' },
    update: {
      name: 'Central Gateway & IAM Master',
      domain: process.env.GATEWAY_API_DOMAIN || 'http://localhost:5101',
      apiPrefix: process.env.GATEWAY_API_PREFIX || '/api/v1',
      corsOrigin: process.env.GATEWAY_CLIENT_ORIGIN || 'http://localhost:5100',
      apiKey: process.env.GATEWAY_S2S_KEY || 'wl_to_gw_s2s_secret_2026',
      incomingSecret: process.env.GATEWAY_INCOMING_SECRET || 'gw_to_wl_s2s_secret_2026',
      isActive: true,
      metadata: { iamMaster: true, ssoProvider: true },
    },
    create: {
      slug: 'central-gateway',
      name: 'Central Gateway & IAM Master',
      domain: process.env.GATEWAY_API_DOMAIN || 'http://localhost:5101',
      apiPrefix: process.env.GATEWAY_API_PREFIX || '/api/v1',
      corsOrigin: process.env.GATEWAY_CLIENT_ORIGIN || 'http://localhost:5100',
      apiKey: process.env.GATEWAY_S2S_KEY || 'wl_to_gw_s2s_secret_2026',
      incomingSecret: process.env.GATEWAY_INCOMING_SECRET || 'gw_to_wl_s2s_secret_2026',
      isActive: true,
      metadata: { iamMaster: true, ssoProvider: true },
    },
  });

  console.log(`[Seed] Seeded service connection: ${gatewayConn.name} (${gatewayConn.slug})`);
}

main()
  .catch(e => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
