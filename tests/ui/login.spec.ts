import { test } from '../../src/fixtures/test-fixtures';
import { invalidCredentials, users } from '../../src/data/users';

test.describe('SUITE-01 Authentication', () => {
  test('TC-AUTH-01 standard user signs in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await inventoryPage.expectLoaded();
  });

  test('TC-AUTH-02 wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(invalidCredentials.username, invalidCredentials.password);

    await loginPage.expectError(/username and password do not match/i);
    await loginPage.expectVisible();
  });

  test('TC-AUTH-03 locked out user is blocked', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await loginPage.expectError(/this user has been locked out/i);
  });

  test('TC-AUTH-04 and 05 required fields are enforced', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', users.standard.password);
    await loginPage.expectError(/username is required/i);

    await loginPage.login(users.standard.username, '');
    await loginPage.expectError(/password is required/i);
  });

  test('TC-AUTH-06 logout ends the session', async ({
    loggedInInventory,
    loginPage,
    menu,
    inventoryPage,
  }) => {
    await loggedInInventory.expectLoaded();
    await menu.open();
    await menu.logout();

    await loginPage.expectAtLogin();
    await loginPage.expectVisible();

    await inventoryPage.openDirectly();
    await inventoryPage.expectNotAtInventory();
  });
});
