import { test, expect } from '../../src/fixtures/test-fixtures';
import { backpackTotals, checkoutDetails, products } from '../../src/data/checkout';
import type { CartPage } from '../../src/pages/CartPage';
import type { CheckoutPage } from '../../src/pages/CheckoutPage';
import type { InventoryPage } from '../../src/pages/InventoryPage';

async function openInformation(inventory: InventoryPage, cart: CartPage): Promise<void> {
  await inventory.addToCart(products.backpack);
  await inventory.openCart();
  await cart.expectLoaded();
  await cart.checkout();
}

async function openOverview(
  inventory: InventoryPage,
  cart: CartPage,
  checkout: CheckoutPage,
): Promise<void> {
  await openInformation(inventory, cart);
  await checkout.fillDetails(checkoutDetails);
}

test.describe('SUITE-04 Checkout', () => {
  test('TC-CHK-01 customer completes an order end to end @smoke @e2e', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    await openOverview(loggedInInventory, cartPage, checkoutPage);

    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
    await expect(loggedInInventory.cartBadge).toHaveCount(0);
  });

  test('TC-CHK-02/03/04 required fields are enforced', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    await openInformation(loggedInInventory, cartPage);

    await checkoutPage.fillDetails({ ...checkoutDetails, firstName: '' });
    await checkoutPage.expectError(/first name is required/i);

    await checkoutPage.fillDetails({ ...checkoutDetails, lastName: '' });
    await checkoutPage.expectError(/last name is required/i);

    await checkoutPage.fillDetails({ ...checkoutDetails, postalCode: '' });
    await checkoutPage.expectError(/postal code is required/i);
  });

  test('TC-CHK-05 cancel from information returns to cart', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await openInformation(loggedInInventory, cartPage);

    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/cart\.html/);
    expect(await cartPage.itemNames()).toEqual([products.backpack]);
  });

  test('TC-CHK-06 overview shows correct totals', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    await openOverview(loggedInInventory, cartPage, checkoutPage);

    await checkoutPage.expectOverview(
      backpackTotals.itemTotal,
      backpackTotals.tax,
      backpackTotals.total,
    );
  });

  test('TC-CHK-07 cancel from overview keeps the cart', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await openOverview(loggedInInventory, cartPage, checkoutPage);

    await checkoutPage.cancelButton.click();

    // Healer finding: this build returns to Products, not Your Cart. Cart data survives.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedInInventory.cartBadge).toHaveText('1');
    await loggedInInventory.openCart();
    expect(await cartPage.itemNames()).toEqual([products.backpack]);
  });

  test('TC-CHK-08 Back Home after completion', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await openOverview(loggedInInventory, cartPage, checkoutPage);
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();

    await checkoutPage.backHome();

    await expect(page).toHaveURL(/inventory\.html/);
    await loggedInInventory.expectLoaded();
    await expect(loggedInInventory.cartBadge).toHaveCount(0);
  });
});
