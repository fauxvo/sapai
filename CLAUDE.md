# SAPAI Project Guidelines

## Project Overview

Monorepo (`bun` workspaces + Turborepo) wrapping SAP S/4HANA OData APIs with a typed Hono REST API. Three packages: `api` (Hono backend), `dashboard` (frontend), `shared`.

## Package Manager

- Use `bun` for all package operations (`bun install`, `bun run build`)
- Exception: use `npm test` for running tests (not `bun test`)

## Tech Stack (packages/api)

- **Runtime**: Hono on Bun
- **OpenAPI**: `@hono/zod-openapi` — routes define Zod schemas, OpenAPI 3.1 spec auto-generated
- **SAP Integration**: SAP Cloud SDK generated OData clients in `src/generated/`
- **Validation**: Zod schemas throughout
- **Testing**: Vitest
- **Linting**: ESLint 9 flat config + Prettier (single quotes, trailing commas, 80 char width)

## Architecture Patterns

- **BaseService** (`src/services/base/BaseService.ts`): All SAP service classes extend this. Provides `execute()` wrapper with SAP error parsing and CSRF handling.
- **Service layer**: One service class per SAP entity group. Module-level singletons (safe because SDK service accessors are stateless).
- **Route layer**: One `OpenAPIHono` app per entity group, mounted in `src/app.ts` under `/sap`.
- **Error handling**: `sapErrorResponses` shared helper in `src/schemas/error.ts`. All routes spread `...sapErrorResponses` for consistent error responses. `mapSapStatus()` maps SAP HTTP codes to `SapErrorStatus` (400|401|403|404|409|500).
- **Input types**: Consumer-friendly schemas in `types.ts` (plain `number`, not BigNumber). Route files add API-boundary validation (e.g., ISO date regex) via `.extend()`.
- **Response sanitization**: `sanitize<T>()` strips SDK internals via JSON round-trip.

## Code Quality Commands

```bash
npx tsc --noEmit          # TypeScript check
npm test                   # Run all tests
bun eslint .              # Lint
bun prettier --check .    # Format check
```

## Key Conventions

- Generated OData clients in `src/generated/` are committed (not gitignored)
- Zod schemas defined once in `types.ts`, wrapped with `.openapi()` in route files
- Read-before-update pattern for SAP PATCH operations (merge existing entity with changes)
- BigNumber fields in SDK → plain `number` in consumer-facing types
- All routes return `{ success: true, data }` or `{ success: false, error }` envelope
