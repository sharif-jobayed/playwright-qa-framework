import { test, expect } from '../../src/fixtures/test-fixtures';
import { checkoutDetails, products } from '../../src/data/checkout';

test.describe('Checkout', () => {
  test('customer completes an order end to end @smoke @e2e', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.openCart();
    await cartPage.expectLoaded();
    await cartPage.checkout();

    await checkoutPage.fillDetails(checkoutDetails);
    await checkoutPage.expectOrderSummary();
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });

  test('postal code is mandatory', async ({ loggedInInventory, cartPage, checkoutPage }) => {
    await loggedInInventory.addToCart(products.bikeLight);
    await loggedInInventory.openCart();
    await cartPage.checkout();

    await checkoutPage.fillDetails({ ...checkoutDetails, postalCode: '' });

    await expect(checkoutPage.errorMessage).toContainText(/postal code is required/i);
  });
});
