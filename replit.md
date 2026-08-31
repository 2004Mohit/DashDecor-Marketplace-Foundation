# DashDecor Marketplace

DashDecor is a premium Pune marketplace for sourcing interior and construction materials from trusted local sellers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/dashdecor-marketplace` — customer-facing React/Vite storefront and routing.
- `artifacts/api-server` — shared Express API for catalog, search, product detail, and delivery eligibility.
- `lib/api-spec/openapi.yaml` — source of truth for public API contracts.
- `lib/api-client-react` and `lib/api-zod` — generated React Query hooks and Zod schemas.
- `lib/db/src/schema/catalog.ts` — Drizzle catalog, seller, variant, and inventory schema.
- `docs/requirements` — uploaded marketplace requirements and product decisions.

## Architecture decisions

- The initial storefront runs at `/` and uses the shared `/api` service so preview and future production routing stay path-aware.
- Catalog discovery is server-backed and contract-first; the storefront uses generated hooks instead of scattering fetch calls through UI components.
- Seller inventory is stored separately from canonical product data and keyed by location/pincode so multiple warehouses can be added later.
- DashDecor is a replaceable working brand; the visual identity is contained in the storefront theme and can be swapped without changing domain models.
- The storefront's light theme is intentionally bright and commerce-oriented: warm ivory/white surfaces, cobalt primary actions, controlled lime highlights, and a separately tuned charcoal dark theme.
- Cashfree, auth, tax, checkout, and role-scoped workflows remain intentionally out of this first foundation slice until their secure server-side contracts are defined.

## Product

The first slice supports public catalog discovery, search and filtering, product details with variants/specifications, delivery checks for Pune and Pimpri-Chinchwad, seller and business entry points, and responsive shopping interactions.

## User preferences

No additional user preferences recorded.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, regenerate clients with `pnpm --filter @workspace/api-spec run codegen`.
- Use the managed artifact workflows for preview; the frontend requires workflow-provided `PORT` and `BASE_PATH`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
