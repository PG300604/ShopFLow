import { test, expect } from '@playwright/test';

test.describe('ShopFlow E2E Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Open the mock application homepage
    await page.goto('/');
  });

  test('Page loads and displays core elements', async ({ page }) => {
    await expect(page).toHaveTitle(/ShopFlow Mock App/);
    await expect(page.locator('header h1')).toHaveText('ShopFlow Store');
  });

  test('Feature 1: Theme Switching & Persistence', async ({ page }) => {
    // Check initial light theme
    const body = page.locator('body');
    await expect(body).toHaveClass(/light-theme/);
    await expect(page.locator('#theme-display')).toHaveText('Light Mode');

    // Toggle theme to dark
    await page.click('#theme-toggle');
    await expect(body).toHaveClass(/dark-theme/);
    await expect(page.locator('#theme-display')).toHaveText('Dark Mode');

    // Reload page to verify persistence in localStorage
    await page.reload();
    await expect(body).toHaveClass(/dark-theme/);
    await expect(page.locator('#theme-display')).toHaveText('Dark Mode');

    // Toggle back to light
    await page.click('#theme-toggle');
    await expect(body).toHaveClass(/light-theme/);
  });

  test('Feature 2: Product Catalog Filtering', async ({ page }) => {
    // Verify initial products list
    const productGrid = page.locator('#product-grid');
    await expect(productGrid.locator('.product-card')).toHaveCount(3);

    // Filter by Kitchen category
    await page.click('button[data-category="Kitchen"]');
    await expect(productGrid.locator('.product-card')).toHaveCount(1);
    await expect(productGrid.locator('.product-card h3')).toHaveText('Premium Coffee Mug');

    // Filter back to all
    await page.click('button[data-category="all"]');
    await expect(productGrid.locator('.product-card')).toHaveCount(3);
  });

  test('Feature 3: Interactive Sliding Banner Carousel', async ({ page }) => {
    const activeSlide = page.locator('.slide.active');
    await expect(activeSlide).toContainText('Slide 1: Summer Sale');

    // Click next
    await page.click('#next-slide');
    await expect(activeSlide).toContainText('Slide 2: New Arrivals');

    // Click next again
    await page.click('#next-slide');
    await expect(activeSlide).toContainText('Slide 3: Free Shipping');

    // Click prev
    await page.click('#prev-slide');
    await expect(activeSlide).toContainText('Slide 2: New Arrivals');
  });

  test('Feature 4: Product Details & Reviews Submission', async ({ page }) => {
    // Click Details button on first product
    await page.click('.product-card:has-text("Premium Coffee Mug") .view-details-btn');

    // Verify detail pane opens
    const details = page.locator('#detail-section');
    await expect(details).toBeVisible();
    await expect(details.locator('#detail-title')).toHaveText('Premium Coffee Mug');
    await expect(details.locator('#detail-price')).toHaveText('15.99');

    // Submit review
    await page.fill('#review-rating', '5');
    await page.fill('#review-comment', 'E2E Smoke test comment!');
    await page.click('#review-form button[type="submit"]');

    // Verify review is added
    const lastReview = details.locator('.review-item').last();
    await expect(lastReview.locator('strong')).toHaveText('Rating: 5/5');
    await expect(lastReview.locator('p')).toHaveText('E2E Smoke test comment!');
  });

  test('Feature 5: Shopping Cart Drawer & Sync', async ({ page }) => {
    // Add product to cart
    await page.click('.product-card:has-text("Wireless Bluetooth Earbuds") .add-to-cart-btn');

    // Verify item in cart
    const cartItems = page.locator('#cart-items');
    await expect(cartItems.locator('.cart-item')).toHaveCount(1);
    await expect(cartItems.locator('.cart-item')).toContainText('Wireless Bluetooth Earbuds (x1)');
    await expect(page.locator('#cart-total')).toHaveText('49.99');

    // Sync cart with mock server
    await page.click('#sync-cart');
    const syncStatus = page.locator('#sync-status');
    await expect(syncStatus).toHaveText(/Cart synced successfully!/);
  });

  test('Feature 6: Checkout & Stripe Integration', async ({ page }) => {
    // Add item to cart first
    await page.click('.product-card:has-text("Ergonomic Desk Chair") .add-to-cart-btn');

    // Fill checkout form
    await page.fill('#checkout-name', 'John Doe');
    await page.fill('#checkout-email', 'john.doe@example.com');
    await page.fill('#stripe-card-number', '4242 4242 4242 4242');

    // Submit payment
    await page.click('#submit-payment');

    // Verify payment message
    const payMsg = page.locator('#payment-message');
    await expect(payMsg).toHaveText('Payment successful! Order confirmed.');

    // Verify cart is cleared after checkout
    await expect(page.locator('#cart-total')).toHaveText('0.00');
    await expect(page.locator('#cart-items')).toContainText('Your cart is empty.');
  });
});
