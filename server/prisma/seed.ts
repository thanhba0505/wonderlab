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
    },
    create: {
      username,
      email,
      passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  console.log(`[Seed] Seeded admin user: ${admin.username} (Role: ${admin.role})`);
}

main()
  .catch(e => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
