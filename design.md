# ShopFlow Design System & Style Guide (Pinterest Editorial Edition)

This guide defines the premium, high-contrast, editorial layout design system for the ShopFlow frontend, aligning with modern visual feeds (high-fashion grids, minimal tech layouts, and smooth-scroll interactive animations).

---

## 🎨 1. Palette & Theme System

The theme supports a high-contrast transition between light/dark modes and automatically adapts to system settings.

| Token | Light Mode (High-Contrast White) | Dark Mode (Void Black) | Design Purpose |
|---|---|---|---|
| **Primary Background** | `#FFFFFF` | `#050505` (Void Black) | Main viewport canvas |
| **Secondary Surface** | `#F5F5F7` (Off-white) | `#121212` (Slate Black) | Card panels and floating headers |
| **Glow / Highlight** | `#10B981` (Cyber Lime/Green) | `#10B981` | Accent color for badges and success states |
| **Active Focus** | `#000000` | `#FFFFFF` | Buttons, headers, primary text labels |
| **Text Main** | `#000000` | `#FFFFFF` | Direct visual readability |
| **Text Muted** | `#6B7280` (Muted Gray) | `#9CA3AF` | Subtitles, product descriptions, timestamps |
| **Borders** | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.08)` | Minimal separating borders |

---

## ✍️ 2. Editorial Typography
To emulate modern magazine/Pinterest grids, we pair a high-contrast serif header font with a technical, high-legibility sans-serif body font.

* **Primary Heading Font**: **Syne** (Google Fonts) — a wide, geometric display font for a striking, modern look, or **Playfair Display** for a luxury feel.
* **Secondary Body Font**: **Inter** (Google Fonts) — for ultimate crispness in descriptions, pricing, and specs.

### Hierarchy
* **Main Banner (Display H1)**: `48px / 3rem` | Font-Weight: `800 (Extra Bold)` | Letter-Spacing: `-0.03em`
* **Section Title (H2)**: `24px / 1.5rem` | Font-Weight: `700 (Bold)`
* **Product Title (H3)**: `16px / 1rem` | Font-Weight: `600 (Semi-Bold)`
* **Muted Body**: `14px / 0.875rem` | Line-Height: `1.6`

---

## 🌀 3. Layout, Scroll Animations & Sliding Windows

### A. The Sliding Ad Window (Banner Slider)
* **Visuals**: A full-width horizontal banner displaying high-end promotional graphics or product close-ups.
* **Animations**:
  * **Image transition**: Auto-crossfading with a zoom effect (`scale(1) -> scale(1.05)` over 5 seconds).
  * **Text overlay**: Fade-in and slide-up text elements (`translateY(20px) -> translateY(0)`) whenever the slide changes.

### B. Scroll-Triggered Reveal Animations
* **Grid Entry**: Product items fade in and slide up as they enter the viewport using scroll-triggered thresholds.
* **Parallax Cards**: Subtle parallax shifts on scroll backgrounds to create visual depth as the user navigates the catalog.

### C. Glassmorphism & Borders
* Cards use sharp `4px` corner radii (very thin, crisp borders) rather than round bubbly corners, matching premium editorial layouts.
* Navigation bars use high-blur backdrops:
  ```css
  backdrop-filter: blur(20px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.8); /* Light */
  background-color: rgba(5, 5, 5, 0.8);        /* Dark */
  ```

---

## 🎯 4. Iconography
We use **Lucide Icons** in a thin geometric weight (`stroke-width: 1.5`):
* Shopping cart: `shopping-cart` (outline)
* Star ratings: `star` (yellow fill when active, otherwise thin outline)
* Profile: `user` (outline)
* Close Drawer: `x` (outline)
* Theme indicator: `sun` (light mode), `moon` (dark mode), `monitor` (system theme)
