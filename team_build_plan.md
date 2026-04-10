# Kings Market Team Build Plan

This document is the team implementation guide for building the Kings Market system from the proposal and the current `hgr9ba_b.sql` schema.

## 0. Initial Team-Led SQL Optimization Sprint (Do First)
Before full feature development, run a short schema-hardening sprint on `hgr9ba_b.sql` so the app is built on safe and scalable DB contracts.

## SQL Optimization Goals
- Align schema with proposal-critical flows (auth roles, cart/checkout, admin inventory, history).
- Eliminate high-risk patterns (raw card/CVC storage, weak order lifecycle modeling).
- Add concurrency-safe inventory behavior for low-stock checkout races.
- Improve query performance for catalog search/filter/sort and order history.

## Team Tasks for Initial SQL Sprint

### Daksh (lead) + Zaid
- [ ] Create migration plan from current SQL dump to versioned migrations.
- [ ] Define role/security schema support (user role model, least-privileged DB users).
- [ ] Replace `PaymentInfo` raw sensitive fields with token/provider reference pattern.
- [ ] Add DB constraints needed for secure/consistent writes (FKs, NOT NULL, CHECK-like validation where possible).

### Nathan (lead) + Shrikar
- [ ] Add inventory reservation/hold strategy to prevent oversell at checkout.
- [ ] Add transactional stock decrement rules for order placement.
- [ ] Define and index high-traffic catalog queries (name/category/price sorting and filtering).
- [ ] Validate query plans for catalog + checkout paths on realistic data sizes.

### Shrikar (lead) + Thomas
- [ ] Add explicit order lifecycle fields (`pending`, `paid`, `ready`, `picked_up`, `cancelled`).
- [ ] Add payment/order linkage contract (payment result reference, not raw secrets).
- [ ] Ensure order history tables support efficient user timeline queries.

### Zaid (lead) + Nathan
- [ ] Normalize item identity strategy (explicit SKU/product ID policy vs duplicate names).
- [ ] Add admin-focused audit structures for inventory changes/import actions.
- [ ] Ensure import/export tables/metadata support rollback-safe operations.

### Thomas (lead) + Daksh
- [ ] Confirm schema supports profile/history API response needs without N+1 query patterns.
- [ ] Define shared read models/views (if needed) for profile and order-history pages.

## Sprint Exit Criteria (must be true before major feature coding)
- [ ] Migrations run cleanly on an empty MySQL instance.
- [ ] Seed data loads reproducibly.
- [ ] Concurrency test passes for stock=1, two simultaneous checkout attempts.
- [ ] No endpoint requires storing raw card number/CVC.
- [ ] Query latency is acceptable for catalog and order history in staging-like data volume.

## Stack Decision (Confirmed)
- **Frontend/App:** Next.js (App Router preferred).
- **Database:** MySQL (hosted on GCP Cloud SQL).
- **This is sufficient** for your project scope.
- Recommended additions for smoother execution:
  - Next.js API routes or route handlers for backend endpoints.
  - A migration tool (Prisma Migrate, Drizzle Kit, or Knex migrations).
  - Managed secret storage for production (GCP Secret Manager).

## 1. Optimized Delegation (Owner Model)

## Daksh - Platform and Security Lead
- Backend project setup and shared standards (config, environment, DB connection layer).
- Auth endpoints and JWT middleware.
- Role-based access policy ownership (`guest`, `customer`, `admin`).
- DB-level security and migration policy.
- Final owner for app-wide security acceptance criteria.
- GCP IAM/security baseline, secrets setup, and deployment protection rules.

## Nathan - Catalog and Inventory Consistency
- Shop and item APIs + frontend pages.
- Search, filter, sort API/query implementation and indexes.
- Catalog stock semantics (`in stock`, `out of stock`, visibility rules).
- Co-owner for inventory concurrency behavior and validation.
- Validate catalog performance on deployed GCP environment.

## Shrikar - Commerce Flow
- Cart API/UI.
- Checkout API/UI and order placement.
- Payment UI integration with backend payment contract.
- Order state transitions (`pending`, `paid`, `ready`, `picked_up`, `cancelled`).
- Co-owner for transactional stock decrement during checkout.
- Validate checkout reliability in deployed environment.

## Zaid - Admin Domain Owner
- Admin inventory CRUD API + admin UI.
- Import/export for inventory and transaction data (CSV/JSON minimum).
- Validation and error reporting for imports.
- Admin reporting screens tied to update logs and transaction history.
- Own admin operations runbook for production (import/export + rollback steps).

## Thomas - Profile and App Experience
- Customer profile API/UI.
- Order history API/UI.
- Navigation/routing and shared client state patterns.
- Route guards and role-based UI visibility based on Daksh's policies.
- Dynamic behaviors (loading/error/empty states and user feedback flows).
- Configure deployment-safe Next.js runtime behavior (error boundaries, fallback UX).

## Shared Rules
- Daksh defines security policy and reviews all security-sensitive PRs.
- Nathan + Shrikar co-own checkout/inventory race condition correctness.
- Any endpoint contract change requires notifying all affected owners.

---

## 2. Repo-Specific Build Checklist

Current repo contents are minimal (`hgr9ba_b.sql`, proposal PDF, basic `README.md`), so this checklist includes initial repo scaffolding.

## A. Foundation (must happen first)
- [ ] Lock stack versions: Next.js + Node LTS + MySQL.
- [ ] Set project structure for Next.js app and API route handlers.
- [ ] Add environment templates (`.env.example`) for DB, JWT, app URLs.
- [ ] Add migrations folder and seed strategy (do not rely only on static SQL dump).
- [ ] Import/refactor `hgr9ba_b.sql` into migration-friendly scripts.
- [ ] Create shared API error format and response conventions.

## B. Schema and Data Hardening
- [ ] Add explicit order status model and timestamps.
- [ ] Add inventory reservation strategy for concurrent checkout safety.
- [ ] Add/verify indexes for search/filter/sort and order-history queries.
- [ ] Define unique constraints for item identity (SKU vs repeated names).
- [ ] Replace raw payment storage approach with tokenized provider pattern.
- [ ] Add audit logging conventions for admin actions.

## C. API Contracts (write before feature coding)
- [ ] Auth contract (login/register/guest flow, JWT claims, token lifetime).
- [ ] Catalog contract (query params for search/filter/sort/pagination).
- [ ] Cart/checkout contract (cart shape, checkout request/response, failures).
- [ ] Admin contract (inventory CRUD + import/export behaviors and validation errors).
- [ ] Profile/history contract (status enums, date ranges, pagination).

## D. Feature Delivery by Owner

### Daksh
- [ ] Auth endpoints and middleware live.
- [ ] RBAC middleware + route policy matrix published.
- [ ] Security baseline checks (input validation, auth enforcement, secrets handling).

### Nathan
- [ ] Shop page UI + item detail UI.
- [ ] Search/filter/sort working end-to-end.
- [ ] Out-of-stock behavior consistent with backend.

### Shrikar
- [ ] Cart CRUD flow works.
- [ ] Checkout completes transactional order placement.
- [ ] Payment UI integrated with secure backend contract.

### Zaid
- [ ] Admin inventory CRUD UI/API complete.
- [ ] Import/export available for required formats.
- [ ] Import validation and rollback/partial-failure strategy documented.

### Thomas
- [ ] Customer profile management complete.
- [ ] Order history list/details complete.
- [ ] Routing, guarded pages, and shared app shell stable.

## E. Integration and System Tests
- [ ] Two-user race test for low-stock item (stock = 1).
- [ ] Full happy path test: browse -> cart -> checkout -> order history.
- [ ] Admin inventory update reflected in catalog quickly and correctly.
- [ ] AuthZ tests for guest/customer/admin access boundaries.
- [ ] Import/export smoke tests on realistic datasets.

## F. Release Readiness
- [ ] Seed + migration instructions documented in `README.md`.
- [ ] CI passing on main branch.
- [ ] Team demo script prepared (customer flow + admin flow + concurrency test).

## G. GCP Hosting Checklist (App + DB)
- [ ] Create GCP project, billing, and IAM groups.
- [ ] Provision Cloud SQL for MySQL (private IP preferred if feasible).
- [ ] Configure DB users, least-privilege roles, and network rules.
- [ ] Store secrets in Secret Manager (DB URL, JWT secret, provider keys).
- [ ] Choose app host path:
  - Option A: Cloud Run for Next.js container.
  - Option B: Firebase App Hosting / App Engine (if team prefers managed DX).
- [ ] Configure CI deploy workflow (GitHub Actions to GCP).
- [ ] Add staging and production environments.
- [ ] Add health checks, logging, and alert basics.
- [ ] Run post-deploy smoke tests (catalog, checkout, admin CRUD, profile/history).

---

## 3. CI/CD and Branching Tips

## Branch Count Recommendation
- Each developer should keep **2 active branches max at a time**:
  - 1 feature branch currently under development.
  - 1 backup/follow-up branch only if blocked by review or dependencies.
- This keeps merge complexity low while still allowing parallel work.

## Branch Naming Convention
Use:
`<type>/<owner-or-initials>/<short-task>`

Examples:
- `feat/p1/auth-jwt-rbac`
- `feat/p2/catalog-search-filter-sort`
- `feat/p3/cart-checkout-flow`
- `feat/zaid/admin-inventory-crud`
- `feat/p5/profile-history-routing`
- `fix/p2/stock-race-checkout-lock`
- `chore/p1/ci-pipeline-setup`

## PR Naming Convention
Use:
`[Area] Short imperative summary`

Examples:
- `[Auth] Add JWT middleware and role guards`
- `[Catalog] Implement search, filter, sort endpoint`
- `[Admin] Add CSV import validation and preview`

## CI Pipeline Minimum
- Run on every PR:
  - Lint
  - Unit tests
  - Build checks (backend + frontend)
  - Migration validation against clean DB
- Run nightly or on merge:
  - Integration tests (checkout and concurrency scenarios)
  - Import/export smoke tests
  - Staging deploy smoke test

## Merge Rules
- Require at least 1 reviewer.
- Require all CI checks passing before merge.
- Do not merge schema-changing PRs without migration scripts.
- Prefer small PRs (< ~400 lines changed) when possible.
- Rebase/merge from main frequently to avoid long-lived divergence.
- Protect `main` with required checks + no direct pushes.

## Suggested Branches Per Developer
- **Total target per person:** 4-6 branches across project lifetime, 1-2 active at any time.
- Suggested pattern:
  - `chore/<name>/foundation-setup`
  - `feat/<name>/<domain-core>`
  - `feat/<name>/<domain-secondary>`
  - `fix/<name>/<integration-bugs>`
  - optional `chore/<name>/gcp-deploy` (for deployment owners)

---

## 4. Recommended Completion Order (Team Sequence)

## Phase 1 - Foundation and Contracts
1. Daksh: backend/security foundation + auth contract.
2. Team: agree on API contracts and schema adjustments.
3. Daksh + Zaid: GCP project setup, Cloud SQL bootstrap, secrets layout.

## Phase 2 - Core Data and Feature Parallelization
4. Nathan + Zaid: catalog + admin inventory APIs in parallel.
5. Thomas: routing/app shell/profile scaffolding against stable auth.

## Phase 3 - Commerce Completion
6. Shrikar: cart/checkout/order placement against stable catalog and auth.
7. Nathan + Shrikar: finalize concurrency correctness in checkout path.

## Phase 4 - Hardening and Integration
8. You: import/export edge cases and admin reporting polish.
9. Thomas: profile/history polish and guarded-route UX cleanup.
10. Daksh: final security review and policy validation.
11. Daksh + Thomas: staging deployment stability pass on GCP.

## Phase 5 - Stabilization and Demo
12. Team: integration tests, bug fixes, CI green.
13. Team: final demo prep and deployment checklist verification.

---

## 6. GCP Task Delegation

## Daksh (Primary GCP Owner)
- Own GCP project/IAM/security setup.
- Own CI -> GCP deployment pipeline and branch protection integration.
- Own Secret Manager policy and runtime secret loading.

## Zaid (DB Operations on GCP)
- Own Cloud SQL schema migration workflow and seed strategy in staging/prod.
- Own backup/restore procedure documentation for admin-relevant data operations.
- Co-own post-deploy DB verification checklist.

## Thomas (App Runtime Reliability)
- Own production-safe error handling UX in Next.js.
- Own routing-level fallback behavior and authenticated route behavior after deploy.
- Co-own post-deploy smoke tests for profile/history/navigation.

## Nathan (Catalog Performance)
- Own query/index tuning validation in Cloud SQL for catalog endpoints.
- Co-own load/performance checks for search/filter/sort under realistic usage.

## Shrikar (Checkout Reliability)
- Own checkout transaction reliability tests in staging.
- Co-own race-condition regression tests (stock = 1 concurrency scenario).

---

## 5. Fast Team Operating Guidelines
- Keep a shared "API contract changelog" so frontend/backend stay aligned.
- Treat security and concurrency as release blockers, not polish items.
- Avoid mixing unrelated tasks in one PR.
- If a task blocks another developer, split and ship enabling PR first.
- Use feature flags or placeholder responses only when absolutely needed.

