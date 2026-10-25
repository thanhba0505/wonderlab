---
name: nestjs-backend
description: NestJS architecture patterns, validation, Swagger documentation, and health monitoring standards for Wonderlab backend services.
---

# NestJS Backend Engineering Standards

## 1. Modular Architecture

- Structure modules cleanly under `src/<feature>/`:
  - `<feature>.module.ts`: Declares controllers, providers, and exports.
  - `<feature>.controller.ts`: Handles HTTP routing, parameters, status codes, and Swagger decorators.
  - `<feature>.service.ts`: Encapsulates business logic.
  - `dto/`: Data Transfer Objects decorated with `class-validator` and `class-transformer`.
- Avoid bloated root `AppModule`; only import feature modules and configuration.

## 2. API Design & Routing

- Global prefix: `/api/v1` configured in `main.ts` via `app.setGlobalPrefix('api/v1')`.
- Health Check: `GET /api/v1/health` providing service name, status, and ISO timestamp.
- Swagger UI: Accessible at `/api/docs` in development mode.
- CORS: Strict whitelist from `CORS_ORIGINS` environment variable.

## 3. Validation & Exception Handling

- Enable `ValidationPipe` globally with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Return standardized JSON error formats with HTTP status codes.
- Never leak stack traces, internal paths, or credentials in error responses.

## 4. Strict Type Safety & Zero-`any` Standard

- Strictly zero `any` (enforced by `@typescript-eslint/no-explicit-any: error`).
- Complete DTO classes decorated with `class-validator` and `class-transformer` properties.
- Explicit method parameter and return type signatures on all services, controllers, and helpers.
- Never use untyped `Record<string, any>` or bypass type checks.

## 5. Scope Discipline

- Do not create unrequested CRUD modules, user management, auth guards, or database providers until explicitly requested.
- Keep the server lightweight and extensible.
