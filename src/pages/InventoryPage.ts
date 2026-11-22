import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly pageTitle: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(page: Page) {
    super(page);
    this.cartLink = page.getByRole('button', { name: /^Cart,/ });
    this.cartBadge = this.cartLink.locator('[data-test="shopping-cart-badge"]');
    this.sortDropdown = page.getByRole('combobox', { name: 'Sort products' });
    this.pageTitle = page.getByText('Products', { exact: true });
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.productNames).toHaveCount(6);
  }

  async names(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    const raw = await this.productPrices.allTextContents();
    return raw.map((value) => Number(value.replace('$', '')));
  }

  async addToCart(name: string): Promise<void> {
    await this.itemCard(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.itemCard(name).getByRole('button', { name: 'Remove' }).click();
  }

  async expectButton(name: string, buttonName: 'Add to cart' | 'Remove'): Promise<void> {
    await expect(this.itemCard(name).getByRole('button', { name: buttonName })).toBeVisible();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async expectSort(option: SortOption): Promise<void> {
    await expect(this.sortDropdown).toHaveValue(option);
  }

  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return Number(await this.cartBadge.textContent());
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openProduct(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `View details for ${name}` }).first().click();
  }

  async expectProductDetail(name: string, price: string): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
    await expect(this.page.getByText(price, { exact: true })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Back to products' })).toBeVisible();
  }
}
