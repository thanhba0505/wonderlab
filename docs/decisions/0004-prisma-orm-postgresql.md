# 4. Selection of Prisma ORM, PostgreSQL & Argon2 Authentication

Date: 2026-10-24
Status: Accepted

## Context

Following the initial foundation phase (ADR 0003), Wonderlab required its first persistent domain capabilities:

- User identity management with role-based access control (`Role.ADMIN`).
- Production-grade authentication with defense against brute-force attacks and OWASP Top 10 vulnerabilities.
- Reliable schema migrations and type safety between the database and the NestJS application.

## Decision

We selected **Prisma ORM (v6.x)** for PostgreSQL persistence and **Argon2id** with **HttpOnly Cookies** for authentication:

1. **Prisma ORM**:
   - Declarative `schema.prisma` provides intuitive data modeling and automatic TypeScript type generation.
   - Built-in migration engine (`prisma migrate dev`) tracks schema evolution deterministically in version control.
   - 100% parameterized queries eliminate SQL injection vulnerabilities.
   - Seamless seeding workflow (`prisma db seed`) for initial administrative bootstrapping.

2. **Argon2id Password Hashing**:
   - Uses memory-hard Argon2id (OWASP recommended standard) over legacy bcrypt, resisting GPU/ASIC brute-force cracking.
   - Integrated with dummy hash verification to equalize timing and mitigate user enumeration attacks.

3. **HttpOnly Cookie JWT Strategy**:
   - Issues JWT session tokens strictly inside `httpOnly`, `sameSite: 'lax'`, `secure` cookies.
   - Prevents JavaScript access, neutralizing Cross-Site Scripting (XSS) token exfiltration.
   - Supported with `@nestjs/throttler` (max 5 login attempts/min) to prevent brute-force attacks.

## Consequences

- Backend connects to PostgreSQL on `127.0.0.1:5434` in local development via `DATABASE_URL`.
- `server/prisma/` manages database migrations and seeds.
- NestJS `PrismaModule`, `UsersModule`, and `AuthModule` provide authenticated endpoints (`/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`).
