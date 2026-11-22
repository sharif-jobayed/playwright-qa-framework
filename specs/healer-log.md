# Healer log

Applied the Playwright test-healer workflow after the first refactor run: run, inspect failure,
find root cause, fix, re-run. No retry loops added.

## Run 1 — Chromium, 24 UI tests

| Failure | Root cause | Fix |
| --- | --- | --- |
| `TC-CART-01` — `expectAddButton` timed out | After add-to-cart the button legitimately becomes `Remove`. Test asserted the wrong post-condition. | Replaced `expectAddButton` with `expectButton(name, 'Remove')` in `InventoryPage`; kept the role-based locator. |
| `TC-CHK-07` — expected `cart.html`, got `inventory.html` | Application behaviour differs from the assumed flow. Verified with an independent Playwright script: Cancel on the overview returns to Products but keeps the cart. | Updated test expectation, `specs/coverage.plan.md` and the Excel case `TC-CHK-07`. Test now asserts URL `inventory.html`, badge `1`, and item still in cart. |

## Locator policy

All replaced selectors stay user-facing: `getByRole`, `getByText`, `getByLabel`.
`data-test` appears only on the cart badge inside the Cart button, where no accessible role exists.
Class selectors scope the product card and price/name collections; each action inside the card uses
`getByRole`.

## Verification

See final run in README and CI badge. No `test.fixme()`, no retries added locally.
