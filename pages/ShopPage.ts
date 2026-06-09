import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Shop main page
 */
export class ShopPage {
  readonly page: Page;
  readonly shopHeadingLocator: Locator;
  readonly cartCountLocator: Locator;
  readonly viewCartButtonLocator: Locator;

  // ALBUM
  readonly albumAddToCartButtonLocator: Locator;

  constructor(page: Page) {
    this.page = page;

    // General Locators
    this.shopHeadingLocator = page.locator('h1.page-title');
    this.cartCountLocator = page.locator('.cart-contents .count');
    //this.viewCartButtonLocator = page.locator("//a[@data-product_id='22']/..//a[@title='View cart']");
    this.viewCartButtonLocator = page.locator("a[title='View cart']").first()

    // ALBUM
    this.albumAddToCartButtonLocator = page.locator("//a[@data-product_id='22' and text()='Add to cart']");
  }

  /**
   * Navigate to the shop page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify the shop heading is visible and has correct text
   */
  async verifyShopHeading() {
    await expect(this.shopHeadingLocator).toBeVisible();
    await expect(this.shopHeadingLocator).toHaveText('Shop');
  }

  /**
   * Verify the cart is empty (shows 0 items)
   */
  async verifyCartIsEmpty() {
    await expect(this.cartCountLocator).toHaveText('0 items');
  }

  /**
   * Add Album product to cart
   */
  async addAlbumToCart() {
    await expect(this.albumAddToCartButtonLocator).toBeVisible();
    await this.albumAddToCartButtonLocator.click();
    await expect(this.viewCartButtonLocator).toBeVisible({ timeout: 10000 });
  }

  /**
   * Navigate to cart page by clicking "View cart"
   */
  async goToCart() {
    await this.viewCartButtonLocator.click();
    await this.page.waitForLoadState('networkidle');
  }
}
