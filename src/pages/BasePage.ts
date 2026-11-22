import { Locator, Page } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 * Keeps locator strategy in one place so a selector change is a one-line edit.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to baseURL. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Locator for elements that expose a data-test attribute. */
  protected testId(id: string): Locator {
    return this.page.locator(`[data-test="${id}"]`);
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
