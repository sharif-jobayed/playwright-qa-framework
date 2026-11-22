import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = this.testId('inventory-item');
    this.checkoutButton = this.testId('checkout');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.title')).toHaveText('Your Cart');
  }

  async itemNames(): Promise<string[]> {
    return this.items.locator('.inventory_item_name').allTextContents();
  }

  async removeItem(name: string): Promise<void> {
    await this.items
      .filter({ hasText: name })
      .getByRole('button', { name: /remove/i })
      .click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
