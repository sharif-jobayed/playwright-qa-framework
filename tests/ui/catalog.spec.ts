import { test } from '../../src/fixtures/test-fixtures';
import { allProductNames, prices, products } from '../../src/data/checkout';

test.describe('SUITE-02 Product catalogue', () => {
  test('TC-CAT-01 lists six products with names and prices @smoke', async ({ loggedInInventory }) => {
    await loggedInInventory.expectProductNames(allProductNames);
    await loggedInInventory.expectPrices([29.99, 9.99, 15.99, 49.99, 7.99, 15.99]);
  });

  test('TC-CAT-02 default order is name A to Z', async ({ loggedInInventory }) => {
    await loggedInInventory.expectSort('az');
    await loggedInInventory.expectProductNames(allProductNames);
  });

  test('TC-CAT-03 sorts name Z to A', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');

    await loggedInInventory.expectProductNames([...allProductNames].reverse());
  });

  test('TC-CAT-04 sorts price low to high', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');

    await loggedInInventory.expectPricesSorted('asc');
    await loggedInInventory.expectEdgeNames(products.onesie, products.fleeceJacket);
  });

  test('TC-CAT-05 sorts price high to low', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('hilo');

    await loggedInInventory.expectPricesSorted('desc');
    await loggedInInventory.expectEdgeNames(products.fleeceJacket, products.onesie);
  });

  test('TC-CAT-06 product detail shows the selected item', async ({ loggedInInventory }) => {
    await loggedInInventory.openProduct(products.backpack);

    await loggedInInventory.expectProductDetail(products.backpack, prices.backpack);
  });
});
