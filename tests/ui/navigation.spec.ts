import { test, expect } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/checkout';

test.describe('SUITE-05 Session and navigation', () => {
  test('TC-NAV-01 menu opens and closes', async ({ loggedInInventory, menu }) => {
    await loggedInInventory.expectLoaded();
    await menu.open();
    await menu.expectMenuItems();

    await menu.close();
    await menu.expectOpenButtonVisible();
  });

  test('TC-NAV-02 Reset App State clears the cart', async ({ loggedInInventory, menu, page }) => {
    await loggedInInventory.addToCart(products.backpack);
    await expect(loggedInInventory.cartBadge).toHaveText('1');

    await menu.open();
    await menu.resetAppState();
    await menu.allItems();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedInInventory.cartBadge).toHaveCount(0);
  });
});
