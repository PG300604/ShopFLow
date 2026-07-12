# Project: ShopFlow Premium Frontend

## Architecture
Vite (React + TypeScript) styled with Vanilla CSS (no CSS frameworks, no Tailwind).
Connects to the local microservices gateway API at `http://localhost:8080` (api-gateway).
Data flows from api-gateway to the frontend, which handles authentication tokens, shopping cart synchronizations, product details, ratings/reviews, and Stripe payments.

### Code Layout
```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── Playwright/
```

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| 1 | Scaffolding & Theme Integration | Vite setup, router, theme context (Light/Dark/System) | None | IN_PROGRESS | 3c59b670-0ced-414e-ba2a-1465823fb5e8 |
| 2 | Navigation & Catalog Page | Floating Glass Header, Pinterest grid, pagination, category filtering, scroll animations | M1 | PLANNED | TBD |
| 3 | Sliding Banner & Detail Views | Banner ad slider (auto-crossfade + zoom), product detail, reviews & ratings display/submit | M2 | PLANNED | TBD |
| 4 | Shopping Cart Drawer | Sliding drawer, persistent cart state, synced with order-service DB cart | M3 | PLANNED | TBD |
| 5 | Checkout & Stripe Integration | Checkout form, order creation, Stripe Payment Element flow, E2E validation | M4 | PLANNED | TBD |
| E2E | E2E Testing Track | Design E2E test infra, Playwright setup, build tests Tiers 1-4 | None | IN_PROGRESS | 3d75d377-338f-4f70-b1b9-0c1a0b0ecc6f |

## Interface Contracts

### Frontend ↔ Auth Service (via Gateway /api/auth)
- `POST /api/auth/register`
  - Input: `{ "email": "string", "password": "string", "name": "string" }`
  - Output: `201 Created` with User object `{ "id": "UUID", "email": "string", "name": "string", "role": "CUSTOMER/ADMIN", "address": "string" }`
- `POST /api/auth/login`
  - Input: `{ "email": "string", "password": "string" }`
  - Output: `200 OK` with `{ "token": "string", "user": UserObject }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Output: `200 OK` with User object
- `PUT /api/auth/profile/address`
  - Headers: `Authorization: Bearer <token>`
  - Input: `{ "address": "string" }`
  - Output: `200 OK` with updated User object

### Frontend ↔ Product Service (via Gateway /api/products)
- `GET /api/products`
  - Params: `category` (optional), `page` (default 0), `size` (default 10), `sortBy`, `sortDir`
  - Output: `200 OK` with paginated Product list
- `GET /api/products/{id}`
  - Output: `200 OK` with Product detail object `{ "id": "UUID", "name": "string", "description": "string", "price": BigDecimal, "imageUrl": "string", "category": "string", "stock": int }`
- `GET /api/products/{id}/reviews`
  - Output: `200 OK` with paginated Review list `{ "id": "UUID", "productId": "UUID", "userId": "UUID", "rating": int, "comment": "string", "createdAt": "timestamp" }`
- `POST /api/products/{id}/reviews`
  - Headers: `Authorization: Bearer <token>`
  - Input: `{ "rating": int (1-5), "comment": "string" }`
  - Output: `201 Created` with Review object
- `GET /api/products/{id}/rating`
  - Output: `200 OK` with `{ "productId": "UUID", "averageRating": double, "count": long }`

### Frontend ↔ Order Service (via Gateway /api/orders)
- `GET /api/orders/cart`
  - Headers: `Authorization: Bearer <token>`
  - Output: `200 OK` with CartItem list
- `POST /api/orders/cart`
  - Headers: `Authorization: Bearer <token>`
  - Input: `{ "productId": "UUID", "quantity": int }`
  - Output: `200 OK` with CartItem details
- `DELETE /api/orders/cart/{productId}`
  - Headers: `Authorization: Bearer <token>`
  - Output: `204 No Content`
- `DELETE /api/orders/cart`
  - Headers: `Authorization: Bearer <token>`
  - Output: `204 No Content`
- `POST /api/orders/checkout`
  - Input: `{ "userId": "UUID", "shippingAddress": "string", "items": [{ "productId": "UUID", "quantity": int }] }`
  - Output: `201 Created` with Order object `{ "id": "UUID", "userId": "UUID", "totalAmount": BigDecimal, "status": "PENDING", "shippingAddress": "string", "items": [...] }`
- `GET /api/orders/history`
  - Headers: `Authorization: Bearer <token>`
  - Output: `200 OK` with List of Orders

### Frontend ↔ Payment Service (via Gateway /api/payments)
- `POST /api/payments/create-intent`
  - Input: `{ "orderId": "UUID", "amount": BigDecimal, "email": "string" }`
  - Output: `201 Created` with `{ "clientSecret": "string" }`

---

## Multi-Vendor Marketplace (MVP)

This section describes the MVP multi-vendor support scope.

### 1. Unified Authentication & Roles
* Added **`SELLER`** to the platform roles.
* Sellers are associated with an optional **`storeName`** field, which is required only when registering a seller via `POST /api/auth/register/seller`.

### 2. Product Ownership & Authorization Rules
* Every **`Product`** entity contains a **`sellerId`** (UUID, non-nullable) indicating which seller owns it.
* **Access Rules**:
  * Public users can view products.
  * Admins can perform `POST`/`PUT`/`DELETE` on all products.
  * Sellers can create products (which are automatically tagged with their own `sellerId`), and can only update (`PUT`) or delete (`DELETE`) products they own.

### 3. Seller Order Scoping
* Sellers can view their own orders via `GET /api/orders/seller/mine`.
* **Shared Orders / Split View**:
  * An order can contain items from multiple sellers.
  * When a seller fetches their orders, they will **only** see the order items belonging to their products.
  * The order total and line items returned will be scoped down to that seller's context (another seller's items are hidden).

### 4. Explicitly Deferred Features (Post-MVP)
* **Stripe Connect & Payouts**: Stored payouts, seller bank accounts, and automatic marketplace commission splitting.
* **Seller KYC**: Onboarding verification flow.
* **Seller Analytics**: Sales dashboards and reporting.
* **Order-Splitting / Multi-Invoice**: Splitting a single user checkout order into individual orders per seller at the database level.
