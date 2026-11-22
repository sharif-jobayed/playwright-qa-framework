import { test, expect } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/checkout';

test.describe('SUITE-03 Cart', () => {
  test('TC-CART-01 adding one product updates the badge @smoke', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart(products.backpack);

    await expect(loggedInInventory.cartBadge).toHaveText('1');
    await loggedInInventory.expectButton(products.backpack, 'Remove');
  });

  test('TC-CART-02 two products appear in the cart', async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.addToCart(products.bikeLight);
    expect(await loggedInInventory.cartCount()).toBe(2);

    await loggedInInventory.openCart();
    await cartPage.expectLoaded();

    expect(await cartPage.itemNames()).toEqual([products.backpack, products.bikeLight]);
    await expect(cartPage.items).toHaveCount(2);
  });

  test('TC-CART-03 removing one product keeps the other', async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.addToCart(products.bikeLight);

    await loggedInInventory.openCart();
    await cartPage.expectLoaded();
    await cartPage.removeItem(products.backpack);

    expect(await cartPage.itemNames()).toEqual([products.bikeLight]);
    await expect(loggedInInventory.cartBadge).toHaveText('1');
  });

  test('TC-CART-04 removing the last product clears the badge', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart(products.boltTshirt);
    await loggedInInventory.removeFromCart(products.boltTshirt);

    await expect(loggedInInventory.cartBadge).toHaveCount(0);
    await expect(loggedInInventory.cartLink).toHaveAttribute('aria-label', 'Cart, empty');
  });

  test('TC-CART-05 Continue Shopping returns to products', async ({
    loggedInInventory,
    cartPage,
    page,
  }) => {
    await loggedInInventory.addToCart(products.bikeLight);
    await loggedInInventory.openCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedInInventory.cartBadge).toHaveText('1');
  });
});
