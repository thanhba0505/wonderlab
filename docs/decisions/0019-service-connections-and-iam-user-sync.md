# 0019. Service Connections & Central Gateway IAM User Sync

- **Status**: Accepted
- **Date**: 2026-11-08
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

In earlier iterations, Wonderlab maintained user accounts (including password hashes and local credential verification) independently, while communicating with Central Gateway using static environment variables (`GATEWAY_URL`, `GATEWAY_SECRET_KEY`).

This presented several architectural limitations:

1. **Scattered Identity Management**: User credentials and status were bifurcated between Wonderlab and Central Gateway, preventing seamless single sign-on (SSO) and unified account lifecycle management (e.g., global deactivation, profile updates).
2. **Brittle Configuration via Environment Variables**: Backend services required hardcoded target URLs and secrets in environment configurations. Updating an endpoint, port, or API prefix necessitated redeployment across multiple dependent services.
3. **Rigid Service-to-Service (S2S) Boundaries**: Calling across services lacked a standard registry for timeouts, active status, outbound API keys, and incoming authentication tokens.

---

## Architectural Decision

### 1. Database-Driven Service Discovery (`service_connections`)

We introduced the `service_connections` table across both Central Gateway and Wonderlab to manage all service-to-service connections dynamically:

```prisma
model ServiceConnection {
  id             String    @id @default(uuid())
  slug           String    @unique @db.VarChar(64)
  name           String    @db.VarChar(128)
  domain         String    @db.VarChar(255)
  apiPrefix      String    @default("/api/v1") @map("api_prefix") @db.VarChar(64)
  apiKey         String?   @map("api_key") @db.VarChar(255)
  incomingSecret String?   @map("incoming_secret") @db.VarChar(255)
  isActive       Boolean   @default(true) @map("is_active")
  timeoutMs      Int       @default(10000) @map("timeout_ms")
  metadata       Json?
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@map("service_connections")
}
```

- **Separation of Domain and API Prefix**: Domain (e.g., `http://localhost:5101`, `https://central-gateway-server.onrender.com`) is decoupled from API prefix (e.g., `/api/v1`).
- **Asymmetric Key Pairs**: Outbound requests attach `apiKey` via `Authorization: Bearer <apiKey>`, while incoming requests are validated against `incomingSecret`.
- **Soft Deactivation**: Services are toggled via `isActive = true/false` rather than hard deleted, preventing orphaned logs or broken dependencies.
- **CORS Scope Clarification**: S2S communication occurs server-to-server and does not traverse web browsers. CORS is strictly scoped to frontend clients via `CORS_ORIGINS`, avoiding redundant database queries on boot.

### 2. Centralized IAM & Local Shadow User Model

- **Central Gateway as Master IAM**: All user registration, password changes, profile editing, and account status management (`isActive = true/false`) occur directly on Central Gateway.
- **Wonderlab Shadow User**: Wonderlab maintains a shadow user table storing:
  - `id`: Exact UUID issued by Central Gateway.
  - `username`, `email`, `avatarUrl`, `role` (`ADMIN` | `USER`), and `isActive`.
  - Local password hashes are deprecated / optional, eliminating local credential storage.
- **Foreign Key Consistency**: Preserves referential integrity for Wonderlab domain data (`simulation_runs`, `comments`, and `simulation_requests`) without distributed joins.
- **Immediate Session Revocation**: If a user is deactivated (`isActive: false`) in Central Gateway, subsequent JWT verification in Wonderlab's `JwtStrategy` immediately blocks access.

### 3. S2S User Sync Handshake

When user profile information or active status is updated on Central Gateway:

1. Central Gateway updates its master `users` record.
2. Central Gateway queries active connections with `metadata.syncUser = true` and dispatches `POST /api/v1/internal/users/sync`.
3. Wonderlab's `S2SAuthGuard` authenticates the request using constant-time token comparison (`crypto.timingSafeEqual`) against `service_connections.incomingSecret`.
4. Wonderlab's `InternalUsersController` upserts the shadow user record.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Admin
    participant GW as Central Gateway IAM
    participant DB_GW as Gateway Database
    participant WL as Wonderlab Server
    participant DB_WL as Wonderlab Database

    User->>GW: Update Profile / Toggle Status
    GW->>DB_GW: Persist User Changes
    GW->>WL: POST /api/v1/internal/users/sync (Bearer S2S Key)
    WL->>WL: S2SAuthGuard (timingSafeEqual)
    WL->>DB_WL: Upsert Shadow User (id, username, email, role, isActive)
    WL-->>GW: 200 OK (Sync Acknowledged)
    GW-->>User: 200 OK (Profile Updated)
```

---

## Consequences

### Positive

- **Zero Environment Duplication**: Wonderlab backend no longer requires `GATEWAY_URL` or `GATEWAY_SECRET_KEY` in environment configurations.
- **Unified Identity**: Users have a single account across the ecosystem, authenticated via OAuth2 PKCE SSO.
- **Robust S2S Security**: Timing-safe bearer authentication with configurable timeouts per connected service.
- **Local Autonomy**: Wonderlab can query and display user profiles and maintain relational data without making synchronous HTTP calls on every read.

### Negative & Mitigations

- **Eventual Consistency on Network Glitches**: If Wonderlab is temporarily unreachable during sync, Central Gateway logs the error in `dispatch_logs`.
- **Read-Only Connections in UI**: Service connections are managed via migrations and seeds; runtime editing is currently frozen to avoid configuration drift.
