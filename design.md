# ShopFlow Design System & Style Guide

This document defines the unified design language, color tokens, typography, component specs, and iconography for the ShopFlow frontend. It serves as the single source of truth for UI/UX consistency across all views (catalog, cart, checkout, order history, and admin panels).

---

## 🎨 1. Theme & Color Tokens (Neon Obsidian)
ShopFlow uses a premium, modern dark-mode aesthetic featuring **glassmorphism**, subtle glowing borders, and vibrant gradient highlights to provide a high-end, developer-oriented resume project look.

| Token | HSL / RGBA | Hex Equivalent | Purpose |
|---|---|---|---|
| **Background** | `hsl(222, 47%, 11%)` | `#0F172A` | Base app background (Deep Obsidian) |
| **Card / Surface** | `rgba(30, 41, 59, 0.7)` | `#1E293B` (70%) | Container surfaces with `backdrop-filter: blur(12px)` |
| **Border / Stroke** | `rgba(255, 255, 255, 0.08)` | — | Subtle borders separating cards and sections |
| **Accent Primary** | `hsl(262, 83%, 58%)` | `#6D28D9` | Neon Violet (Main brand color, active states) |
| **Accent Secondary** | `hsl(189, 94%, 43%)` | `#06B6D4` | Cyber Cyan (Highlights, success states, success alerts) |
| **Text Main** | `hsl(210, 40%, 98%)` | `#F8FAFC` | Headings and primary labels |
| **Text Muted** | `hsl(215, 16%, 65%)` | `#94A3B8` | Body text, descriptions, and secondary labels |
| **Text Alert** | `hsl(0, 84%, 60%)` | `#EF4444` | Errors, low-stock warnings, cancellations |

---

## ✍️ 2. Typography & Hierarchy
We use **Outfit** (for geometric headings) and **Inter** (for high-legibility body copy). Both fonts are imported from Google Fonts.

* **Main Heading (H1)**: `32px / 2rem` | Font-Weight: `700 (Bold)` | Letter-Spacing: `-0.025em`
* **Sub-Heading (H2)**: `24px / 1.5rem` | Font-Weight: `600 (Semi-Bold)`
* **Card Title (H3)**: `18px / 1.125rem` | Font-Weight: `600 (Semi-Bold)`
* **Body text**: `14px / 0.875rem` | Font-Weight: `400 (Regular)` | Line-Height: `1.5`
* **Labels / Small**: `12px / 0.75rem` | Font-Weight: `500 (Medium)`

---

## ⚡ 3. Micro-Animations & Interactivity
To make the interface feel responsive and premium:
* **Hover Scale**: Hovering on product cards scales the element slightly (`transform: scale(1.02); transition: all 0.3s ease;`).
* **Active Glow**: Primary buttons and active input fields display a soft violet glow shadow on focus/hover:
  ```css
  box-shadow: 0 0 15px rgba(109, 40, 217, 0.4);
  ```
* **Page Transitions**: Smooth fade-in animations for all containers:
  ```css
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```

---

## 📦 4. UI Components Specifications

### A. Navigation Bar (Floating Glass Header)
* **Layout**: Fixed top, width `100%`, flexbox layout with space-between.
* **Style**: Backdropped card surface, border-bottom `1px solid rgba(255, 255, 255, 0.08)`.
* **Left**: Futuristic geometric logo text `ShopFlow` (Gradient fill: Cyan to Violet).
* **Right**: Icons for search, cart (with a glowing red count badge), and profile.

### B. Product Cards
* **Border**: Soft border glow on hover.
* **Image**: Fixed aspect ratio (`aspect-ratio: 4/3`), object-fit cover.
* **Footer**: Title, HSL-colored category tag, price in cyan (`#06B6D4`), and a violet cart button.

### C. Buttons
* **Primary (Glow-Gradient)**: Linear gradient from Violet (`#6D28D9`) to Cyan (`#06B6D4`). Text is white, border-radius `8px`.
* **Secondary (Ghost)**: Transparent background, white border `1px solid rgba(255,255,255,0.2)`. Violet text on hover.

### D. Shopping Cart Drawer
* **Style**: Slides in from the right edge.
* **Content**: List of added items, price calculator, and a checkout button.
* **Micro-interaction**: Smooth overlay backdrop fade.

---

## 🎯 5. Iconography
We use **Lucide Icons** (clean, thin outline geometric strokes, matching the design aesthetic):
* 🛒 `shopping-cart` — Add to Cart, Cart Drawer
* 👤 `user` — Profile info, Login status
* 📦 `package` — Product management, Orders history
* 🌟 `star` — Review ratings (Solid yellow for active star, outline for empty)
* ⚠️ `alert-triangle` — Low stock reorder warning, cancelled orders
* 💳 `credit-card` — Stripe checkout trigger
* 🔑 `key` — Internal security indicator
