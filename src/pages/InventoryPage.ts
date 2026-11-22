import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly sortDropdown: Locator;
  private readonly pageTitle: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;

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
    await this.expectUrl(/inventory\.html/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.productNames).toHaveCount(6);
  }

  async expectNotAtInventory(): Promise<void> {
    await this.expectNotUrl(/inventory\.html/);
  }

  async openDirectly(): Promise<void> {
    await this.open('/inventory.html');
  }

  async names(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    const raw = await this.productPrices.allTextContents();
    return raw.map((value) => Number(value.replace('$', '')));
  }

  async expectProductNames(expected: string[]): Promise<void> {
    expect(await this.names()).toEqual(expected);
  }

  async expectPrices(expected: number[]): Promise<void> {
    expect(await this.prices()).toEqual(expected);
  }

  async expectPricesSorted(direction: 'asc' | 'desc'): Promise<void> {
    const values = await this.prices();
    const sorted = [...values].sort((a, b) => (direction === 'asc' ? a - b : b - a));
    expect(values).toEqual(sorted);
  }

  async expectEdgeNames(first: string, last: string): Promise<void> {
    const names = await this.names();
    expect(names[0]).toBe(first);
    expect(names.at(-1)).toBe(last);
  }

  async addToCart(name: string): Promise<void> {
    await this.itemCard(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.itemCard(name).getByRole('button', { name: 'Remove' }).click();
  }

  async expectProductButton(name: string, buttonName: 'Add to cart' | 'Remove'): Promise<void> {
    await expect(this.itemCard(name).getByRole('button', { name: buttonName })).toBeVisible();
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      await expect(this.cartLink).toHaveAttribute('aria-label', 'Cart, empty');
      return;
    }
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async expectSort(option: SortOption): Promise<void> {
    await expect(this.sortDropdown).toHaveValue(option);
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
