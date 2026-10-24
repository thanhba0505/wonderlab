# 0010. User Authentication, 6-Digit Email OTP & Google OAuth Account Linking

- **Status**: Accepted
- **Date**: 2026-10-24
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

Wonderlab required a unified authentication architecture to support regular users and administrative staff:

1. Public visitors need seamless onboarding via Email/Password or Google OAuth.
2. Email registration requires verification via a 6-digit numeric OTP token with 60-second cooldown rate limiting.
3. Users who sign up with Email and later log in via Google with the same email address must be automatically linked rather than rejected or duplicated.
4. Users registered initially via Google must be able to set a personal password to enable standard email login.
5. Forgotten passwords must be recoverable via 6-digit email OTP.
6. The public header must cleanly present an authentication/profile button (replacing "Bắt đầu trải nghiệm"), while the Admin Console (`/admin`) must have an isolated technical header and strictly NO public footer. Guests must not see admin links in header or footer.

---

## Architectural Decision

### 1. Data Model (`server/prisma/schema.prisma`)

- Extended `User` model:
  - `passwordHash String?` (nullable for Google-only users)
  - `googleId String? @unique`
  - `isEmailVerified Boolean @default(false)`
  - `avatarUrl String?`
  - `role Role @default(USER)`
- Created `OtpToken` model:
  - `id String @id @default(uuid())`
  - `email String`
  - `code String @db.VarChar(6)`
  - `type OtpType` (`REGISTER_VERIFY` | `RESET_PASSWORD`)
  - `expiresAt DateTime` (15 minutes lifespan)
  - `usedAt DateTime?`
  - `userId String?`
  - `createdAt DateTime @default(now())`

### 2. OTP Token Management (`OtpService`)

- Generates 6-digit cryptographically secure numeric codes (`100000` to `999999`).
- Enforces 60-second cooldown per email/type before allowing another code to be generated.
- Invalidation on verification (`usedAt = now()`).

### 3. Account Linking & Security (`AuthService`)

- **Auto-linking**: When logging in via Google, if a user with that email already exists, `googleId` is bound to the existing record and `isEmailVerified` is marked `true`.
- **Argon2id hashing**: OWASP recommended configuration for all passwords.
- **Timing attack defense**: Unregistered usernames verify against a dummy hash to equalize processing latency.
- **HttpOnly Cookie**: Issues JWT tokens via `access_token` cookie (`httpOnly: true`, `sameSite: 'lax'`, `path: '/'`).

### 4. Layout Isolation & Shell Separation (`AppShell`)

- Client `AppShell` conditionally routes layouts:
  - On `/admin`: Renders `AdminHeader`, `{children}`, and NO `Footer`.
  - On public routes: Renders public `Header`, `{children}`, `Footer`, `AuthModal`, and `UserProfileModal`.
- Public header: Replaces "Bắt đầu trải nghiệm" with "Đăng nhập" (guest) or interactive user account menu (authenticated).
- Footer: Admin link is conditionally rendered only when `user?.role === 'ADMIN'`.

---

## Consequences

- **Positive**:
  - Frictionless user onboarding with instant Google login or verified email signup.
  - Zero duplicate accounts when users transition between Google and email login.
  - Strict boundary between admin portal and public user experience.
  - Fully test-covered with NestJS unit & E2E integration tests.
