# ShopFlow — Complete System Architecture & Technical Documentation

**Author & Solo Engineer**: Priyanshu Ghosh ([@PG300604](https://github.com/PG300604))  
**Platform Version**: 1.0.0-RELEASE  
**Architecture Style**: Distributed Domain-Driven Microservices  
**Frontend Framework**: React 18, TypeScript 5, Vite, Pure CSS  
**Backend Framework**: Java 17 LTS, Spring Boot 3.3.1, Spring Cloud 2023.0.2  

---

## 1. Executive Summary & Architectural Objectives

ShopFlow is an enterprise-grade multi-vendor e-commerce platform designed and built from scratch as an end-to-end solo initiative. The platform simulates high-throughput real-world commerce workloads across distributed, autonomous services while maintaining strict data consistency, transactional safety, and low-latency client experiences.

### Key Engineering Objectives
1. **Concurrency-Safe Inventory**: Eliminate race conditions and overselling during simultaneous checkout attempts using a two-phase reservation pattern.
2. **Fault Isolation**: Decompose commerce functionalities into domain-bounded microservices with autonomous PostgreSQL database schemas.
3. **Resilient Payment Processing**: Decouple payment intent creation, frontend execution (Stripe Payment Element / UPI modal), and downstream order state mutation via cryptographic webhook validation and client fallback resilience.
4. **Strict Multi-Tenant Scoping**: Enforce role-based access control (RBAC) ensuring vendors can only inspect and mutate their own inventory and sales figures.
5. **Modern Editorial User Experience**: Deliver an editorial 3-column Pinterest-style catalog layout, interactive filter sidebar, drawer cart, and native Indian Rupee (INR / ₹) currency localization.

---

## 2. High-Level System Topology

The platform comprises an edge routing layer, a service discovery mesh, six independent business domain services, isolated persistence layers, and external payment/communication gateways.

```mermaid
flowchart TD
    subgraph ClientTier["Client Layer"]
        Browser["React 18 SPA (Vite / TypeScript)<br/>Pure CSS Minimalist UI"]
    end

    subgraph EdgeTier["Edge & Discovery Layer"]
        Gateway["Spring Cloud API Gateway (:8080)<br/>Route Dispatch · CORS · JWT Verification"]
        Eureka["Netflix Eureka Server (:8761)<br/>Service Registry & Heartbeat Health Monitor"]
    end

    subgraph DomainMesh["Domain Microservices Mesh"]
        AuthSvc["auth-service (:8081)<br/>JJWT 0.12.5 · BCrypt · User RBAC"]
        ProductSvc["product-service (:8082)<br/>Catalog · Reviews · Vendor Partitioning"]
        OrderSvc["order-service (:8083)<br/>Cart Sync · State Machine · Sweeper"]
        PaymentSvc["payment-service (:8084)<br/>Stripe SDK · Webhooks Listener"]
        InventorySvc["inventory-service (:8085)<br/>Two-Phase Stock Lock · Reservation Engine"]
        NotificationSvc["notification-service (:8086)<br/>Async Mailer · Email Templates"]
    end

    subgraph DataTier["Distributed Persistence Layer"]
        DB_Auth[("PostgreSQL: auth_db<br/>users, roles")]
        DB_Prod[("PostgreSQL: product_db<br/>products, reviews, promotions")]
        DB_Order[("PostgreSQL: order_db<br/>orders, order_items, cart_items")]
        DB_Inv[("PostgreSQL: inventory_db<br/>inventories, reservations")]
    end

    subgraph ExternalGateways["External Infrastructure"]
        StripeGateway["Stripe API & Webhook Dispatcher"]
        SMTPGateway["SMTP Mail Server (Mailtrap / SendGrid)"]
    end

    Browser -->|"HTTP / HTTPS Requests (Bearer JWT)"| Gateway
    Gateway -.->|"Service Discovery Lookup"| Eureka
    DomainMesh -.->|"Register & Heartbeat Pulse"| Eureka

    Gateway -->|"Route /api/auth/**"| AuthSvc
    Gateway -->|"Route /api/products/**"| ProductSvc
    Gateway -->|"Route /api/orders/**"| OrderSvc
    Gateway -->|"Route /api/payments/**"| PaymentSvc
    Gateway -->|"Route /inventory/**"| InventorySvc
    Gateway -->|"Route /api/notifications/**"| NotificationSvc

    OrderSvc -->|"OpenFeign: Availability Check & Reserve"| InventorySvc
    OrderSvc -->|"OpenFeign: Product Details & Pricing"| ProductSvc
    OrderSvc -->|"OpenFeign: Dispatch Order Notification"| NotificationSvc
    PaymentSvc -->|"OpenFeign: Transition Order Status"| OrderSvc

    AuthSvc --> DB_Auth
    ProductSvc --> DB_Prod
    OrderSvc --> DB_Order
    InventorySvc --> DB_Inv

    PaymentSvc <-->|"Create PaymentIntent & HMAC Webhooks"| StripeGateway
    NotificationSvc -->|"Async TLS SMTP Relay"| SMTPGateway
```

---

## 3. Data Flow Diagrams (DFD)

### 3.1 DFD Level 0 — Context Diagram
The Level 0 Context Diagram depicts the primary external actors interacting with the boundary of the ShopFlow platform.

```mermaid
flowchart LR
    Shopper["Shopper / Customer"]
    Vendor["Store Seller"]
    Admin["System Administrator"]
    Stripe["Stripe Gateway"]
    SMTP["SMTP Mail Server"]

    SystemBoundary["ShopFlow Commerce System"]

    Shopper -->|"Browse Catalog, Cart Operations, Orders, Auth"| SystemBoundary
    SystemBoundary -->|"Product Catalogs, Order Status, Confirmation Token"| Shopper

    Vendor -->|"Create Products, Restock Stock, View Sales"| SystemBoundary
    SystemBoundary -->|"Scoped Vendor Analytics, Order Items"| Vendor

    Admin -->|"Approve Ads, Platform Metrics, Order Status"| SystemBoundary
    SystemBoundary -->|"Global Orders, System Diagnostics, Revenue Stats"| Admin

    SystemBoundary -->|"PaymentIntent Request, Customer Token"| Stripe
    Stripe -->|"HMAC-Signed Webhook (Payment Succeeded / Failed)"| SystemBoundary

    SystemBoundary -->|"Async Order Dispatches & Alerts"| SMTP
```

---

### 3.2 DFD Level 1 — Core Subsystems Breakdown
The Level 1 DFD decomposes the system into its six core computational domains, showing how data traverses between stores and processes.

```mermaid
flowchart TD
    Customer["Customer"]
    Seller["Seller"]
    StripeActor["Stripe"]

    P1["1.0 Authentication & User Service"]
    P2["2.0 Catalog & Content Service"]
    P3["3.0 Inventory & Lock Service"]
    P4["4.0 Order Lifecycle Service"]
    P5["5.0 Payment & Webhook Service"]
    P6["6.0 Notification Service"]

    D1[("D1: Users & Credentials")]
    D2[("D2: Catalog & Categories")]
    D3[("D3: Stock & Reservations")]
    D4[("D4: Orders & Cart Sync")]

    Customer -->|"Credentials"| P1
    P1 <-->|"Verify & Store"| D1
    P1 -->|"JWT Token"| Customer

    Seller -->|"Product Metadata & Stock Level"| P2
    P2 <-->|"Persist Products"| D2
    Customer -->|"Catalog Search & Filters"| P2

    Customer -->|"Add to Cart / Checkout"| P4
    P4 <-->|"Sync Cart & Persist Orders"| D4
    P4 -->|"Reserve Stock Query"| P3
    P3 <-->|"Update Pending Locks"| D3

    P4 -->|"Init Transaction"| P5
    P5 <-->|"Intent & Secret"| StripeActor
    StripeActor -->|"Webhook: payment_intent.succeeded"| P5
    P5 -->|"Payment Confirmed"| P4
    P4 -->|"Commit Reservation"| P3
    P4 -->|"Send Confirmation Notice"| P6
```

---

### 3.3 DFD Level 2 — End-to-End Checkout & Two-Phase Lock Flow
The Level 2 sequence highlights the exact interaction order during a high-concurrency purchase, demonstrating transactional locking, compensation rollbacks, and webhook handling.

```mermaid
sequenceDiagram
    autonumber
    actor Shopper as Customer (Browser)
    participant GW as API Gateway (:8080)
    participant Ord as Order Service (:8083)
    participant Inv as Inventory Service (:8085)
    participant Pay as Payment Service (:8084)
    participant Str as Stripe Gateway
    participant Notif as Notification Service (:8086)

    Shopper->>GW: POST /api/orders/checkout (JWT + Cart Items)
    GW->>Ord: Forward Checkout Request
    
    critical Phase 1: Stock Reservation
        Ord->>Inv: POST /inventory/reserve (productId, quantity, holdDuration=15m)
        alt Stock Available (physical - pending >= qty)
            Inv-->>Ord: 200 OK (ReservationId, Status=PENDING)
        else Insufficient Stock
            Inv-->>Ord: 409 Conflict ("Out of stock")
            Ord-->>Shopper: 409 Conflict (Prompt user to adjust cart)
        end
    end

    Ord->>Ord: Create Order (Status=PENDING, ReferenceCode=#SF-XXXXXX)
    Ord->>Pay: POST /api/payments/create-intent (orderId, amount, currency=INR)
    Pay->>Str: Create Stripe PaymentIntent
    Str-->>Pay: Return clientSecret
    Pay-->>Ord: Payment Intent Metadata
    Ord-->>Shopper: Checkout Session Initiated (clientSecret, orderId)

    Shopper->>Shopper: Display Stripe Payment Modal (Card / UPI)
    Shopper->>Str: Confirm Card / UPI Authorization

    alt Payment Succeeded
        Str->>Pay: POST /api/payments/webhook (HMAC Signature + charge.succeeded)
        Pay->>Pay: Verify Cryptographic Signature
        Pay->>Ord: PUT /api/orders/{id}/status (Status=PAID)
        critical Phase 2: Stock Commit
            Ord->>Inv: POST /inventory/commit (reservationId)
            Inv-->>Ord: 200 OK (Status=COMMITTED, Physical Stock Deducted)
        end
        Ord->>Notif: POST /api/notifications/send (orderSummary)
        Notif-->>Shopper: Dispatch Order Confirmation Email
        Shopper->>GW: GET /api/orders/{id}
        GW-->>Shopper: Order Details (Status=PAID)
    else Payment Abandoned or Timed Out (> 15 minutes)
        Note over Inv: Background Sweeper triggers every 60s
        Inv->>Inv: Auto-Release Orphaned Reservations (Status=RELEASED)
    end
```

---

## 4. Database Schema & Entity-Relationship Model (ERD)

Each microservice manages an independent schema, guaranteeing schema boundary isolation. Data relationships across service boundaries are maintained via immutable foreign IDs.

```mermaid
erDiagram
    %% Auth Service Schema
    USER {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar role "CUSTOMER | SELLER | ADMIN"
        timestamp created_at
    }

    %% Product Service Schema
    PRODUCT {
        bigint id PK
        varchar name
        text description
        numeric price
        varchar category
        varchar image_url
        varchar color_hex
        varchar sizes_available
        bigint seller_id FK
        timestamp created_at
    }

    REVIEW {
        bigint id PK
        bigint product_id FK
        bigint user_id FK
        int rating "1 to 5"
        text comment
        timestamp created_at
    }

    PROMOTION {
        bigint id PK
        varchar title
        varchar image_url
        varchar target_url
        varchar status "PENDING | APPROVED | REJECTED"
        bigint seller_id FK
        timestamp created_at
    }

    %% Order Service Schema
    ORDER_ENTITY {
        bigint id PK
        bigint user_id FK
        varchar reference_code UK "#SF-XXXXXX"
        numeric total_amount
        varchar status "PENDING | PAID | SHIPPED | DELIVERED | CANCELLED"
        varchar shipping_address
        varchar payment_intent_id
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint product_id
        bigint seller_id
        int quantity
        numeric unit_price
        varchar product_name
    }

    CART_ITEM {
        bigint id PK
        bigint user_id FK
        bigint product_id
        int quantity
        timestamp updated_at
    }

    %% Inventory Service Schema
    INVENTORY {
        bigint id PK
        bigint product_id UK
        int physical_stock
        int reserved_stock
        timestamp updated_at
    }

    STOCK_RESERVATION {
        bigint id PK
        bigint product_id FK
        bigint order_id
        int quantity
        varchar status "PENDING | COMMITTED | RELEASED"
        timestamp expires_at
        timestamp created_at
    }

    %% Relationships
    USER ||--o{ ORDER_ENTITY : places
    USER ||--o{ CART_ITEM : maintains
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ ORDER_ITEM : snapshotted_in
    ORDER_ENTITY ||--|{ ORDER_ITEM : contains
    INVENTORY ||--o{ STOCK_RESERVATION : reserves
```

---

## 5. State Machines & Finite Lifecycles

### 5.1 Order State Transition Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer Initiates Checkout
    PENDING --> PAID: Stripe Webhook Confirms Payment
    PENDING --> CANCELLED: Payment Failed / Abandoned (Stock Released)
    PAID --> SHIPPED: Seller / Admin Marks Dispatched
    SHIPPED --> DELIVERED: Carrier Confirms Drop-off
    PAID --> REFUNDED: Admin Initiates Stripe Refund
    DELIVERED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
```

### 5.2 Two-Phase Inventory Lock State Machine

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE: Product Created / Restocked
    AVAILABLE --> PENDING_RESERVATION: Checkout Triggered (Stock Lock Created)
    PENDING_RESERVATION --> COMMITTED: Payment Successful (Physical Stock Deducted)
    PENDING_RESERVATION --> RELEASED: Session Abort or 15m Timeout (Stock Returned)
    COMMITTED --> [*]
    RELEASED --> AVAILABLE: Stock Available for Re-Order
```

---

## 6. Frontend Component Architecture & State Management

The frontend is constructed using React 18 with pure CSS design tokens. No third-party heavy styling frameworks (like Tailwind or Bootstrap) were used, providing custom editorial design control and zero bundle bloat.

```mermaid
graph TD
    subgraph CoreContexts["Global State Providers"]
        TP["ThemeProvider<br/>Light / Dark / System Switching"]
        AP["AuthProvider<br/>JWT Storage · Role Detection · Auto-Refresh"]
        CP["CartProvider<br/>Drawer State · Live Quantities · Client/Server Sync"]
    end

    subgraph RouterTree["React Router v6 Navigation"]
        Layout["Layout Shell<br/>(Header · Drawer · Notification Toast · Footer)"]
        Catalog["CatalogPage<br/>(Hero Slider · 3-Col Pinterest Grid · Filters)"]
        Detail["DetailPage<br/>(Image View · Stock Status · Review List)"]
        Checkout["CheckoutPage<br/>(Stripe Payment Modal · Fallback Generator)"]
        Profile["ProfilePage<br/>(User Details · Past Orders History)"]
        Seller["SellerDashboard<br/>(Product CRUD · Scoped Sales Table)"]
        Admin["AdminDashboard<br/>(Platform Metrics · Global Orders · Ad Review)"]
        Search["SearchResultsPage<br/>(Fuzzy Typo Search · Price Filters)"]
    end

    TP --> Layout
    AP --> Layout
    CP --> Layout

    Layout --> Catalog
    Layout --> Detail
    Layout --> Checkout
    Layout --> Profile
    Layout --> Seller
    Layout --> Admin
    Layout --> Search
```

---

## 7. Role-Based Access Control (RBAC) Matrix

| Endpoint Route Pattern | Anonymous | CUSTOMER | SELLER | ADMIN | Description |
|---|:---:|:---:|:---:|:---:|---|
| `POST /api/auth/register`, `POST /api/auth/login` | Allowed | Allowed | Allowed | Allowed | User registration and JWT issuance |
| `GET /api/products`, `GET /api/products/{id}` | Allowed | Allowed | Allowed | Allowed | Public catalog viewing |
| `POST /api/products` | Denied | Denied | Allowed | Allowed | Product creation (scoped to seller) |
| `PUT /api/products/{id}`, `DELETE /api/products/{id}` | Denied | Denied | Scoped | Allowed | Modifying/deleting product items |
| `GET /api/orders/cart`, `POST /api/orders/cart` | Denied | Allowed | Allowed | Allowed | Persistent shopping cart operations |
| `POST /api/orders/checkout` | Denied | Allowed | Allowed | Allowed | Order creation and 2-phase reservation |
| `GET /api/orders/my-orders` | Denied | Allowed | Allowed | Allowed | View personal order history |
| `GET /api/orders/seller/mine` | Denied | Denied | Allowed | Allowed | View orders containing vendor's products |
| `PUT /api/orders/{id}/admin-status` | Denied | Denied | Denied | Allowed | Override platform order status |
| `POST /api/payments/webhook` | Stripe Only | Stripe Only | Stripe Only | Stripe Only | Webhook HMAC signature required |
| `POST /inventory/reserve`, `/commit`, `/release` | Denied | Internal | Internal | Internal | Inter-service Feign calls only |

---

## 8. Microservices Registry & Port Allocation

| Service Name | Port | Base Path | Primary Responsibility | Backing Store |
|---|:---:|---|---|---|
| **api-gateway** | `8080` | `/` | Central routing, CORS handling, JWT header propagation | None (Stateless) |
| **eureka-server** | `8761` | `/` | Service discovery registry, heartbeats, clustering | In-Memory Registry |
| **auth-service** | `8081` | `/api/auth` | User account lifecycle, BCrypt hashing, JWT issuance | PostgreSQL (`auth_db`) |
| **product-service** | `8082` | `/api/products` | Multi-vendor product catalog, category indexing, reviews | PostgreSQL (`product_db`) |
| **order-service** | `8083` | `/api/orders` | Checkout orchestration, order state machine, cart sync | PostgreSQL (`order_db`) |
| **payment-service** | `8084` | `/api/payments` | Stripe SDK integration, PaymentIntent creation, webhooks | Stateless (Feign to Orders) |
| **inventory-service**| `8085` | `/inventory` | Two-phase reservation locks, stock auto-release sweeper | PostgreSQL (`inventory_db`) |
| **notification-service**|`8086`| `/api/notifications`| Asynchronous HTML email dispatch via SMTP relay | None (Stateless) |
| **frontend** | `5173` | `/` | React 18 single-page application | Browser LocalStorage |

---

## 9. Failure Modes & Resilience Patterns

1. **Stripe Payment Gateway Downtime / Render DB Credentials Lag**:
   - The frontend checkout page employs a decoupled Stripe Payment Modal with simulated and live payment paths.
   - If downstream order service or database fails during checkout initiation, the client generates a unique persistent order reference `#SF-XXXXXX` and provides positive feedback without trapping the customer in an unrecoverable 500 error screen.
2. **Abandoned Carts & Orphaned Stock Reservations**:
   - Every reservation in `inventory-service` has an `expires_at` timestamp (default: 15 minutes).
   - A `@Scheduled(fixedRate = 60000)` background sweeper continuously identifies expired reservations with `status = 'PENDING'` and releases them, restoring available stock immediately without manual intervention.
3. **Cascading Failure Prevention**:
   - OpenFeign clients use connection timeouts (`2000ms`) and read timeouts (`5000ms`) to prevent hanging threads from exhausting the server connection pool.
4. **Spring Security `/error` Dispatch**:
   - In accordance with architectural rules, all Spring Security configurations explicitly permit `/error`, guaranteeing that custom HTTP status exceptions (409, 400, 404) reach the client instead of being masked as generic 403 Forbidden errors.

---

## 10. Local Build & Deployment Runbook

### Windows Quickstart (One-Click)
```powershell
# From repository root
Set-ExecutionPolicy Bypass -Scope Process -Force
.\start_services.ps1
```

### Production Docker Container Deployment
```bash
# Build all backend microservices
mvn clean package -DskipTests

# Launch entire distributed mesh with Docker Compose
docker compose up --build -d
```

### Access URLs
- **Web Storefront**: `http://localhost:5173`
- **API Gateway**: `http://localhost:8080`
- **Eureka Dashboard**: `http://localhost:8761`
