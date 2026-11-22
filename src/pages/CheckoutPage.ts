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
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly summaryTotal: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = this.testId('firstName');
    this.lastNameInput = this.testId('lastName');
    this.postalCodeInput = this.testId('postalCode');
    this.continueButton = this.testId('continue');
    this.finishButton = this.testId('finish');
    this.completeHeader = this.testId('complete-header');
    this.summaryTotal = this.testId('total-label');
    this.errorMessage = this.testId('error');
  }

  async fillDetails(details: CheckoutDetails): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.postalCodeInput.fill(details.postalCode);
    await this.continueButton.click();
  }

  async expectOrderSummary(): Promise<void> {
    await expect(this.summaryTotal).toBeVisible();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.completeHeader).toHaveText(/thank you for your order/i);
  }
}
