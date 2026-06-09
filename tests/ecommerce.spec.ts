import { test } from '../fixtures/test-fixtures';
import { calculateTotal } from '../test-data/products';

/**
 * E2E Test Suite for E-Commerce Demo Shop
 *
 * This test suite automates the following business workflow:
 * 1. Open the demo shop
 * 2. Verify shop heading is visible and says "Shop"
 * 3. Verify shopping cart is empty
 * 4. Add "Album" product to cart
 * 5. Navigate to cart page
 * 6. Increase quantity to 2
 * 7. Click "Update cart"
 * 8. Verify the updated total price (30,00 €)
 */

test.describe('E-Commerce Shopping Workflow', () => {
  
  test('Complete purchase workflow: Add Album to cart and update quantity', async ({ shopPage, cartPage, testData }) => {
    // Test data - fully data-driven, no hard-coded values!
    const product = testData.ALBUM;
    const quantity = 2;

    // Step 1: Open the demo shop
    await test.step('Navigate to demo shop', async () => {
      await shopPage.goto();
    });

    // Step 2: Verify the heading is visible and says "Shop"
    await test.step('Verify shop heading', async () => {
      await shopPage.verifyShopHeading();
    });

    // Step 3: Verify shopping cart is empty
    await test.step('Verify cart is empty', async () => {
      await shopPage.verifyCartIsEmpty();
    });

    // Step 4: Add product to cart by clicking "Add to cart"
    await test.step(`Add ${product.name} product to cart`, async () => {
      await shopPage.addAlbumToCart();
    });

    // Step 5: Navigate to cart by clicking "View cart"
    await test.step('Navigate to shopping cart', async () => {
      await shopPage.goToCart();
      await cartPage.waitForCartPage();
    });

    // Step 6: Increase quantity to 2
    await test.step(`Update quantity to ${quantity}`, async () => {
      await cartPage.updateAlbumQuantity(quantity);
    });

    // Step 7: Click "Update cart"
    await test.step('Click Update cart button', async () => {
      await cartPage.clickUpdateCart();
    });

    // Step 8: Verify the updated total price (calculated automatically)
    await test.step(`Verify total price is ${calculateTotal(product, quantity)}`, async () => {
      await cartPage.verifyTotalPrice(product, quantity);
    });
  });  

  test('Placeholder test to verify test suite setup', async ({ shopPage }) => {
    // Simple test to verify that the test suite is set up correctly
    await test.step('Navigate to demo shop and verify heading', async () => {
      await shopPage.goto();
      await shopPage.verifyShopHeading();
    });
  });

});
