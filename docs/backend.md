# Backend Architecture & Guidelines — Wonderlab

## 1. Stack & Principles

- **Framework**: NestJS 10.
- **Protocol**: RESTful JSON over HTTP/1.1 (and HTTP/2 on production reverse proxies).
- **ORM**: Prisma ORM (v6.x) connected to PostgreSQL 16 (Local) / Neon Serverless PostgreSQL (Production).
- **Security**:
  - `helmet`: Comprehensive HTTP security headers (CSP, frameguard, no-sniff).
  - `cookie-parser`: Secure parsing of HttpOnly session cookies.
  - `@nestjs/throttler`: Rate limiting and brute-force protection (max 5 attempts/min on login).
  - `argon2`: OWASP-compliant memory-hard password hashing (Argon2id).
- **Global API Prefix**: `/api/v1`.
- **Validation**: `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.
- **API Documentation**: OpenAPI / Swagger UI accessible at `/api/docs` in development mode.
- **Health Checks**: `@nestjs/terminus` / custom health controller at `/api/v1/health`.

---

## 2. Directory Layout

```text
server/
├── prisma/
│   ├── schema.prisma               # Database models and enum definitions
│   ├── seed.ts                     # Database seeder (Argon2 administrative user)
│   └── migrations/                 # Version-controlled SQL migration scripts
├── src/
│   ├── auth/                       # Authentication, JWT strategy, HttpOnly cookies
│   │   ├── decorators/             # @Public(), @Roles(), @CurrentUser()
│   │   ├── dto/                    # LoginDto, AuthResponseDto
│   │   ├── guards/                 # JwtAuthGuard, RolesGuard
│   │   ├── strategies/             # JwtStrategy (cookie & bearer extractor)
│   │   ├── auth.controller.ts      # /login, /logout, /me
│   │   ├── auth.service.ts         # Password validation, cookie issuance
│   │   └── auth.module.ts
│   ├── users/                      # User entity access layer
│   │   ├── users.service.ts        # Database user queries (with SafeUser typing)
│   │   └── users.module.ts
│   ├── prisma/                     # Global Prisma database service
│   │   ├── prisma.service.ts       # Connection lifecycle management
│   │   └── prisma.module.ts
│   ├── s2s/                        # Service-to-Service communication & client
│   │   ├── s2s-auth.guard.ts       # Timing-safe S2S Bearer token guard
│   │   ├── s2s.service.ts          # S2S client caller & connection lookup
│   │   └── s2s.module.ts           # @Global() S2S module
│   ├── simulations/                # Simulation run persistence & global telemetry
│   │   ├── dto/                    # CreateSimulationRunDto, History & Stats Query DTOs
│   │   ├── simulations.controller.ts # POST /runs, GET /stats, GET /runs/history
│   │   ├── simulations.service.ts  # Database aggregations & run storage
│   │   └── simulations.module.ts
│   ├── health/
│   │   ├── dto/
│   │   │   └── health-response.dto.ts  # Standardized response contract
│   │   ├── health.controller.ts        # GET /api/v1/health
│   │   ├── health.controller.spec.ts   # Unit test
│   │   └── health.module.ts
│   ├── app.module.ts                   # Root application module
│   └── main.ts                         # Bootstrap entry point with CORS, Swagger, pipes
├── test/
│   ├── app.e2e-spec.ts                 # Health HTTP pipeline E2E test
│   ├── auth.e2e-spec.ts                # Login, cookie, and guard security E2E test
│   └── jest-e2e.json                   # Jest E2E test configuration
├── nest-cli.json
└── package.json
```

---

## 3. Health Endpoint Contract

### `GET /api/v1/health`

**Success Response (200 OK)**:

```json
{
  "status": "ok",
  "service": "wonderlab-server",
  "database": "connected",
  "timestamp": "2026-11-07T07:47:23.318Z",
  "version": "0.13.1",
  "commit": "6ce7a4f49271dc10a6110f55ef2b3280cbd8c37c"
}
```

### Guarantees:

- Validates active database connectivity against PostgreSQL / Neon.
- Never exposes internal stack traces, filesystem paths, or database credentials.
- Utilized by Render, Kubernetes, or container orchestrators as a liveness and readiness probe.

---

## 4. Simulations & Telemetry API Contract

### `POST /api/v1/simulations/runs`

Persists empirical results from an execution run (e.g., Monte Carlo 1,000 or 10,000 rooms).

- **Headers**: `x-session-id: string` (Anonymous UUID session token from Client).
- **Body**:
  ```json
  {
    "simulationSlug": "birthday-paradox",
    "parameters": { "groupSize": 23 },
    "results": {
      "collisions": 5074,
      "empiricalProbability": 0.5074,
      "theoreticalProbability": 0.5073
    },
    "trialsCount": 10000,
    "durationMs": 142
  }
  ```
- **Response**: `201 Created` returns the created record and accumulated system-wide trial metrics.

### `GET /api/v1/simulations/stats`

Aggregates system-wide simulation statistics for live telemetry counters and administrative dashboard metrics.

- **Query params**: `simulationSlug?: string`
- **Response (200 OK)**:
  ```json
  {
    "totalRuns": 42,
    "totalTrials": 38450000,
    "bySimulation": {
      "birthday-paradox": { "runs": 25, "trials": 22400000, "lastRunAt": "2026-10-24T12:30:00Z" },
      "monty-hall": { "runs": 17, "trials": 16050000, "lastRunAt": "2026-10-24T12:15:00Z" }
    },
    "updatedAt": "2026-10-24T12:30:05.120Z"
  }
  ```

### `GET /api/v1/simulations/runs/history`

Retrieves the recent run history for the active client session.

- **Headers / Query**: `x-session-id: string`, `limit?: number` (defaults to 20, max 100).
- **Response**: Array of `SimulationRunRecord` objects.

---

## 5. Service-to-Service (S2S) & Central Gateway BFF Auth Proxy

Wonderlab integrates with Central Gateway via dynamic database-backed connections (`service_connections` table).

### BFF Auth Proxy Architecture

- **Delegated Credentials Verification**: Wonderlab acts as a BFF proxy forwarding authentication (`/auth/login`, `/auth/google`, `/auth/register`) to Central Gateway Master IAM via outbound `s2sService.call(...)`.
- **Zero Redundant Fallbacks**: Password verification and master credentials are owned strictly by Central Gateway. Wonderlab does not keep fallback password verification.
- **Local Shadow Profiles**: Successful logins upsert a local profile in Wonderlab (`id`, `username`, `email`, `role`, `avatarUrl`, `isActive`) ensuring all foreign keys (`comments`, `simulation_runs`, `simulation_requests`) remain valid.
- **Offline JWT Verification**: Authenticated sessions are issued as Wonderlab HttpOnly cookies. Every subsequent request is verified offline in memory via `JwtStrategy` with 0 network calls to Central Gateway.
  ```json
  {
    "success": true,
    "user": {
      "id": "cd0ad32d-bfb0-4819-9ba1-e5e6e3c7db34",
      "username": "thanhba",
      "email": "thanhba@example.com",
      "role": "USER",
      "isActive": true
    }
  }
  ```

### S2S Outbound Client (`S2SService`)

To communicate with other services without hardcoding hostnames or tokens in environment files:

```typescript
const result = await this.s2sService.call<ResponseType>(
  'central-gateway',
  '/notifications/slack/community',
  {
    method: 'POST',
    body: JSON.stringify(payload),
  },
);
```

The service dynamically resolves `domain` and `apiPrefix`, injects `Authorization: Bearer <apiKey>`, and enforces timeout boundaries from the database.

---

## 6. Adding New Backend Modules

When introducing new domain modules (e.g., puzzle scoring or user experiments):

1. Generate module structure: `nest g module <feature>`, `nest g controller <feature>`, `nest g service <feature>`.
2. Define DTOs using `class-validator` and `@ApiProperty()` Swagger decorators.
3. Keep business domain logic cleanly isolated inside services; controllers must strictly handle HTTP transport.
4. Import the new feature module into `AppModule`.
