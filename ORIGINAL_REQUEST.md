# Original User Request

## 2026-07-08T16:36:59Z

A modern, highly premium Vite (React + TypeScript) frontend for the ShopFlow e-commerce platform, inspired by the premium visual aesthetics of the design reference: https://pin.it/4f6RH3lm9.

Working directory: d:/ShopFlow/frontend
Integrity mode: development

Please refer to the design system in design.md at the root of the project (d:/ShopFlow/design.md) for complete theme tokens, typography specs, layout rules, and Lucide icons mapping.

## Requirements

### R1. Theme Compatibility (Light, Dark, System)
The interface must support a light mode, a dark mode, and an automatic theme that adapts to the user's system preferences.

### R2. Advanced Scroll & Sliding Animations
The frontend must implement smooth scrolling, scroll-triggered reveal animations, and a sliding interactive space (carousel/banner window) for advertisements or promotions. The design styling and animations should align with the premium aesthetic of the design reference.

### R3. Core E-commerce Views
The application must present a homepage with a product catalog, detail views (with reviews/ratings display), a persistent shopping cart sidebar/drawer, and a checkout form interface.

### R4. Technology Stack Constraints
The application must be built using Vite (React + TypeScript) and styled with Vanilla CSS only (no Tailwind CSS, no CSS frameworks). It may use animation libraries (such as Framer Motion or GSAP) for scroll transitions.

## Acceptance Criteria

### UI/UX & Themes
- [ ] Theme toggling works seamlessly (Light, Dark, System Auto) and persists across reloads.
- [ ] Interface layout is fully responsive across desktop, tablet, and mobile screens.

### Animations & Interactivity
- [ ] Scroll animations (reveal, fade, or parallax) execute smoothly without stuttering or breaking layout elements.
- [ ] Sliding ad window supports auto-scroll and manual navigation controls.

### Integration
- [ ] The frontend successfully connects to the local microservices gateway API (http://localhost:8080) to fetch catalog data, manage cart, submit reviews, and complete orders.
