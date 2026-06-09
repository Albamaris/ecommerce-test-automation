import { test as base } from '@playwright/test';
import { ShopPage } from '../pages/ShopPage';
import { CartPage } from '../pages/CartPage';
import { PRODUCTS } from '../test-data/products';

/**
 * Custom Fixtures für wiederverwendbare Test-Komponenten
 */

type MyFixtures = {
  shopPage: ShopPage;
  cartPage: CartPage;
  testData: typeof PRODUCTS;
};

export const test = base.extend<MyFixtures>({
  // Shop Page automatisch initialisieren
  shopPage: async ({ page }, use) => {
    const shopPage = new ShopPage(page);
    await use(shopPage);
  },

  // Cart Page automatisch initialisieren
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // Test-Daten als Fixture
  testData: async ({}, use) => {
    await use(PRODUCTS);
  },
});

export { expect } from '@playwright/test';
