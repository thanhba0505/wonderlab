# Backend Architecture & Guidelines — Wonderlab

## 1. Stack & Principles

- **Framework**: NestJS 10.
- **Protocol**: RESTful JSON over HTTP/1.1 (and HTTP/2 on production reverse proxies).
- **ORM**: Prisma ORM (v6.x) connected to PostgreSQL 16.
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
  "timestamp": "2026-10-23T06:04:21.155Z",
  "version": "1.0.0"
}
```

### Guarantees:

- Never exposes internal stack traces, filesystem paths, or database credentials.
- Can be used by Render, Kubernetes, or container orchestrators as a liveness/readiness probe.

---

## 4. Simulations & Telemetry API Contract

### `POST /api/v1/simulations/runs`

Ghi nhận kết quả của một đợt chạy mô phỏng (ví dụ: Monte Carlo 1.000 hoặc 10.000 phòng).

- **Headers**: `x-session-id: string` (UUID phiên ẩn danh từ Client).
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
- **Response**: `201 Created` trả về bản ghi kèm tổng số phép thử tích lũy mới của phòng lab và toàn hệ thống.

### `GET /api/v1/simulations/stats`

Truy vấn thống kê tổng hợp toàn cầu phục vụ Live Telemetry Counter và Admin Dashboard.

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

Lấy danh sách các lượt chạy gần nhất của phiên người dùng hiện tại.

- **Headers / Query**: `x-session-id: string`, `limit?: number` (mặc định 20, tối đa 100).
- **Response**: Mảng danh sách các bản ghi `SimulationRunRecord`.

---

## 5. How to Add New Modules in the Future

When business requirements arise (e.g., puzzle scoring or user experiments):

1. Generate module structure: `nest g module <feature>`, `nest g controller <feature>`, `nest g service <feature>`.
2. Define DTOs using `class-validator` and `@ApiProperty()` Swagger decorators.
3. Keep business domain logic cleanly isolated inside services; controllers must strictly handle HTTP transport.
4. Import the new feature module into `AppModule`.
