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
} as const;
