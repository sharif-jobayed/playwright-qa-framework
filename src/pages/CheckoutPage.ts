import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.completeHeader = page.getByRole('heading', { name: 'Thank you for your order!' });
    this.errorMessage = page.getByText(/^Error:/);
  }

  async fillDetails(details: CheckoutDetails): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.postalCodeInput.fill(details.postalCode);
    await this.continueButton.click();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectOverview(itemTotal: string, tax: string, total: string): Promise<void> {
    await expect(this.page.getByText('Payment Information:', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Free Pony Express Delivery!')).toBeVisible();
    await expect(this.page.getByText(`Item total: ${itemTotal}`, { exact: true })).toBeVisible();
    await expect(this.page.getByText(`Tax: ${tax}`, { exact: true })).toBeVisible();
    await expect(this.page.getByText(`Total: ${total}`, { exact: true })).toBeVisible();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.page.getByText('Checkout: Complete!')).toBeVisible();
  }

  async backHome(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back Home' }).click();
  }
}
