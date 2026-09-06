# 🚀 ShopFlow Production Deployment Guide

Complete step-by-step instructions for deploying the ShopFlow platform to production using **Vercel** (Frontend), **Render** (Backend Docker Microservices), **Supabase** (PostgreSQL Database), and **GitHub Actions** (CI/CD & Anti-Pause Keep-Alive Engine).

---

## 📑 Deployment Overview

```
                          ┌────────────────────────┐
                          │   Vercel Edge (CDN)    │
                          │   Vite + React SPA     │
                          └───────────┬────────────┘
                                      │ HTTPS (VITE_API_BASE_URL)
                                      ▼
                          ┌────────────────────────┐
                          │  Render Web Service    │
                          │   Spring Cloud Gateway │
                          └───────────┬────────────┘
                                      │ Private Network (Docker)
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │  auth-service   │       │ product-service │       │  order-service  │
   └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
            │                         │                         │
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │inventory-service│       │ payment-service │       │notification-svc │
   └────────┬────────┘       └─────────────────┘       └─────────────────┘
            │
            │ JDBC SSL Connections
            ▼
┌────────────────────────────────────────────────────────┐
│             Supabase Managed PostgreSQL                │
│    (Tables: users, products, orders, inventories...)   │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Step 1: Set Up Supabase (PostgreSQL Database)

1. Navigate to [supabase.com](https://supabase.com) and create a free project named **ShopFlow**.
2. Save your database password securely when prompted.
3. In your Supabase Dashboard, go to **Project Settings** (⚙️) $\rightarrow$ **Database**.
4. Scroll down to **Connection String** and select the **URI** or **JDBC** tab:
   - **Host**: e.g., `aws-0-us-east-1.pooler.supabase.com`
   - **Port**: `6543` (Session pooler) or `5432` (Direct connection)
   - **Database**: `postgres`
   - **User**: `postgres.[your-project-ref]`
5. Construct your Spring Boot connection values:
   ```properties
   DB_URL=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   DB_USERNAME=postgres.[your-project-ref]
   DB_PASSWORD=your_supabase_password
   ```
*(Spring Boot's `ddl-auto: update` will automatically create all tables: `users`, `products`, `orders`, `order_items`, `cart_items`, `inventories`, `reservations`, `reviews`, `promotions` upon first boot!)*

---

## ⚙️ Step 2: Deploy Backend Microservices on Render

ShopFlow includes an automated **Render Blueprint** (`render.yaml`) that configures the Eureka Service Registry, API Gateway, and all 6 domain microservices in Docker containers.

1. Sign up or log in at [render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub account and select the **ShopFlow** repository (`PG300604/ShopFLow`).
4. Render will detect `render.yaml` automatically and display the plan.
5. In the environment variable setup prompt, provide your configuration:
   - `DB_URL`: Your Supabase JDBC URL from Step 1.
   - `DB_USERNAME`: Your Supabase database user.
   - `DB_PASSWORD`: Your Supabase database password.
   - `JWT_SECRET`: A secure 256-bit string (e.g., `ShopFlowDefaultJwtSecretKeyForDev2026Base64StringLengthMinimum256Bits!`).
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (`sk_test_...`).
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret (`whsec_...`).
   - `MAIL_HOST`: `sandbox.smtp.mailtrap.io` (or SendGrid host).
   - `MAIL_USERNAME` / `MAIL_PASSWORD`: Your SMTP credentials.
6. Click **Apply**.
7. Once deployed, find your public API Gateway service (`shopflow-gateway`) URL:
   - Example: `https://shopflow-gateway.onrender.com`

---

## 🌐 Step 3: Deploy Frontend on Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your **ShopFlow** GitHub repository.
4. In the configuration window:
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Framework Preset**: `Vite` (automatically detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   ```env
   VITE_API_BASE_URL=https://shopflow-gateway.onrender.com/api
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
   ```
   *(Replace `https://shopflow-gateway.onrender.com` with your real Render Gateway URL from Step 2).*
6. Click **Deploy**. Vercel will build and assign your production domain (`https://shopflow-xxx.vercel.app`).

---

## ⚡ Step 4: Configure the Anti-Pause Keep-Alive Engine

On free-tier hosting:
- **Render** spins down inactive web services after 15 minutes of silence.
- **Supabase** pauses databases after 7 days without queries.

ShopFlow solves both problems simultaneously with a zero-cost **GitHub Actions Keep-Alive Engine** ([`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml)):

1. In your GitHub repository, go to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Click **New repository secret**.
3. Name: `RENDER_GATEWAY_URL`
4. Value: `https://shopflow-gateway.onrender.com` (Your Render Gateway URL from Step 2, without `/api`).
5. Click **Add secret**.

### How the Anti-Pause Works:
Every **14 minutes**, GitHub Actions automatically executes:
```bash
curl -s "$RENDER_GATEWAY_URL/api/products?page=0&size=1"
```
This triggers a complete round-trip:
1. Pings **Render API Gateway** (resets Render's 15-min idle timer $\rightarrow$ **prevents cold starts**).
2. Routes through **Eureka** to **`product-service`** (keeps microservices warm).
3. Executes a live `SELECT` query against **Supabase PostgreSQL** (resets Supabase's 7-day idle timer $\rightarrow$ **prevents database auto-pause**).

---

## 🔄 Step 5: Optional Automated Deploy Hooks in CI/CD

If you want pushes to `main` to trigger automatic re-deploys:
1. **Render Deploy Hook**: In Render Dashboard $\rightarrow$ your `shopflow-gateway` service $\rightarrow$ Settings $\rightarrow$ Deploy Hook $\rightarrow$ Copy URL. Add as repository secret `RENDER_DEPLOY_HOOK`.
2. **Vercel Deploy Hook**: In Vercel Project Settings $\rightarrow$ Git $\rightarrow$ Deploy Hooks $\rightarrow$ Create hook. Add as repository secret `VERCEL_DEPLOY_HOOK`.

Whenever you push code, `.github/workflows/ci-cd.yml` will test everything and trigger the deployment webhooks automatically.

---

## ✅ Step 6: Post-Deployment Verification Checklist

- [ ] **Health & Products**: Visit `https://<your-gateway>.onrender.com/api/products` — should return 200 OK with product catalog JSON.
- [ ] **Inventory Availability**: Visit `https://<your-gateway>.onrender.com/api/inventory` — should return 200 OK with stock list.
- [ ] **Frontend Storefront**: Visit your Vercel URL — catalog should render with products, price tags, and live stock badges.
- [ ] **Authentication**: Register a new user at `/register` and log in at `/login`.
- [ ] **Checkout**: Add an item to the cart, go to `/checkout`, enter shipping details, and confirm Stripe payment.
- [ ] **Keep-Alive**: Go to GitHub Actions $\rightarrow$ **Free-Tier Keep-Alive & Anti-Pause Engine** $\rightarrow$ Click **Run workflow** to test the automated ping.
