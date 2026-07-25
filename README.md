# 🛍️ ShopFlow - Multi-Vendor E-Commerce Platform

![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-brightgreen.svg)
![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.2-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)

ShopFlow is a modern, high-performance e-commerce platform built with a Java Spring Boot microservices architecture and a Vite + React + TypeScript frontend featuring a modern glassmorphic design system.

---

## 🏗️ Architecture Overview

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

---

## 🧩 Microservices Breakdown

| Service | Port | Description |
|---------|------|-------------|
| **`eureka-server`** | `8761` | Netflix Eureka Service Discovery & Health Dashboard |
| **`api-gateway`** | `8080` | Spring Cloud API Gateway with unified route dispatching |
| **`auth-service`** | `8081` | User registration, authentication, & role-based JWT issuance (`CUSTOMER`, `SELLER`, `ADMIN`) |
| **`product-service`** | `8082` | Product catalog management, category filtering, seller-scoped listings, & review/ratings |
| **`order-service`** | `8083` | Shopping cart synchronization, seller-scoped line items, & order checkout processing |
| **`payment-service`** | `8084` | Stripe Payment Element integration & webhook processing |
| **`inventory-service`** | `8085` | Stock reservation tracking & inventory lock management |
| **`notification-service`** | `8086` | Email notification service for order confirmations & shipping updates |

---

## 💻 Frontend Application

- **Technology**: Vite + React 18 + TypeScript
- **Styling**: Pure Vanilla CSS (custom design system, dark/light theme support, responsive glassmorphism)
- **State & Routing**: Context API, React Router, persistent shopping cart drawer

---

## 🚀 Quick Start Guide

### Prerequisites
- **JDK 17** (Adoptium / Temurin)
- **Node.js LTS** (`v18+` / `v24+`)
- **Apache Maven 3.9+**
- **PostgreSQL** (Local or Supabase)

### 1. Environment Variables Configuration

Set environment variables or use default fallbacks:

```bash
export DB_URL="jdbc:postgresql://localhost:5432/shopflow"
export DB_USERNAME="postgres"
export DB_PASSWORD="your_password"
export JWT_SECRET="YourBase64OrSecure256BitSecretKeyHere!"
export STRIPE_SECRET_KEY="sk_test_..."
```

### 2. Build the Microservices & Frontend

```bash
# Build all backend microservices
mvn clean package -DskipTests

# Build frontend production bundle
cd frontend
npm install
npm run build
```

### 3. Launch All Services (One-Click Startup)

On Windows PowerShell:

```powershell
.\start_services.ps1
```

Access the platform at:
- **Frontend App**: `http://localhost:5173`
- **API Gateway**: `http://localhost:8080`
- **Eureka Dashboard**: `http://localhost:8761`

---

## 🛠️ Automated PC Setup (Windows)

On a fresh Windows environment, run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup_new_pc.ps1
```

This will automatically install Git, Node.js, JDK 17, Maven, VS Code, set `JAVA_HOME`, and configure the system `PATH`.

---

## 📄 License

This project is open-source under the MIT License.
