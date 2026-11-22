import { Locator, Page } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 * Locators are user-facing first: getByRole, getByText, getByLabel.
 * A class selector is used only to scope a product card, which has no ARIA role.
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

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
