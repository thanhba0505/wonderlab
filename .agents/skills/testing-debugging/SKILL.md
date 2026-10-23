---
name: testing-debugging
description: Testing standards, smoke testing procedures, and systematic debugging methodologies for Wonderlab client and server.
---

# Testing & Debugging Playbook

## 1. Testing Pyramid for Wonderlab

- **Backend Unit Tests (Jest)**: Unit tests for controllers, services, and DTO validators (`*.spec.ts`).
- **Backend E2E Tests (Supertest)**: End-to-end tests validating the full NestJS HTTP pipeline (`/test/*.e2e-spec.ts`), including health checks and route prefixing.
- **Frontend Unit & Component Tests**: Utility and simulation state testing. Ensure mathematical accuracy of paradoxes and interactive components.
- **Smoke Tests**: Automated script (`scripts/smoke-test.sh`) verifying HTTP 200 on all primary public routes, health endpoints, and Swagger UI.

## 2. Systematic Debugging Rules

- **Reproduce First**: Never apply speculative fixes without first running a failing test or observing the exact error trace.
- **Check Boundaries**: Verify environment variable loading, port bindings (4100 vs 4101), CORS headers, and JSON serialization.
- **No Test Circumvention**: Do not skip tests (`it.skip`), silence TypeScript errors (`@ts-ignore`), or disable linter rules without justification.
