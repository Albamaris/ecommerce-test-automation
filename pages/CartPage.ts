import { Page, Locator, expect } from '@playwright/test';
import { Product, calculateTotal } from '../test-data/products';

/**
 * Page Object for the Shopping Cart page
 * ALL locators are FIXED and defined in constructor.
 * NO dynamic locator building in methods!
 */
export class CartPage {
  readonly page: Page;
  readonly cartHeadingLocator: Locator;
  readonly updateCartButtonLocator: Locator;
  readonly cartTotalLocator: Locator;

  // ALBUM Product in Cart
  readonly albumQuantityInputLocator: Locator;

  constructor(page: Page) {
    this.page = page;

    // General Cart Locators
    this.cartHeadingLocator = page.locator('h1.entry-title');
    this.updateCartButtonLocator = page.locator('button[name="update_cart"]');
    this.cartTotalLocator = page.locator('.order-total .woocommerce-Price-amount');

    // ALBUM
    this.albumQuantityInputLocator = page.locator("//input[@class='input-text qty text']");
  }

  /**
   * Wait for cart page to be fully loaded
   */
  async waitForCartPage() {
    await expect(this.cartHeadingLocator).toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Update the quantity of Album in the cart
   */
  async updateAlbumQuantity(quantity: number) {
    await this.albumQuantityInputLocator.clear();
    await this.albumQuantityInputLocator.fill(quantity.toString());
  }

  /**
   * Click the "Update cart" button and wait for cart update to complete
   * Uses waitForResponse to wait for the specific AJAX update request
   */
  async clickUpdateCart() {
    // Setup: Wait for the cart update AJAX request (WooCommerce specific)
    const updateResponsePromise = this.page.waitForResponse(
      response => (
        response.url().includes('wc-ajax=update_order_review') ||
        response.url().includes('?update-cart') ||
        (response.url().includes('/cart') && response.request().method() === 'POST')
      ) && response.status() === 200
    );

    // Click the update button
    await this.updateCartButtonLocator.click();

    // Wait for the AJAX request to complete successfully
    await updateResponsePromise;

    // Verify: Button should be disabled after update
    await expect(this.updateCartButtonLocator).toBeDisabled();
  }

  /**
   * Verify the total price in the cart
   */
  async verifyTotalPrice(product: Product, quantity: number) {
    const expectedPrice = calculateTotal(product, quantity);
    await expect(this.cartTotalLocator).toContainText(expectedPrice, { timeout: 10000 });
  }
}
