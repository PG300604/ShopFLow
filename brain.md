# brain.md — ShopFlow Master Controller

**Read this file first, every session, before generating or editing anything.**
This is the single source of truth for what's actually built, what rules
are non-negotiable, and what to do next. If this file conflicts with
something you infer from the code, this file wins — update the code to
match, or flag the conflict to me before proceeding.

Companion files:
- `PROJECT-CONTEXT.md` — architecture decisions, ER diagram, service contracts
- `graphify-out/graph.json` — structural map of the actual codebase (classes,
  calls, endpoints). Check this before searching/reading files broadly.

---

## 1. Hard Rules (never violate these without asking)

1. Base package for every service: `com.shopflow.<service-name>`
2. All primary keys: `UUID`
3. JWT secret must be **identical** across every service that verifies
   tokens (auth-service, product-service, order-service, gateway if it
   ever validates). Never generate a fresh random secret for a new module.
4. JWT: HS256, 24h expiry, claims = `sub` (email) + `role`
5. Passwords: BCrypt only. Never plaintext, never reversible encryption.
6. No credit card data ever touches our database — Stripe handles all of it.
7. Email/notification sends must be async — never block a checkout or
   payment API response waiting on SMTP.
8. Inventory Service is external (built by Riya). Never generate its
   internals. Only generate Feign clients / mocks that match the frozen
   contract in `PROJECT-CONTEXT.md` Section 4.
9. Ports are fixed per `PROJECT-CONTEXT.md` Section 3 — don't reassign them.
10. Vanilla CSS only on the frontend. No Tailwind, no CSS frameworks.

---

## 2. Live Build Status

Update this table every time a module changes state. This is the actual
truth, not the plan — if something's built but untested, say so.

| Module | Status | Notes |
|---|---|---|
| eureka-server | ✅ Built | — |
| api-gateway | ✅ Built, tested | Routes for all services confirmed working through gateway |
| auth-service | ✅ Built, tested | Register/login/JWT confirmed end-to-end against Supabase Postgres |
| product-service | ✅ Built, tested | Verified public reads, admin-protected writes, role-checks, and gateway routing |
| order-service | ✅ Built, tested (mock inventory) | Checkout, state machine validation, status updates, and notification triggers fully tested |
| payment-service | ✅ Built, tested | PaymentIntent creation, webhook verification, and status propagation tested |
| notification-service | ✅ Built, tested | Asynchronous SMTP confirmation and payment updates verified |
| inventory-service | 🔲 External — Riya's scope | Task doc sent to her: `Riya-Inventory-Service-Task.md`. Not yet integrated (Phase 3) |
| frontend (Next.js) | 🔲 Not started | Phase 5 |

**Outstanding verification checklist for product-service** (do this before testing payment-service):
- [x] JWT secret in `product-service/application.yml` matches `auth-service`
- [x] `GET /products`, `GET /products/{id}` work with no auth token
- [x] `POST /products` with CUSTOMER-role token → 403
- [x] `POST /products` with ADMIN-role token → 201
- [x] `product-service` visible on Eureka dashboard (`localhost:8761`)
- [x] `GET http://localhost:8080/api/products` works through the gateway

---

## 3. Immediate Next Actions (in order)

1. Finish the product-service verification checklist above
2. Phase 3: swap `MockInventoryClient` for the real Feign client once Riya's service is ready and tested against the contract
3. Phase 5: Build frontend Next.js application

---

## 4. Decision Log

Append here whenever a decision is made that isn't already obvious from
`PROJECT-CONTEXT.md` — especially anything that deviates from the original
PRD or plan, so nothing gets silently re-decided differently later.

| Date | Decision | Reason |
|---|---|---|
| 2026-07-05 | Pass Customer Email in Stripe PaymentIntent Metadata | Allows payment-service webhook to resolve customer email when a transaction completes, without querying a user database. |
| 2026-07-05 | Use Spring @Async for Async Notifications | Avoids setting up and maintaining a local RabbitMQ broker, utilizing a Java background thread executor instead. |
| — | Order status update endpoint (`PATCH /orders/{id}/status`) has no JWT check | Called service-to-service only (payment-service, admin shipping flow later). Revisit with an internal API key if this needs hardening before production |

*(Add new rows above this line as decisions come up — don't delete old ones.)*

---

## 5. Known Gaps / Things to Decide Later

- Whether admins can act on any customer's order via checkout endpoints, or only via dedicated admin endpoints — not yet explicitly decided/tested (see manual test step 9 from the earlier test pass)
- Whether Riya uses her own Supabase project or a shared one for inventory — decide before Phase 3 integration
- No refresh-token flow yet — 24h JWT expiry means users must re-login daily; acceptable for now, revisit if it becomes annoying during demo/testing
- Notification-service message queue vs plain `@Async` — not yet decided, flagged for that build prompt

---

## 6. How to keep this file honest

- After finishing any module: update Section 2's status table immediately, in the same session, not "later"
- After any prompt that changes an existing endpoint's contract: check whether `PROJECT-CONTEXT.md` Section 4 or 5 needs updating too, and note it in the Decision Log
- If you (Antigravity) notice this file is out of sync with the actual code, stop and flag it rather than guessing which one is right
