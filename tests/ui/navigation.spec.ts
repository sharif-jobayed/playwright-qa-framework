import { test } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/checkout';

test.describe('SUITE-05 Session and navigation', () => {
  test('TC-NAV-01 menu opens and closes', async ({ loggedInInventory, menu }) => {
    await loggedInInventory.expectLoaded();
    await menu.open();
    await menu.expectMenuItems();

    await menu.close();
    await menu.expectOpenButtonVisible();
  });

  test('TC-NAV-02 Reset App State clears the cart', async ({ loggedInInventory, menu }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.expectCartCount(1);

    await menu.open();
    await menu.resetAppState();
    await menu.allItems();

    await loggedInInventory.expectLoaded();
    await loggedInInventory.expectCartCount(0);
  });
});
