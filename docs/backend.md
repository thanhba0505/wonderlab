# Backend Architecture & Guidelines — Wonderlab

## 1. Stack & Principles

- **Framework**: NestJS 10.
- **Protocol**: RESTful JSON over HTTP/1.1 (and HTTP/2 on production reverse proxies).
- **Global API Prefix**: `/api/v1`.
- **Validation**: `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.
- **API Documentation**: OpenAPI / Swagger UI accessible at `/api/docs` in development mode.
- **Health Checks**: `@nestjs/terminus` / custom health controller at `/api/v1/health`.

---

## 2. Directory Layout

```text
server/
├── src/
│   ├── health/
│   │   ├── dto/
│   │   │   └── health-response.dto.ts  # Standardized response contract
│   │   ├── health.controller.ts        # GET /api/v1/health
│   │   ├── health.controller.spec.ts   # Unit test
│   │   └── health.module.ts
│   ├── app.module.ts                   # Root application module
│   └── main.ts                         # Bootstrap entry point with CORS, Swagger, pipes
├── test/
│   ├── app.e2e-spec.ts                 # Full HTTP pipeline E2E test
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

## 4. How to Add New Modules in the Future

When business requirements arise (e.g., puzzle scoring or user experiments):

1. Generate module structure: `nest g module <feature>`, `nest g controller <feature>`, `nest g service <feature>`.
2. Define DTOs using `class-validator` and `@ApiProperty()` Swagger decorators.
3. Keep business domain logic cleanly isolated inside services; controllers must strictly handle HTTP transport.
4. Import the new feature module into `AppModule`.
