import { test, expect } from '../../src/fixtures/test-fixtures';
import { allProductNames, prices, products } from '../../src/data/checkout';

test.describe('SUITE-02 Product catalogue', () => {
  test('TC-CAT-01 lists six products with names and prices @smoke', async ({ loggedInInventory }) => {
    await expect(await loggedInInventory.names()).toEqual(allProductNames);
    expect(await loggedInInventory.prices()).toEqual([
      29.99, 9.99, 15.99, 49.99, 7.99, 15.99,
    ]);
  });

  test('TC-CAT-02 default order is name A to Z', async ({ loggedInInventory }) => {
    await loggedInInventory.expectSort('az');
    expect(await loggedInInventory.names()).toEqual(allProductNames);
  });

  test('TC-CAT-03 sorts name Z to A', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');

    expect(await loggedInInventory.names()).toEqual([...allProductNames].reverse());
  });

  test('TC-CAT-04 sorts price low to high', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');

    const values = await loggedInInventory.prices();
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect((await loggedInInventory.names())[0]).toBe(products.onesie);
    expect((await loggedInInventory.names()).at(-1)).toBe(products.fleeceJacket);
  });

  test('TC-CAT-05 sorts price high to low', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('hilo');

    const values = await loggedInInventory.prices();
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect((await loggedInInventory.names())[0]).toBe(products.fleeceJacket);
    expect((await loggedInInventory.names()).at(-1)).toBe(products.onesie);
  });

  test('TC-CAT-06 product detail shows the selected item', async ({ loggedInInventory }) => {
    await loggedInInventory.openProduct(products.backpack);

    await loggedInInventory.expectProductDetail(products.backpack, prices.backpack);
  });
});
