import { expect, Locator, Page } from '@playwright/test';

/** Header drawer shared by every authenticated page. */
export class Menu {
  private readonly openButton: Locator;
  private readonly closeButton: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeButton = page.getByRole('button', { name: 'Close Menu' });
  }

  async open(): Promise<void> {
    await this.openButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async expectOpenButtonVisible(): Promise<void> {
    await expect(this.openButton).toBeVisible();
  }

  async expectMenuItems(): Promise<void> {
    for (const name of ['All Items', 'Dynamic Catalog', 'About', 'Logout', 'Reset App State']) {
      await expect(
        this.page.getByRole('button', { name }).or(this.page.getByRole('link', { name })),
      ).toBeVisible();
    }
  }

  async resetAppState(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reset App State' }).click();
  }

  async allItems(): Promise<void> {
    await this.page.getByRole('button', { name: 'All Items' }).click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Logout' }).click();
  }
}
