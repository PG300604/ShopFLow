# 📦 Inventory Service Technical Specification & Development Guide (for Riya)

The **Inventory Service** (`inventory-service`, Port `8085`) is responsible for real-time stock availability checks, reservation locks during order checkout, and physical stock updates upon order completion or cancellation.

---

## 🏗️ Architecture & Domain Flow

The `inventory-service` implements a **Two-Phase Reservation System** to prevent overselling while orders are being processed.

```
                    ┌─────────────────────────┐
                    │    Order Placement      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                     POST /inventory/reserve
                    ┌─────────────────────────┐
                    │   Creates 'PENDING'     │
                    │   Reservation Record    │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
       (Payment Successful)             (Payment Failed / Cancelled)
                 │                               │
                 ▼                               ▼
  POST /inventory/{id}/commit      POST /inventory/{id}/release
┌───────────────────────────┐    ┌───────────────────────────┐
│ 1. Decrements Stock       │    │ 1. Marks Reservation as   │
│ 2. Sets Status COMMITTED  │    │    RELEASED               │
└───────────────────────────┘    └───────────────────────────┘
```

---

## 🧩 Database Schema & Entities

### 1. `Inventory` Entity (`inventory` table)
- `productId` (`UUID`, Primary Key): References the Product ID from `product-service`.
- `quantity` (`int`): Physical stock count in warehouse.

### 2. `Reservation` Entity (`reservations` table)
- `id` (`UUID`, Primary Key): Generated reservation ID.
- `orderId` (`UUID`): Associated checkout order ID.
- `productId` (`UUID`): Product ID reserved.
- `quantity` (`int`): Reserved quantity.
- `status` (`String`): Current reservation state (`PENDING`, `COMMITTED`, `RELEASED`).

---

## 📡 REST API Endpoints

All endpoints are exposed under `/inventory` and accessible via API Gateway (`http://localhost:8080/api/inventory/*`):

| Method | Endpoint | Request Payload / Params | Response | Description |
|--------|----------|--------------------------|----------|-------------|
| `GET` | `/inventory/{productId}/availability?quantity=N` | `quantity` (Query Param) | `AvailabilityResponse` | Calculates available stock = `inventory.quantity - pendingReserved` |
| `POST` | `/inventory/reserve` | `{ orderId, productId, quantity }` | `ReservationResponse` | Creates a `PENDING` reservation. Throws `409 Conflict` if stock insufficient |
| `POST` | `/inventory/{reservationId}/commit` | — | `200 OK` | Decrements physical stock & marks reservation `COMMITTED` |
| `POST` | `/inventory/{reservationId}/release` | — | `200 OK` | Cancels pending reservation & marks status `RELEASED` |

---

## ⚙️ Inter-Service Integration (OpenFeign)

The `inventory-service` is consumed by `order-service` via OpenFeign client interfaces defined in the `common` module (`com.shopflow.common.client.inventory.InventoryClient`).

- When a customer checks out, `order-service` calls `POST /inventory/reserve`.
- If stock is insufficient, `inventory-service` returns `409 CONFLICT`.
- On order completion, `order-service` calls `POST /inventory/{reservationId}/commit`.
- On payment failure or order expiry, `order-service` calls `POST /inventory/{reservationId}/release`.

---

## 🔒 Key Development Rules for Inventory Service

1. **Spring Security Rule**: Ensure `/error` is permitted in `SecurityFilterChain` (`.requestMatchers("/error").permitAll()`) so `ResponseStatusException(HttpStatus.CONFLICT, ...)` dispatches `409` cleanly to clients without being blocked.
2. **Transactional Locks**: All stock checks and reservations use `@Transactional` annotations to preserve database consistency.
3. **Knowledge Graph**: Update graphify after code edits via `python -m graphify update .`.
