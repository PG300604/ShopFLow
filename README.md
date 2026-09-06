<div align="center">

# 🛍️ ShopFlow

### Production-grade multi-vendor e-commerce platform engineered with Java 17, Spring Boot 3.3.1 microservices, two-phase inventory reservation, Stripe payments, and a Vite + React glassmorphic frontend

[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.1-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2023.0.2-blue?logo=spring)](https://spring.io/projects/spring-cloud)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-API_v2024-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
  - [High-Level Microservices Architecture](#high-level-microservices-architecture)
  - [Component Architecture](#component-architecture)
- [Two-Phase Inventory State Machine](#-two-phase-inventory-state-machine)
- [Data Flow Diagrams (DFDs)](#-data-flow-diagrams-dfds)
  - [DFD Level 0 — Context Diagram](#dfd-level-0--context-diagram)
  - [DFD Level 1 — Core Subsystems](#dfd-level-1--core-subsystems)
  - [DFD Level 2 — End-to-End Checkout & Payment Sequence](#dfd-level-2--end-to-end-checkout--payment-sequence)
- [Microservices Breakdown & Port Registry](#-microservices-breakdown--port-registry)
- [Multi-Vendor Marketplace Architecture](#-multi-vendor-marketplace-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [REST API Catalog](#-rest-api-catalog)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1-Click Windows Setup Script](#1-click-windows-setup-script)
  - [Manual Build & Startup](#manual-build--startup)
  - [Environment Variables Configuration](#environment-variables-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
  - [Automated Backend Unit & Security Tests](#automated-backend-unit--security-tests)
  - [End-to-End Playwright Browser Suite](#end-to-end-playwright-browser-suite)
  - [Postman E2E Regression Collection](#postman-e2e-regression-collection)
- [License](#-license)

---

## 🌟 Overview

**ShopFlow** is an enterprise-grade, distributed multi-vendor e-commerce platform built to simulate high-throughput commerce workflows across independent, fault-tolerant microservices. 

It addresses common distributed commerce challenges: **overselling under concurrent checkouts**, **distributed transaction rollback**, **asynchronous payment confirmation**, **multi-vendor data isolation**, and **un-opinionated custom glassmorphic UX** without third-party styling framework lock-in.

### Core Capabilities at a Glance

- **Two-Phase Inventory Reservation**: Concurrency-safe reservation locks (`PENDING` $\rightarrow$ `COMMITTED` / `RELEASED`) prevent overselling when multiple shoppers purchase the last stock unit simultaneously.
- **Asynchronous Stripe Webhook Pipeline**: Idempotent webhook listener decouples payment authorization from synchronous user browser requests, ensuring guaranteed order fulfillment even on network drops.
- **Strict Multi-Vendor Scoping**: Complete catalog and order partitioning where sellers manage their independent product inventories and query seller-filtered fulfillment pipelines (`/api/orders/seller/mine`).
- **Distributed Service Mesh with Eureka & API Gateway**: Unified routing, dynamic client-side load balancing, JWT claims propagation, and OpenFeign inter-service communication.
- **Zero-Dependency Glassmorphic UI**: High-performance React 18 frontend written in pure Vanilla CSS design tokens with adaptive Light/Dark/System themes, drawer cart synchronization, and real-time inventory telemetry.

---

## 🚀 Key Features

### Distributed Transaction & Inventory Protection
| Capability | Description |
|---|---|
| **Optimistic Stock Locking** | Availability calculations (`physical - pendingReserved`) executed inside transactional scopes to guarantee accurate stock figures. |
| **Auto-Expiring Reservation Sweeper** | Background scheduled worker releases orphaned `PENDING` reservations if a customer abandons their Stripe payment session after 15 minutes. |
| **Atomic Compensating Rollbacks** | If checkout fails on line-item $N$ of a multi-product cart, all preceding reservations ($1 \dots N-1$) are automatically released via compensating Feign calls. |

### Payments & Asynchronous Event Processing
| Capability | Description |
|---|---|
| **Stripe Payment Element** | Secure credit card and digital wallet collection in the browser without exposing sensitive payment credentials to application servers. |
| **Webhook Signature Validation** | Cryptographic HMAC validation (`stripe.webhook.secret`) guarantees that state updates originate exclusively from genuine Stripe servers. |
| **Non-Blocking SMTP Mail Pipeline** | Order confirmation and tracking emails are dispatched asynchronously through `notification-service`, isolating SMTP latency from checkout speed. |

### Multi-Vendor Seller Operations
| Capability | Description |
|---|---|
| **Isolated Seller Catalog** | Sellers can create, update, restock, and delete their own products without accessing or mutating peer vendors' inventory. |
| **Order Item Snapshotting** | Every order item captures a historical snapshot of `sellerId` and `unitPrice` at the moment of checkout, maintaining revenue integrity over future price changes. |
| **Seller Analytics Dashboard** | Real-time calculation of revenue, orders placed, units sold, and stock depletion rates filtered strictly to the authenticated vendor. |

---

## 🏗️ System Architecture

### High-Level Microservices Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Client Layer"]
        WebClient["Vite + React 18 SPA<br/>(:5173 / Port 80)<br/>Pure Vanilla CSS Glassmorphism"]
    end

    subgraph GatewayLayer["🚪 API Gateway & Discovery"]
        Gateway["Spring Cloud API Gateway (:8080)<br/>Route Dispatcher · Global CORS · JWT Filter"]
        Eureka["Netflix Eureka Server (:8761)<br/>Service Registry & Health Pulse"]
    end

    subgraph ServiceMesh["⚙️ Domain Microservices Layer"]
        AuthSvc["🔐 auth-service (:8081)<br/>JWT Issuance · BCrypt · User RBAC"]
        ProductSvc["📦 product-service (:8082)<br/>Catalog · Reviews · Multi-Vendor"]
        OrderSvc["🛒 order-service (:8083)<br/>Cart Sync · State Machine · Sweeper"]
        PaymentSvc["💳 payment-service (:8084)<br/>Stripe SDK · Webhooks Listener"]
        InventorySvc["📊 inventory-service (:8085)<br/>2-Phase Reservations · Stock Locks"]
        NotificationSvc["✉️ notification-service (:8086)<br/>Async SMTP Mailer · HTML Templates"]
    end

    subgraph Persistence["💾 Distributed Database Layer"]
        DB_Auth[("PostgreSQL<br/>users · roles")]
        DB_Prod[("PostgreSQL<br/>products · reviews")]
        DB_Order[("PostgreSQL<br/>orders · items · cart")]
        DB_Inv[("PostgreSQL<br/>inventories · reservations")]
    end

    subgraph ThirdParty["🌐 External Services"]
        StripeAPI["Stripe API & Webhooks"]
        SMTPHost["SMTP Mailtrap / SendGrid"]
    end

    WebClient <== "HTTP / JSON<br/>Bearer JWT" ==> Gateway
    Gateway -. "Service Lookup" .-> Eureka
    ServiceMesh -. "Heartbeat & Register" .-> Eureka

    Gateway --> AuthSvc
    Gateway --> ProductSvc
    Gateway --> OrderSvc
    Gateway --> PaymentSvc
    Gateway --> InventorySvc
    Gateway --> NotificationSvc

    OrderSvc -- "OpenFeign: Availability & Reserve" --> InventorySvc
    OrderSvc -- "OpenFeign: Price & Seller Lookup" --> ProductSvc
    OrderSvc -- "OpenFeign: Order Confirmation" --> NotificationSvc
    PaymentSvc -- "OpenFeign: Update Order Status" --> OrderSvc

    AuthSvc --> DB_Auth
    ProductSvc --> DB_Prod
    OrderSvc --> DB_Order
    InventorySvc --> DB_Inv

    PaymentSvc <== "Create Intent & Webhook Ping" ==> StripeAPI
    NotificationSvc ==> SMTPHost

    style ClientLayer fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style GatewayLayer fill:#1e293b,stroke:#64748b,color:#f8fafc
    style ServiceMesh fill:#1e1e2e,stroke:#a855f7,color:#f8fafc
    style Persistence fill:#182234,stroke:#3b82f6,color:#f8fafc
    style ThirdParty fill:#1f2937,stroke:#10b981,color:#f8fafc
```

---

### Component Architecture

```mermaid
graph TD
    AppRoot["frontend/src/App.tsx<br/>(ThemeProvider · AuthProvider · CartProvider)"]

    AppRoot --> CatalogPage["pages/CatalogPage.tsx<br/>(Hero Banner · Pinterest Grid · Filtering)"]
    AppRoot --> DetailPage["pages/DetailPage.tsx<br/>(Reviews · Live Stock Badge · Instant Buy)"]
    AppRoot --> CheckoutPage["pages/CheckoutPage.tsx<br/>(Stripe Payment Element · Address Input)"]
    AppRoot --> SellerDash["pages/SellerDashboard.tsx<br/>(Product CRUD · Stock Restocking · Scoped Orders)"]
    AppRoot --> AdminDash["pages/AdminDashboard.tsx<br/>(System Overview · Global Catalog & Order Control)"]
    AppRoot --> CartDrawer["components/CartDrawer.tsx<br/>(Sliding Persistent Drawer · DB Sync)"]

    subgraph BackendTopology["Microservices Internal Topology"]
        APIGateway["api-gateway<br/>StripPrefix · Route Registry"]
        OrderController["order-service: OrderController<br/>/api/orders/checkout"]
        InventoryController["inventory-service: InventoryController<br/>/inventory/reserve · /commit · /release"]
        PaymentController["payment-service: PaymentController<br/>/api/payments/webhook"]
    end

    CatalogPage --> APIGateway
    DetailPage --> APIGateway
    CheckoutPage --> APIGateway
    SellerDash --> APIGateway
    CartDrawer --> APIGateway

    APIGateway --> OrderController
    OrderController --> InventoryController
    PaymentController --> OrderController

    style AppRoot fill:#030712,stroke:#38bdf8,color:#fff
    style BackendTopology fill:#111827,stroke:#6366f1,color:#fff
```

---

## 🔒 Two-Phase Inventory State Machine

The inventory subsystem isolates stock tracking from order creation using a two-phase reservation pattern. This guarantees that stock is reserved immediately upon checkout initiation, but not permanently deducted until payment confirmation is verified via Stripe.

```mermaid
stateDiagram-v2
    [*] --> Available: Stock Initialized (physicalQuantity = N)

    Available --> PENDING: Customer Initiates Checkout<br/>(POST /inventory/reserve)
    note right of PENDING
        - Holds stock reservation record
        - Deducts from available:
          available = physical - pendingReserved
        - Other shoppers cannot reserve this unit
    end note

    PENDING --> COMMITTED: Stripe Webhook Received (payment_intent.succeeded)<br/>(POST /inventory/{id}/commit)
    note right of COMMITTED
        - Decrements physicalQuantity:
          physicalQuantity = physicalQuantity - quantity
        - Removes from pendingReserved
        - Finalizes permanent warehouse deduction
    end note

    PENDING --> RELEASED: Payment Fails / Cancelled / 15-min Sweeper Expiry<br/>(POST /inventory/{id}/release)
    note right of RELEASED
        - Reservation marked RELEASED
        - pendingReserved decremented
        - Stock returned to Available pool immediately
    end note

    COMMITTED --> [*]
    RELEASED --> [*]
```

---

## 🔄 Data Flow Diagrams (DFDs)

### DFD Level 0 — Context Diagram

```mermaid
flowchart LR
    Customer(("👤 Customer"))
    Seller(("🏪 Seller"))
    Admin(("🛡️ Admin"))
    Stripe(("💳 Stripe Gateway"))

    ShopFlow["🛍️ ShopFlow Microservices Platform"]

    Customer -- "Search Products, Cart Sync,<br/>Checkout & Card Payment" --> ShopFlow
    ShopFlow -- "Catalog, Order Receipt,<br/>Dispatch & Confirmation Email" --> Customer

    Seller -- "Create Products, Restock Inventory,<br/>View Scoped Orders" --> ShopFlow
    ShopFlow -- "Vendor Sales Telemetry &<br/>Inventory Shortage Alerts" --> Seller

    Admin -- "Promote Roles, Moderate Catalog,<br/>System-Wide Status Updates" --> ShopFlow
    ShopFlow -- "Platform-Wide Analytics & Metrics" --> Admin

    ShopFlow -- "Create PaymentIntent" --> Stripe
    Stripe -- "Cryptographic Webhook Event<br/>(payment_intent.succeeded)" --> ShopFlow
```

---

### DFD Level 1 — Core Subsystems

```mermaid
flowchart TB
    User(("Authenticated User"))

    subgraph AuthSubsystem["1.0 Authentication & Identity"]
        Login["JWT Login / Register"]
        Claims["Role Resolution (CUSTOMER / SELLER / ADMIN)"]
    end

    subgraph CatalogSubsystem["2.0 Catalog & Search Engine"]
        Catalog["Product Search & Filtering"]
        Reviews["Ratings & Reviews Service"]
    end

    subgraph OrderSubsystem["3.0 Order & Cart Orchestration"]
        Cart["Persistent Cart Sync"]
        Checkout["Checkout Pipeline"]
        StateEngine["Order State Machine"]
    end

    subgraph InventorySubsystem["4.0 Inventory & Reservations"]
        Avail["Availability Evaluator"]
        ResLocks["Two-Phase Reservation Locks"]
    end

    subgraph PaymentSubsystem["5.0 Payment Gateway"]
        Intent["Stripe Intent Generator"]
        Webhook["Webhook Idempotency Handler"]
    end

    subgraph DataStores["PostgreSQL Data Stores"]
        DS1[("Users & Roles")]
        DS2[("Products & Reviews")]
        DS3[("Orders & Line Items")]
        DS4[("Inventories & Reservations")]
    end

    User --> AuthSubsystem
    User --> CatalogSubsystem
    User --> OrderSubsystem

    AuthSubsystem --> DS1
    CatalogSubsystem --> DS2

    Checkout --> Avail
    Avail --> ResLocks
    ResLocks --> DS4

    Checkout --> StateEngine
    StateEngine --> DS3

    Checkout --> Intent
    Intent --> PaymentSubsystem
    Webhook --> StateEngine
    StateEngine --> ResLocks
```

---

### DFD Level 2 — End-to-End Checkout & Payment Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer Browser
    participant Gateway as 🚪 API Gateway (:8080)
    participant OrderSvc as 🛒 Order Service (:8083)
    participant ProductSvc as 📦 Product Service (:8082)
    participant InvSvc as 📊 Inventory Service (:8085)
    participant PaySvc as 💳 Payment Service (:8084)
    participant Stripe as 💳 Stripe API
    participant NotifSvc as ✉️ Notification Service (:8086)

    Customer->>Gateway: POST /api/orders/checkout (Bearer JWT + Cart Items)
    Gateway->>OrderSvc: Dispatches Request (UserId & Role in Context)
    
    loop For each Cart Line Item
        OrderSvc->>InvSvc: GET /inventory/{productId}/availability?quantity=N
        InvSvc-->>OrderSvc: 200 OK (isAvailable: true, availableStock: 45)
        
        OrderSvc->>InvSvc: POST /inventory/reserve ({orderId, productId, quantity})
        InvSvc-->>OrderSvc: 200 OK (reservationId: UUID, status: PENDING)

        OrderSvc->>ProductSvc: GET /products/{productId} (Fetch latest price & sellerId)
        ProductSvc-->>OrderSvc: 200 OK (price: 49.99, sellerId: UUID)
    end

    OrderSvc->>OrderSvc: Persist Order (Status: PENDING_PAYMENT, expiresAt: now + 15m)
    OrderSvc-->>Customer: 201 Created (Order Object with OrderId)

    Customer->>Gateway: POST /api/payments/create-intent ({orderId, amount})
    Gateway->>PaySvc: Dispatches Intent Creation
    PaySvc->>Stripe: stripe.paymentIntents.create({amount, currency: "usd"})
    Stripe-->>PaySvc: PaymentIntent {clientSecret: "pi_xxx_secret_xxx"}
    PaySvc-->>Customer: 200 OK {clientSecret}

    Customer->>Stripe: Confirm Card Payment via Stripe.js Element
    Stripe-->>Customer: Payment Authorization Confirmed

    Note over Stripe,PaySvc: Asynchronous Server-to-Server Webhook
    Stripe->>Gateway: POST /api/payments/webhook (Stripe-Signature header)
    Gateway->>PaySvc: Dispatches Webhook
    PaySvc->>PaySvc: Verify Cryptographic Webhook Signature
    
    alt Event: payment_intent.succeeded
        PaySvc->>OrderSvc: PUT /orders/{orderId}/status (newStatus: PAID)
        OrderSvc->>InvSvc: POST /inventory/{reservationId}/commit
        InvSvc->>InvSvc: physicalQuantity -= reservedQty; status = COMMITTED
        InvSvc-->>OrderSvc: 200 OK (Committed)
        
        OrderSvc->>NotifSvc: POST /notifications/order-confirmation
        NotifSvc->>Customer: Dispatches HTML Receipt via SMTP
    else Event: payment_intent.payment_failed
        PaySvc->>OrderSvc: PUT /orders/{orderId}/status (newStatus: FAILED)
        OrderSvc->>InvSvc: POST /inventory/{reservationId}/release
        InvSvc->>InvSvc: status = RELEASED (Available stock unblocked)
    end
```

---

## 🧩 Microservices Breakdown & Port Registry

ShopFlow is partitioned into **9 dedicated modules**:

| Service Module | Port | Technology Stack | Primary Responsibilities | Database Schema |
|---|:---:|---|---|---|
| **`eureka-server`** | `8761` | Spring Cloud Netflix Eureka | Heartbeat monitoring, service registration, dynamic discovery registry | In-Memory Registry |
| **`api-gateway`** | `8080` | Spring Cloud Gateway | Unified routing endpoint, StripPrefix routing, global CORS, and JWT forwarding | Stateless |
| **`auth-service`** | `8081` | Spring Boot 3 + Spring Security + JJWT | User registration, password hashing (BCrypt), JWT token generation, role assignments | `users` |
| **`product-service`** | `8082` | Spring Boot 3 + JPA + Hibernate | Product catalog, multi-vendor seller isolation, categories, customer reviews & star ratings | `products`, `reviews`, `promotions` |
| **`order-service`** | `8083` | Spring Boot 3 + OpenFeign | Shopping cart database sync, order placement state machine, 15-minute expiry sweeper | `orders`, `order_items`, `cart_items` |
| **`payment-service`** | `8084` | Spring Boot 3 + Stripe Java SDK | Stripe PaymentIntent generation, webhook HMAC signature verification, order status dispatch | Stateless Event Worker |
| **`inventory-service`** | `8085` | Spring Boot 3 + JPA + Spring Security | Two-phase reservation locks, stock availability computation, restock management | `inventories`, `reservations` |
| **`notification-service`**| `8086`| Spring Boot 3 + Spring Mail | Asynchronous order confirmation emails, HTML mail templating via SMTP | Stateless Mail Worker |
| **`common`** | — | Java 17 Shared Library | Shared DTOs (`AvailabilityResponse`, `ReserveRequest`) and OpenFeign client contracts | Shared Dependency |
| **`frontend`** | `5173` | Vite 5 + React 18 + TypeScript | Responsive glassmorphic shopping experience, seller dashboard, and admin operations | Browser LocalStorage |

---

## 🏢 Multi-Vendor Marketplace Architecture

ShopFlow implements native multi-tenancy for sellers:

1. **Vendor Isolation**: When a product is created, the system extracts the authenticated `userId` from the verified JWT and records it into `seller_id`.
2. **Restricted Catalog Mutation**: Only users possessing `ROLE_SELLER` matching the product's `sellerId` (or global `ROLE_ADMIN`) may modify price, details, or stock.
3. **Seller Order Scoping**: When customers place multi-item orders containing products from different sellers:
   - Every line item records an immutable snapshot of `sellerId`.
   - The endpoint `GET /api/orders/seller/mine` automatically queries the database using a custom projection that filters `order_items` belonging strictly to the requesting seller, preventing cross-vendor revenue leakage.

---

## 🛡️ Role-Based Access Control (RBAC)

The platform enforces three distinct user authority tiers:

```mermaid
flowchart TB
    subgraph Roles["Identity Authority Tiers"]
        AdminRole["ROLE_ADMIN<br/>Full Platform Oversight"]
        SellerRole["ROLE_SELLER<br/>Vendor Merchant Operations"]
        CustomerRole["ROLE_CUSTOMER<br/>Storefront Consumer"]
    end

    subgraph Endpoints["Permission Guardrails"]
        P_Public["Public Access<br/>• View Products<br/>• Read Ratings<br/>• Stock Availability<br/>• User Registration"]
        P_Customer["Customer Scope<br/>• Synchronize Cart<br/>• Initiate Checkout<br/>• View Order History<br/>• Submit Product Reviews"]
        P_Seller["Seller Scope<br/>• Publish Products<br/>• Update Stock Counts<br/>• Scoped Seller Orders (/mine)"]
        P_Admin["Admin Scope<br/>• Global Order Status Changes<br/>• Delete Catalog Products<br/>• View System-Wide Analytics"]
    end

    CustomerRole --> P_Public
    CustomerRole --> P_Customer

    SellerRole --> P_Public
    SellerRole --> P_Seller

    AdminRole --> P_Public
    AdminRole --> P_Customer
    AdminRole --> P_Seller
    AdminRole --> P_Admin

    style Roles fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style Endpoints fill:#1e293b,stroke:#a855f7,color:#f8fafc
```

---

## 📡 REST API Catalog

All requests flow through the API Gateway (`http://localhost:8080/api/*`):

### 1. Authentication Service (`/api/auth`)
| Method | Endpoint | Access | Payload / Query | Description |
|---|---|:---:|---|---|
| `POST` | `/api/auth/register` | Public | `{email, password, name}` | Creates user with default `CUSTOMER` role |
| `POST` | `/api/auth/login` | Public | `{email, password}` | Returns Bearer JWT token and user profile |
| `GET` | `/api/auth/me` | Authenticated | — | Returns current authenticated user profile |
| `PUT` | `/api/auth/profile/address` | Authenticated | `{address}` | Updates saved customer shipping address |

### 2. Product Service (`/api/products`)
| Method | Endpoint | Access | Payload / Query | Description |
|---|---|:---:|---|---|
| `GET` | `/api/products` | Public | `page, size, category, sortBy` | Paginated product listing |
| `GET` | `/api/products/{id}` | Public | — | Retrieves single product details |
| `POST` | `/api/products` | `SELLER`, `ADMIN` | `{name, price, category, imageUrl, description}` | Creates new catalog item tagged with seller ID |
| `PUT` | `/api/products/{id}` | `SELLER`, `ADMIN` | `{name, price, category, imageUrl, description}` | Updates existing product details |
| `DELETE`| `/api/products/{id}` | `SELLER`, `ADMIN` | — | Removes product from catalog |
| `GET` | `/api/products/{id}/reviews` | Public | `page, size` | Retrieves paginated customer reviews |
| `POST` | `/api/products/{id}/reviews` | `CUSTOMER` | `{rating, comment}` | Submits review with star rating (1–5) |
| `GET` | `/api/products/mine` | `SELLER` | — | Retrieves all products published by caller |

### 3. Order Service (`/api/orders`)
| Method | Endpoint | Access | Payload / Query | Description |
|---|---|:---:|---|---|
| `GET` | `/api/orders/cart` | Authenticated | — | Returns persistent database shopping cart |
| `POST` | `/api/orders/cart` | Authenticated | `{productId, quantity}` | Synchronizes cart items to database |
| `DELETE`| `/api/orders/cart/{productId}`| Authenticated| — | Removes specific product from cart |
| `DELETE`| `/api/orders/cart` | Authenticated | — | Clears all cart items |
| `POST` | `/api/orders/checkout` | `CUSTOMER`, `ADMIN` | `{userId, shippingAddress, items: [...]}` | Triggers reservation, price lookup & order placement |
| `GET` | `/api/orders/{id}` | Authenticated | — | Fetches order summary by UUID |
| `GET` | `/api/orders/history` | Authenticated | — | Retrieves customer purchase history |
| `GET` | `/api/orders/seller/mine` | `SELLER` | — | Scoped vendor orders filtered by seller item |
| `PUT` | `/api/orders/{id}/status` | Internal / Admin | `newStatus` | Transitions order state machine |

### 4. Inventory Service (`/api/inventory`)
| Method | Endpoint | Access | Payload / Query | Description |
|---|---|:---:|---|---|
| `GET` | `/api/inventory/{productId}/availability` | Public | `quantity` | Calculates available stock (`physical - pendingReserved`) |
| `GET` | `/api/inventory/{productId}` | Public | — | Returns physical, reserved, and available counts |
| `PUT` | `/api/inventory/{productId}` | `SELLER`, `ADMIN` | `{quantity}` | Restocks physical warehouse inventory |
| `POST` | `/api/inventory/reserve` | Internal / Order | `{orderId, productId, quantity}` | Locks stock under `PENDING` reservation |
| `POST` | `/api/inventory/{id}/commit` | Internal / Order | — | Decrements physical stock & marks `COMMITTED` |
| `POST` | `/api/inventory/{id}/release` | Internal / Order | — | Frees pending reservation & marks `RELEASED` |
| `GET` | `/api/inventory/order/{orderId}` | Authenticated | — | Retrieves all reservations associated with an order |

### 5. Payment Service (`/api/payments`)
| Method | Endpoint | Access | Payload / Query | Description |
|---|---|:---:|---|---|
| `POST` | `/api/payments/create-intent` | `CUSTOMER` | `{orderId, amount, email}` | Creates Stripe PaymentIntent and returns clientSecret |
| `POST` | `/api/payments/webhook` | Stripe Webhook | Raw payload + `Stripe-Signature` | Validates HMAC signature & dispatches order updates |

---

## 💻 Tech Stack

```
ShopFlow Platform
├── Backend
│   ├── Language: Java 17 LTS (Adoptium Temurin)
│   ├── Framework: Spring Boot 3.3.1
│   ├── Cloud: Spring Cloud 2023.0.2 (Eureka, Gateway, OpenFeign)
│   ├── Security: Spring Security 6 + JJWT 0.12.5 (Stateless Bearer JWT)
│   ├── Persistence: Spring Data JPA + Hibernate ORM
│   ├── Database: PostgreSQL 16
│   └── Payments: Stripe Java SDK v24+
│
├── Frontend
│   ├── Runtime: Node.js LTS (v20+ / v24+)
│   ├── Framework: Vite 5 + React 18 + TypeScript 5
│   ├── Styling: Pure Vanilla CSS (Glassmorphism design system tokens)
│   ├── Animation: Framer Motion
│   ├── Icons: Lucide React
│   └── Payments: @stripe/stripe-js + @stripe/react-stripe-js
│
└── Tooling & Testing
    ├── Build Tool: Apache Maven 3.9.6
    ├── End-to-End: Playwright Chromium Suite
    ├── API Testing: Postman Collection v2.1
    └── Architecture Knowledge Graph: Graphify AST Engine
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
- **Java JDK 17+** (`java -version`)
- **Node.js LTS v18+ or v20+** (`node -v`)
- **Apache Maven 3.9+** (`mvn -version`)
- **PostgreSQL 15+** (Local or cloud instance like Supabase / Neon)

---

### 1-Click Windows Setup Script

If setting up on a fresh Windows machine, run PowerShell as Administrator from the project root:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup_new_pc.ps1
```

This automated script installs Git, Node.js, JDK 17, Apache Maven, and configures all system `PATH` and `JAVA_HOME` environment variables automatically.

---

### Manual Build & Startup

#### 1. Compile & Package All Microservices
From the project root directory (`P:\ShopFlow`):

```powershell
# Build shared common library and backend microservices
.\.maven\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
```

#### 2. Install & Build Frontend
```powershell
cd frontend
npm install
npm run build
cd ..
```

#### 3. One-Click Platform Launch
Launch Eureka Server, Gateway, 6 Backend Microservices, and the Frontend development server in separate console sessions:

```powershell
.\start_services.ps1
```

Access the platform at:
- **Frontend Web Application**: `http://localhost:5173`
- **Spring Cloud Gateway**: `http://localhost:8080`
- **Eureka Service Discovery Dashboard**: `http://localhost:8761`

---

### Environment Variables Configuration

All microservices come with sensible local development defaults, but can be overridden via environment variables:

```bash
# Database Configuration
export DB_URL="jdbc:postgresql://localhost:5432/shopflow"
export DB_USERNAME="postgres"
export DB_PASSWORD="your_postgres_password"

# JWT Security
export JWT_SECRET="ShopFlowDefaultJwtSecretKeyForDev2026Base64StringLengthMinimum256Bits!"

# Stripe Integration
export STRIPE_SECRET_KEY="sk_test_51Pxxxxxxxxxxxxxxxxxxxx"
export STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxx"

# SMTP Mail Delivery
export MAIL_HOST="sandbox.smtp.mailtrap.io"
export MAIL_PORT="2525"
export MAIL_USERNAME="your_mailtrap_username"
export MAIL_PASSWORD="your_mailtrap_password"
```

---

## 🧪 Testing & Quality Assurance

### Automated Backend Unit & Security Tests
To execute all unit tests, mock MVC tests, and Spring Security rule verifications across the platform:

```powershell
.\.maven\apache-maven-3.9.6\bin\mvn.cmd test
```

To run test suites for a specific service (e.g., `inventory-service`):
```powershell
.\.maven\apache-maven-3.9.6\bin\mvn.cmd test -pl inventory-service
```

### End-to-End Playwright Browser Suite
A Playwright test suite verifies UI flows including theme toggling, catalog browsing, and cart operations:

```powershell
cd frontend/Playwright
npm install
npx playwright test
```

### Postman E2E Regression Collection
A comprehensive Postman test suite ([`ShopFlow_E2E_Tests.postman_collection.json`](ShopFlow_E2E_Tests.postman_collection.json)) is provided in the repository root:
1. Import `ShopFlow_E2E_Tests.postman_collection.json` into Postman.
2. Set the collection variable `baseUrl` to `http://localhost:8080`.
3. Run the collection to validate authentication, multi-vendor product CRUD, checkout, and inventory decrement flows.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
