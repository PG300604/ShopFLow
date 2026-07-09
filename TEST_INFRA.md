# ShopFlow E2E Test Infrastructure

This document outlines the directory layout, execution instructions, testing philosophy, and detailed testing scenarios for the ShopFlow application.

---

## 1. Test Runner Command & Instructions

### Setup
Ensure Node.js (v18+) is installed on your system. Navigate to the Playwright directory and install the necessary dependencies:

```bash
cd frontend/Playwright
npm install
```

If Playwright browsers are not yet installed, download them using:
```bash
npx playwright install chromium
```

### Execution
To execute the smoke tests against the mock server, run:
```bash
npx playwright test
```

To run tests in UI Mode (with interactive debugging):
```bash
npx playwright test --ui
```

To run a specific test file:
```bash
npx playwright test tests/smoke.spec.ts
```

---

## 2. Directory Layout of the E2E Setup

```
d:/ShopFlow/frontend/Playwright/
├── mock-app/
│   └── index.html             # Single Page Mock Application simulating all features
├── scripts/
│   └── mock-server.js         # Express-based mock server to serve mock-app & mock API endpoints
├── tests/
│   └── smoke.spec.ts          # Playwright smoke test checking features 1-6
├── package.json               # Node dependencies & test running scripts
├── playwright.config.ts       # Playwright project configurations and local webServer launch
└── tsconfig.json              # TypeScript compilation setup
```

---

## 3. Test Philosophy

Our testing approach is built around four core principles:

1. **Opaque-Box Testing**: E2E tests interact with the application purely from the user's perspective (clicking buttons, typing inputs, observing visible text). They do not access internal code states, database connections, or component properties.
2. **Requirement-Driven**: Tests are mapped directly to user requirements and features rather than code modules.
3. **Progressive Testability**: Testing scaffolding starts with simple mocks, progresses to API simulation, and is designed to eventually switch target URLs to the live production services without changing test logic.
4. **4-Tier Design Methodology**:
   - **Tier 1 (Happy Path)**: Verifies standard user flow under optimal conditions.
   - **Tier 2 (Edge Cases & Boundaries)**: Verifies input validations, boundary values, empty states, and invalid inputs.
   - **Tier 3 (User Flow / Combinations / Integration)**: Verifies multi-step user workflows and multi-feature interaction.
   - **Tier 4 (System Failures & Recovery / Complex Scenarios)**: Verifies error handling, network drops, server offline fallbacks, and storage recovery.

---

## 4. Feature Inventory & Detailed Test Scenarios

### Feature 1: Theme Switching & Persistence
#### Tier 1: Happy Path (5 Scenarios)
1. **Default light theme**: Verify the page loads with class `light-theme` active on the body and displaying text "Light Mode".
2. **Toggle to dark**: Clicking `#theme-toggle` switches the body class to `dark-theme` and displays "Dark Mode".
3. **Toggle back to light**: Clicking `#theme-toggle` again switches body class back to `light-theme` and displays "Light Mode".
4. **LocalStorage verification (Dark)**: Verify `localStorage.getItem('theme')` is updated to `'dark'` when switched.
5. **LocalStorage verification (Light)**: Verify `localStorage.getItem('theme')` is updated to `'light'` when switched back.

#### Tier 2: Edge Cases & Boundaries (5 Scenarios)
1. **No storage state**: Load page with cleared localStorage -> falls back gracefully to default light theme.
2. **Corrupt storage value**: If localStorage contains `'invalid_theme_val'` -> defaults to light theme without crashing.
3. **High frequency toggle**: Simulate fast successive clicks (5 times in < 1 second) on toggle -> ensure application state remains consistent with UI label.
4. **Contrast check**: Contrast ratio of text and background elements in both theme classes meets WCAG AA standards.
5. **Aria-live announcement**: Theme updates trigger appropriate screen reader/aria-live announcements.

#### Tier 3: Combinations (Integration)
1. **Theme toggle inside Drawer**: Open cart drawer in light theme -> toggle theme -> verify drawer background and text transition styling.
2. **Theme toggle during form input**: Type checkout info -> toggle theme -> verify input fields retain text and focus.
3. **Theme toggle with active modal**: Open product details modal -> toggle theme -> verify modal remains open and readable.

#### Tier 4: System Failures & Recovery
1. **LocalStorage write failure**: If localStorage is disabled (SecurityException/Incognito) -> theme toggler still works in-memory during the session.

---

### Feature 2: Product Catalog (Grid, Categories, Pagination, Animations)
#### Tier 1: Happy Path (5 Scenarios)
1. **Grid display**: Product catalog grid renders at least 3 initial items.
2. **Kitchen filter**: Click "Kitchen" category button -> grid displays only kitchen items.
3. **Electronics filter**: Click "Electronics" category button -> grid displays only electronics items.
4. **Office filter**: Click "Office" category button -> grid displays only office items.
5. **All filter**: Click "All" category button -> grid displays all items.

#### Tier 2: Edge Cases & Boundaries (5 Scenarios)
1. **Empty category**: If a category has no products -> displays clear message "No products found in this category".
2. **Name length overflow**: Products with very long names are truncated with ellipsis or wrap without breaking grid alignment.
3. **Image fallback**: If a product image URL fails to load -> displays clean placeholder image.
4. **API failure fallback**: If product fetch from `/api/products` fails -> page displays fallback mock products.
5. **Responsive grid resizing**: Verify grid layout changes from 3-column to 1-column on mobile screen widths.

#### Tier 3: Combinations (Integration)
1. **Filter and Add**: Filter catalog to "Kitchen" -> add item to cart -> filter catalog to "Electronics" -> verify cart retains the Kitchen item.
2. **Filter and View Details**: Filter catalog to "Office" -> click "Details" on an office item -> verify detail view opens for correct product.
3. **Pagination and Filter**: Click next page -> change category filter -> verify pagination resets to page 1.

#### Tier 4: System Failures & Recovery
1. **Backend disconnected**: Simulating network disconnect during category filter fetch -> shows "Connection lost. Displaying cached products" bar.

---

### Feature 3: Interactive Sliding Banner Carousel
#### Tier 1: Happy Path (5 Scenarios)
1. **First slide default**: First slide banner is visible by default.
2. **Next slide click**: Click `>` arrow -> Slide 2 becomes visible, Slide 1 hidden.
3. **Second next slide click**: Click `>` arrow again -> Slide 3 becomes visible.
4. **Prev slide click**: Click `<` arrow on Slide 2 -> Slide 1 becomes visible.
5. **Auto-advance**: Leave carousel idle -> automatically advances to next slide after timer interval.

#### Tier 2: Edge Cases & Boundaries (5 Scenarios)
1. **Right end wrapping**: Click `>` on the last slide -> wraps around to the first slide.
2. **Left end wrapping**: Click `<` on the first slide -> wraps around to the last slide.
3. **Banner action click**: Clicking a promotional link/button inside a slide redirects to the correct category catalog view.
4. **Timer pause on hover**: Hovering mouse over slide pauses the auto-advance timer.
5. **Timer reset on manual action**: Clicking next/prev manual navigation resets the auto-advance timer to prevent instant jumping.

#### Tier 3: Combinations (Integration)
1. **Redirect from Slide**: Click Slide 1 ("Summer Sale") promo button -> verify page catalog filters to Kitchen products.
2. **Carousel and Theme Toggle**: Toggle theme -> carousel background and text color transition correctly and remain readable.
3. **Carousel swipe gesture**: Use touch swipe emulation to navigate slides.

#### Tier 4: System Failures & Recovery
1. **Carousel assets offline**: Banner images fail to load -> text contents and CTA buttons remain styled and clickable.

---

### Feature 4: Product Details & Reviews Submission
#### Tier 1: Happy Path (5 Scenarios)
1. **Details panel display**: Click "Details" on a product card -> displays title, price, description.
2. **Preloaded reviews list**: Detail pane displays preloaded mock customer reviews.
3. **Submit valid review**: Fill review form (5 rating, "Love it") -> review is appended to reviews list.
4. **Form clearing**: Submitting review clears input fields.
5. **Rating persistence**: Product overall average rating updates or handles review submission in-memory.

#### Tier 2: Edge Cases & Boundaries (5 Scenarios)
1. **HTML5 validation - missing rating**: Submitting review without rating is blocked.
2. **HTML5 validation - missing comment**: Submitting review without comment is blocked.
3. **Out-of-range rating**: Attempting to submit rating of `6` or `0` throws form validation error.
4. **Sanitized comments**: Submit comment containing HTML/JS tags `<script>alert('x')</script>` -> renders as plain text without execution.
5. **Extremely long review**: Submit 1000-character comment -> reviews panel expands gracefully without breaking layout.

#### Tier 3: Combinations (Integration)
1. **Submit and toggle details**: View details -> submit review -> close details -> reopen details -> verify review still persists.
2. **Add to cart from details**: View details -> click "Add to Cart" button from details section -> verify cart updates.
3. **Add multiple reviews**: Submit two reviews in sequence -> verify both render in order.

#### Tier 4: System Failures & Recovery
1. **Submit API Timeout**: Submit review when mock API is lagging -> shows spinner on button -> times out and displays "Saving locally" message.

---

### Feature 5: Persistent Shopping Cart Drawer & Backend Sync
#### Tier 1: Happy Path (5 Scenarios)
1. **Add item**: Click "Add to Cart" -> cart drawer item count increases.
2. **Total calculation**: Adding multiple items calculates correct sum total.
3. **Clear cart**: Click "Clear" -> cart items are removed and total resets to 0.00.
4. **Sync success**: Click "Sync Cart" -> status message displays "Cart synced successfully!".
5. **Quantity display**: Item is listed with correct quantity (e.g. `(x1)`).

#### Tier 2: Edge Cases & Boundaries (5 Scenarios)
1. **Persistence on reload**: Add item to cart -> reload page -> cart drawer retains same items and total.
2. **Duplicate add**: Click "Add to Cart" on same item twice -> increases quantity to `(x2)` without adding a new row.
3. **Empty cart sync**: Click "Sync Cart" on an empty cart -> displays success for syncing 0 items.
4. **Large quantity boundary**: Incrementing quantities to high numbers adjusts price accurately.
5. **Currency formatting**: Ensure prices are formatted to two decimal places (e.g., $15.99).

#### Tier 3: Combinations (Integration)
1. **Catalog filter & Cart sync**: Filter items -> add -> sync -> verify sync sends complete payload regardless of filter.
2. **Checkout cart clear**: Add items -> complete checkout -> verify cart is automatically cleared.
3. **Cart drawer toggle visibility**: Toggle cart drawer visibility while maintaining cart items state.

#### Tier 4: System Failures & Recovery
1. **Sync API 500 error**: Sync cart when server returns 500 -> shows error message "Sync failed" but preserves local cart state.

---

### Feature 6: Checkout Form & Stripe Payment Element Integration
#### Tier 1: Happy Path (5 Scenarios)
1. **Form fields**: Checkout form contains fields for Name, Email, and Card.
2. **Payment submission**: Click "Pay Now" with valid details -> processes payment.
3. **Success response**: "Payment successful! Order confirmed." message is displayed.
4. **Clear cart on success**: Shopping cart clears to empty after successful checkout.
5. **Form resets**: Form fields are cleared on checkout success.

#### Tier 2: Edge Cases & Boundaries (5 Scenarios)
1. **Email format validation**: Entering invalid email (e.g. `invalid-email`) is blocked by browser validation.
2. **Empty card validation**: Submitting form with empty mock Stripe card field is blocked or shows error.
3. **Double submission protection**: Clicking "Pay Now" disables button immediately during processing.
4. **Zero total checkout**: Attempting checkout with empty cart displays warning or disables checkout.
5. **Theme compliance**: Stripe mock elements update borders and background based on dark/light theme classes.

#### Tier 3: Combinations (Integration)
1. **Complete E2E checkout**: Add products -> view details -> write review -> fill form -> complete payment successfully.
2. **Form state persistence**: Fill checkout form -> toggle dark theme -> verify fields remain populated.
3. **Update cart mid-checkout**: Fill checkout form -> add another item from catalog -> verify form fields remain filled.

#### Tier 4: System Failures & Recovery
1. **Stripe payment failure**: Backend returns client secret error -> checkout form displays "Payment processor error: insufficient funds".
2. **Network cut mid-submit**: Network goes offline after clicking "Pay Now" -> displays connection error and instructions to not refresh.
