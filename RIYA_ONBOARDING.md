# 🚀 ShopFlow Developer Onboarding & AI Context Guide (for Riya)

Welcome back to **ShopFlow**! This document provides complete instructions for setting up your developer environment, initializing your AI coding assistant with full project context, running the microservices platform, and understanding the architecture and domain conventions.

---

## 🎯 Quick Navigation & Key Resources

- **GitHub Repository**: `https://github.com/PG300604/ShopFLow.git`
- **Main Workspace Root**: `P:\ShopFlow` (or your local clone path)
- **Frontend App URL**: `http://localhost:5173`
- **API Gateway Base URL**: `http://localhost:8080`
- **Eureka Registry Dashboard**: `http://localhost:8761`

---

## 💻 Step 1: Environment Setup (Windows 1-Click Setup)

If you are setting up on a fresh machine or new environment, open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup_new_pc.ps1
```

This script automatically installs and configures:
- **Git** (`v2.45+`)
- **Node.js LTS** (`v20+` / `v24+`)
- **Java JDK 17** (Adoptium Temurin)
- **Apache Maven 3.9+**
- Configures `JAVA_HOME` and system `PATH` variables.

---

## ⚙️ Step 2: Environment Variables & Database Configuration

ShopFlow uses Spring Boot 3.3.1 microservices backed by PostgreSQL (local or cloud Supabase). All microservices use parameterized fallbacks in `application.yml` files.

Set the following environment variables in your terminal or `.env` file if needed (defaults will use localhost PostgreSQL):

```bash
export DB_URL="jdbc:postgresql://localhost:5432/shopflow"
export DB_USERNAME="postgres"
export DB_PASSWORD="postgres"
export JWT_SECRET="ShopFlowDefaultJwtSecretKeyForDev2026Base64StringLengthMinimum256Bits!"
export STRIPE_SECRET_KEY="sk_test_..."
```

---

## 🛠️ Step 3: Building & Running the Platform

### 1. Build Backend Microservices & Frontend
In the project root folder (`P:\ShopFlow`):

```powershell
# 1. Compile and package all Spring Boot microservices
mvn clean package -DskipTests

# 2. Install & build frontend dependencies
cd frontend
npm install
npm run build
cd ..
```

### 2. One-Click Platform Startup
To start the Eureka Server, API Gateway, 6 Domain Microservices, and the Vite React frontend dev server:

```powershell
.\start_services.ps1
```

---

## 🏗️ Step 4: System Architecture & Service Registry

```
                        ┌───────────────────────────────┐
                        │   Vite React Frontend (:5173) │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   API Gateway Service (:8080) │
                        └───────────────┬───────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
  │  Auth Service (:8081)│    │Product Service (:8082)│   │  Order Service (:8083)│
  └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
             │                          │                          │
             ▼                          ▼                          ▼
  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
  │Payment Service(:8084)│    │Inventory Svc (:8085)│    │Notification Svc(:8086)│
  └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
             │                          │                          │
             └──────────────────────────┴──────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │  Eureka Registry Server (:8761)│
                        └───────────────┬───────────────┘
```

### Microservice Inventory:

| Module | Port | Technology | Purpose |
|--------|------|------------|---------|
| `eureka-server` | `8761` | Spring Cloud Netflix Eureka | Service Discovery & Registry |
| `api-gateway` | `8080` | Spring Cloud Gateway | Unified routing & JWT forwarding |
| `auth-service` | `8081` | Spring Boot + JPA + JWT | User auth & registration (`CUSTOMER`, `SELLER`, `ADMIN`) |
| `product-service` | `8082` | Spring Boot + JPA | Product catalog, multi-vendor seller products, & reviews |
| `order-service` | `8083` | Spring Boot + OpenFeign | Shopping cart sync, order placement, & seller order scoping |
| `payment-service` | `8084` | Spring Boot + Stripe SDK | Stripe PaymentIntent generation & webhook handling |
| `inventory-service` | `8085` | Spring Boot + JPA | Stock reservation locks & inventory tracking |
| `notification-service` | `8086` | Spring Boot Mail | Mailtrap / SMTP order confirmation emails |
| `common` | — | Java Library | Shared DTOs & OpenFeign client interfaces |
| `frontend` | `5173` | Vite + React + TS | Glassmorphic responsive frontend (Vanilla CSS) |

---

## 📜 Step 5: Critical Development Rules & Conventions

When working on code changes with your AI agent, always follow these project rules:

### Rule 1: Spring Security Exception Dispatching (`/error`)
In **any** Spring Boot microservice utilizing Spring Security, you **must explicitly permit** the `/error` endpoint in the `SecurityFilterChain` configuration:
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/error").permitAll()
    // other endpoints...
)
```
*Why*: This ensures application exceptions (`400 Bad Request`, `404 Not Found`, `409 Conflict`) dispatch custom JSON payloads to clients instead of being blocked into `403 Forbidden` by Spring Security.

### Rule 2: Multi-Vendor Seller Scoping
- **Products**: Every `Product` has a `sellerId` (UUID). Public users can view products; Sellers can create, update, or delete products tagged with their own `sellerId`.
- **Order Scoping**: `GET /api/orders/seller/mine` returns orders filtered to only show order items belonging to the requesting seller (`sellerId` is snapshotted into `order_items` at checkout).

### Rule 3: Knowledge Graph Updates (`graphify`)
- Use `graphify-out/` to inspect architecture subgraphs.
- After modifying or adding code files, update the knowledge graph:
  ```bash
  python -m graphify update .
  ```

---

## 🤖 Prompt for Riya's AI Assistant (Copy & Paste)

Give the prompt below to your AI coding assistant (ChatGPT, Gemini, Claude, Antigravity, Cursor, GitHub Copilot) to instantly restore full project context:

```markdown
You are assisting Riya on the ShopFlow e-commerce codebase.

Project Context:
- ShopFlow is a Multi-Vendor E-Commerce Platform built with Java 17, Spring Boot 3.3.1 microservices, Spring Cloud (Eureka, Gateway, OpenFeign), and a Vite + React 18 + TypeScript frontend styled with Vanilla CSS.
- Service Ports: Gateway (8080), Eureka (8761), Auth (8081), Product (8082), Order (8083), Payment (8084), Inventory (8085), Notification (8086), Frontend (5173).
- Authentication: JWT tokens with roles CUSTOMER, SELLER, ADMIN.
- Database: PostgreSQL (spring.datasource parameters DB_URL, DB_USERNAME, DB_PASSWORD).

Mandatory Rules:
1. Always permit '/error' in any Spring Security SecurityFilterChain (.requestMatchers("/error").permitAll()).
2. Multi-Vendor Scoping: Products have non-null 'sellerId'; order items snapshot 'sellerId' at checkout for seller-scoped queries (/orders/seller/mine).
3. Do not hardcode cloud passwords or secrets in application.yml.
4. Keep the graphify knowledge graph updated via `python -m graphify update .` after code edits.

Please review the codebase files and confirm you are ready to assist with ShopFlow tasks.
```

---

## 🧪 Step 6: Testing & Verification

- **Automated Maven Verification**: `mvn clean compile` across all modules.
- **Frontend Verification**: `cd frontend && npm run build` to verify React/TypeScript compilation.
- **E2E Playwright Suite**: Located in `frontend/Playwright`. Run tests using `npm test` inside `frontend/Playwright`.
