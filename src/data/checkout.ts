import type { CheckoutDetails } from '../pages/CheckoutPage';

export const checkoutDetails: CheckoutDetails = {
  firstName: 'Sharif',
  lastName: 'Jobayed',
  postalCode: '1207',
};

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTshirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTshirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

/** Prices published by the saucedemo.com demo catalogue during planning. */
export const prices = {
  backpack: '$29.99',
  bikeLight: '$9.99',
  boltTshirt: '$15.99',
  fleeceJacket: '$49.99',
  onesie: '$7.99',
  redTshirt: '$15.99',
} as const;

/** Observed totals for a single Backpack order. */
export const backpackTotals = {
  itemTotal: '$29.99',
  tax: '$2.40',
  total: '$32.39',
} as const;

export const allProductNames = Object.values(products);
