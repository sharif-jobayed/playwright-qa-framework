import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.items = this.testId('inventory-item');
    this.cartLink = this.testId('shopping-cart-link');
    this.cartBadge = this.testId('shopping-cart-badge');
    this.sortDropdown = this.testId('product-sort-container');
    this.pageTitle = this.page.locator('.title');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  itemByName(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async addToCart(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: /add to cart/i }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: /remove/i }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async prices(): Promise<number[]> {
    const raw = await this.items.locator('.inventory_item_price').allTextContents();
    return raw.map((value) => Number(value.replace('$', '')));
  }

  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return Number(await this.cartBadge.textContent());
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
