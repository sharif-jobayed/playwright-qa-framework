# Sauce Demo — Test Plan

Application under test: `https://www.saucedemo.com` (Swag Labs).
Prepared with the Playwright test planner workflow: browser exploration first, then scenarios with
explicit steps, test data, expected results, and independent starting state.

## 1. Objective

Verify that a shopper can authenticate, browse and sort the catalogue, manage a cart, and complete
checkout with correct prices and clear validation errors.

## 2. Scope

### In scope

- Login: valid, invalid, locked-out, and missing-field cases.
- Catalogue: product list, names, prices, all four sort orders, product detail.
- Cart: add, remove, badge synchronization, continue shopping.
- Checkout: information validation, cancellation, overview totals, order completion, return home.
- Session: menu open/close, logout, reset application state.

### Out of scope

- Dynamic Catalog demos (`Lazy Load`, `Spinner`, `Slider`): exploratory only. They are UI
  performance demos, not purchase flows.
- `About` external navigation to `saucelabs.com`.
- PDF generation on the completion page: manual smoke only; binary output is not asserted.
- API suites against JSONPlaceholder and DummyJSON: tracked separately in `tests/api`.

## 3. Environment and assumptions

- Browsers: Chromium and Firefox, desktop viewport.
- Base URL: `https://www.saucedemo.com`; override with `BASE_URL`.
- Every case starts from a fresh browser context (empty cart, no session).
- Public demo credentials come from `div.login_credentials_wrap-inner` on the login page:
  `standard_user` / `secret_sauce`, plus `locked_out_user`, `problem_user`,
  `performance_glitch_user`, `error_user`, `visual_user` with the same password.
- Prices observed during planning: Backpack `$29.99`, Bike Light `$9.99`, Bolt T-Shirt `$15.99`,
  Fleece Jacket `$49.99`, Onesie `$7.99`, Red T-Shirt `$15.99`.
- Observed checkout maths: `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39` for one Backpack.

## 4. Strategy

| Layer | Coverage |
| --- | --- |
| Manual | All cases in `TC-*` list below; exploratory charters for dynamic catalog. |
| Automated | Cases marked `Yes` in `SauceDemo-Manual-Test-Artifacts.xlsx`, sheet `Test Cases`. |
| Data | Public demo users and product names in `src/data`; no secrets. |
| Locators | Playwright user-facing locators: `getByRole`, `getByText`, `getByLabel`. Class selectors only to scope a product card, which has no ARIA role. |

Entry criteria: application reachable, browsers installed, baselines confirmed.
Exit criteria: all smoke cases pass on Chromium and Firefox; no open severity-1 or severity-2 defect;
all automated cases green in CI.

## 5. Test suites and cases

### SUITE-01 — Authentication

#### TC-AUTH-01 — Standard user signs in

1. Open `/`.
2. Enter username `standard_user`.
3. Enter password `secret_sauce`.
4. Click `Login`.

Expected: URL contains `inventory.html`; `Products` visible; cart empty.

#### TC-AUTH-02 — Wrong password is rejected

1. Open `/`.
2. Enter `standard_user` and `wrong_password`.
3. Click `Login`.

Expected: error `Epic sadface: Username and password do not match any user in this service`;
login form remains visible.

#### TC-AUTH-03 — Locked-out user is blocked

1. Open `/`.
2. Enter `locked_out_user` and `secret_sauce`.
3. Click `Login`.

Expected: error `Epic sadface: Sorry, this user has been locked out.`

#### TC-AUTH-04 — Username is required

1. Open `/`.
2. Leave username empty; enter `secret_sauce`.
3. Click `Login`.

Expected: error `Epic sadface: Username is required`.

#### TC-AUTH-05 — Password is required

1. Open `/`.
2. Enter `standard_user`; leave password empty.
3. Click `Login`.

Expected: error `Epic sadface: Password is required`.

#### TC-AUTH-06 — Logout ends the session

1. Sign in as `standard_user`.
2. Click `Open Menu`, then `Logout`.

Expected: URL returns to `/`; `Login` button visible; direct navigation to `inventory.html` is denied.

### SUITE-02 — Product catalogue

#### TC-CAT-01 — Catalogue lists six products

1. Sign in.
2. Read product names and prices.

Expected: six items with the exact names and prices in section 3.

#### TC-CAT-02 — Default order is name A to Z

1. Sign in.
2. Read `Sort products` value and item order.

Expected: dropdown shows `Name (A to Z)`; Backpack first, Red T-Shirt last.

#### TC-CAT-03 — Sort name Z to A

1. Sign in.
2. Select `Name (Z to A)`.

Expected: Red T-Shirt first, Backpack last.

#### TC-CAT-04 — Sort price low to high

1. Sign in.
2. Select `Price (low to high)`.

Expected: Onesie first, Fleece Jacket last; prices non-decreasing.

#### TC-CAT-05 — Sort price high to low

1. Sign in.
2. Select `Price (high to low)`.

Expected: Fleece Jacket first, Onesie last; prices non-increasing.

#### TC-CAT-06 — Product detail shows the selected item

1. Sign in.
2. Click `View details for Sauce Labs Backpack`.

Expected: URL is `inventory-item.html?id=4`; name, description and `$29.99` visible;
`Back to products` available.

### SUITE-03 — Cart

#### TC-CART-01 — Adding one item updates the badge

1. Sign in.
2. Click `Add to cart` on Backpack.

Expected: cart badge reads `1`; button changes to `Remove`.

#### TC-CART-02 — Two items appear in the cart

1. Sign in.
2. Add Backpack and Bike Light.
3. Click the cart link.

Expected: badge reads `2`; cart lists both names and prices.

#### TC-CART-03 — Removing one item keeps the other

1. Sign in.
2. Add Backpack and Bike Light.
3. Open cart; click `Remove` on Backpack.

Expected: badge reads `1`; cart lists Bike Light only.

#### TC-CART-04 — Removing the last item clears the badge

1. Sign in.
2. Add Bolt T-Shirt; remove it on the catalogue page.

Expected: cart badge absent; cart link reads `Cart, empty`.

#### TC-CART-05 — Continue Shopping returns to products

1. Sign in.
2. Add Bike Light; open cart.
3. Click `Continue Shopping`.

Expected: URL returns to `inventory.html`; badge still reads `1`.

### SUITE-04 — Checkout

#### TC-CHK-01 — One item order completes

1. Sign in; add Backpack; open cart; click `Checkout`.
2. Fill First Name `Sharif`, Last Name `Jobayed`, Zip `1207`; click `Continue`.
3. Click `Finish`.

Expected: `Checkout: Complete!` and `Thank you for your order!` visible; cart empty.

#### TC-CHK-02 — First name is required

1. Reach checkout information with one item.
2. Leave First Name empty; fill other fields; click `Continue`.

Expected: `Error: First Name is required`.

#### TC-CHK-03 — Last name is required

1. Reach checkout information with one item.
2. Fill First Name only; click `Continue`.

Expected: `Error: Last Name is required`.

#### TC-CHK-04 — Postal code is required

1. Reach checkout information with one item.
2. Fill First and Last Name; leave Zip empty; click `Continue`.

Expected: `Error: Postal Code is required`.

#### TC-CHK-05 — Cancel from information returns to cart

1. Reach checkout information with one item.
2. Click `Cancel`.

Expected: URL `cart.html`; item still present.

#### TC-CHK-06 — Overview shows correct totals

1. Reach checkout overview with Backpack.
2. Read summary rows.

Expected: `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39`; payment and shipping rows visible.

#### TC-CHK-07 — Cancel from overview returns to cart

1. Reach checkout overview with Backpack.
2. Click `Cancel`.

Expected: URL `inventory.html` in the current build; badge still `1` and item still in cart. (Healer finding: Cancel on the overview does not open `cart.html`.)

#### TC-CHK-08 — Back Home after completion

1. Complete an order.
2. Click `Back Home`.

Expected: URL `inventory.html`; `Products` visible; cart empty.

### SUITE-05 — Session and navigation

#### TC-NAV-01 — Menu opens and closes

1. Sign in; click `Open Menu`.
2. Click `Close Menu`.

Expected: menu items `All Items`, `Dynamic Catalog`, `About`, `Logout`, `Reset App State` visible;
menu disappears after close.

#### TC-NAV-02 — Reset App State clears the cart

1. Sign in; add Backpack.
2. Open menu; click `Reset App State`; click `All Items`.

Expected: cart badge absent; products visible.

#### TC-NAV-03 — Dynamic catalog pages load (manual exploratory)

1. Sign in; open menu; expand `Dynamic Catalog`.
2. Open `Lazy Load`, `Spinner`, and `Slider` in turn.

Expected: each page renders demo content without a server error. No purchase flow assertions.

#### TC-NAV-04 — About link target (manual)

1. Sign in; open menu; inspect `About` link.

Expected: `href` is `https://saucelabs.com/`; external navigation not automated.

## 6. Risks

- Public demo site can change without notice; CI retries absorb brief instability only.
- `problem_user`, `error_user`, `performance_glitch_user`, `visual_user` are reserved for
  exploratory charters. Not automated: their behaviour is intentionally defective or slow.
- Price strings are fixed in the demo catalogue; assert exact strings, not computed floats where
  rounding could differ.
