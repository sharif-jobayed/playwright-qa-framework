import { expect, Locator, Page } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 * Specs call behaviour methods; they never touch a Locator or Page directly.
 * Locators are user-facing first: getByRole, getByText, getByLabel.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to baseURL. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Scope assertions and actions to one product card by its accessible detail-button name. */
  protected itemCard(name: string): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ has: this.page.getByRole('button', { name: `View details for ${name}` }) });
  }

  async expectUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectNotUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).not.toHaveURL(pattern);
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
