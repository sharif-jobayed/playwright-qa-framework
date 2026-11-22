import { test, expect } from '../../src/fixtures/test-fixtures';
import { invalidCredentials, users } from '../../src/data/users';

test.describe('Login', () => {
  test('standard user reaches the product catalogue @smoke', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('wrong password shows a generic credential error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(invalidCredentials.username, invalidCredentials.password);

    await loginPage.expectError(/username and password do not match/i);
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test('locked out user is blocked with an explicit message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await loginPage.expectError(/locked out/i);
  });

  test('empty username is rejected before submit', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', users.standard.password);

    await loginPage.expectError(/username is required/i);
  });
});
