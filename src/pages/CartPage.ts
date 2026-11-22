import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly items: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByText('Your Cart', { exact: true })).toBeVisible();
  }

  async expectAtCart(): Promise<void> {
    await this.expectUrl(/cart\.html/);
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.items).toHaveCount(count);
  }

  async itemNames(): Promise<string[]> {
    return this.items.locator('.inventory_item_name').allTextContents();
  }

  async expectItemNames(expected: string[]): Promise<void> {
    expect(await this.itemNames()).toEqual(expected);
  }

  async removeItem(name: string): Promise<void> {
    await this.items
      .filter({ hasText: name })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
