import { test, expect } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/checkout';

test.describe('Cart', () => {
  test('adding one product updates the badge @smoke', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart(products.backpack);

    await expect(loggedInInventory.cartBadge).toHaveText('1');
  });

  test('adding two products keeps the cart in sync', async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.addToCart(products.bikeLight);
    expect(await loggedInInventory.cartCount()).toBe(2);

    await loggedInInventory.openCart();
    await cartPage.expectLoaded();

    const names = await cartPage.itemNames();
    expect(names).toEqual(expect.arrayContaining([products.backpack, products.bikeLight]));
  });

  test('removing the last product hides the badge', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart(products.boltTshirt);
    await loggedInInventory.removeFromCart(products.boltTshirt);

    await expect(loggedInInventory.cartBadge).toHaveCount(0);
  });

  test('sorting by price low to high orders the list', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');

    const prices = await loggedInInventory.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
