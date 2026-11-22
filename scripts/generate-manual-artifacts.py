#!/usr/bin/env python3
"""Generate the manual testing workbook from the Playwright planner output.

No third-party packages. Produces a real .xlsx (OOXML) with one sheet per artifact.
Source of truth: specs/coverage.plan.md.
"""
from __future__ import annotations

import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).resolve().parents[1] / "artifacts" / "manual-testing" / "SauceDemo-Manual-Test-Artifacts.xlsx"

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def col_name(index: int) -> str:
    name = ""
    while index:
        index, rem = divmod(index - 1, 26)
        name = chr(65 + rem) + name
    return name


def sheet_xml(rows: list[list[str]], widths: list[int]) -> str:
    cols = "".join(
        f'<col min="{i}" max="{i}" width="{w}" customWidth="1"/>'
        for i, w in enumerate(widths, start=1)
    )
    body = []
    for r, row in enumerate(rows, start=1):
        cells = []
        for c, value in enumerate(row, start=1):
            style = ' s="1"' if r == 1 else ""
            cells.append(
                f'<c r="{col_name(c)}{r}"{style} t="inlineStr">'
                f'<is><t xml:space="preserve">{escape(str(value))}</t></is></c>'
            )
        body.append(f'<row r="{r}">{"".join(cells)}</row>')
    return (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<worksheet xmlns="{NS}"><cols>{cols}</cols>'
        f'<sheetData>{"".join(body)}</sheetData></worksheet>'
    )


def styles_xml() -> str:
    return (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<styleSheet xmlns="{NS}">'
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
        '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
        '<borders count="1"><border/></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="2">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        '</cellXfs></styleSheet>'
    )


def write_workbook(sheets: list[tuple[str, list[list[str]], list[int]]]) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    content_types = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    ]
    root_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        f'<Relationship Id="rId1" Type="{REL}/officeDocument" Target="xl/workbook.xml"/>',
        "</Relationships>",
    ]
    wb_sheets = []
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    ]
    for i, (name, _, _) in enumerate(sheets, start=1):
        wb_sheets.append(f'<sheet name="{escape(name)}" sheetId="{i}" r:id="rId{i}"/>')
        wb_rels.append(
            f'<Relationship Id="rId{i}" Type="{REL}/worksheet" Target="worksheets/sheet{i}.xml"/>'
        )
        content_types.append(
            f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
    wb_rels.append("</Relationships>")
    content_types.append("</Types>")
    workbook = (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<workbook xmlns="{NS}" xmlns:r="{REL}">'
        f'<sheets>{"".join(wb_sheets)}</sheets></workbook>'
    )

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", "".join(content_types))
        z.writestr("_rels/.rels", "".join(root_rels))
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", "".join(wb_rels))
        z.writestr("xl/styles.xml", styles_xml())
        for i, (_, rows, widths) in enumerate(sheets, start=1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", sheet_xml(rows, widths))
    print(f"Wrote {OUT.relative_to(OUT.parents[2])} ({OUT.stat().st_size} bytes)")


plan_rows = [
    ["Field", "Value"],
    ["Artifact", "Sauce Demo manual testing artifacts"],
    ["Application", "https://www.saucedemo.com (Swag Labs)"],
    ["Source plan", "specs/coverage.plan.md"],
    ["Generated by", "scripts/generate-manual-artifacts.py (Playwright planner workflow)"],
    ["Objective", "Verify authentication, catalogue, cart, checkout, totals and session handling."],
    ["In scope", "Login validation; six-product catalogue; four sort orders; product detail; cart add/remove; checkout validation, cancellation, totals, completion; menu, logout, reset state."],
    ["Out of scope", "Dynamic Catalog demos (exploratory only); About external navigation; PDF output assertion; JSONPlaceholder/DummyJSON API suites."],
    ["Entry criteria", "Application reachable; Chromium and Firefox installed; BASE_URL set or default used."],
    ["Exit criteria", "All smoke cases green on both browsers; no open S1/S2 defect; CI green."],
    ["Assumption", "Fresh browser context per case: empty cart, no session."],
    ["Credentials", "standard_user / secret_sauce; locked_out_user / secret_sauce. Read from div.login_credentials_wrap-inner."],
    ["Locator policy", "getByRole, getByText, getByLabel first. Class selector only to scope a product card with no ARIA role."],
    ["Risk", "Public demo can change without notice; retries absorb brief instability only."],
    ["Risk", "problem_user, error_user, performance_glitch_user, visual_user reserved for exploratory charters."],
]

suite_rows = [
    ["Suite ID", "Suite name", "Objective", "Module", "Priority", "Cases", "Automated", "Preconditions"],
    ["SUITE-01", "Authentication", "Valid and invalid sign-in, required fields, logout", "Login", "High", "6", "6", "Fresh context on /"],
    ["SUITE-02", "Product catalogue", "List, prices, sort orders, product detail", "Inventory", "High", "6", "6", "Signed in as standard_user"],
    ["SUITE-03", "Cart", "Add, remove, badge sync, continue shopping", "Cart", "High", "5", "5", "Signed in; empty cart"],
    ["SUITE-04", "Checkout", "Validation, cancellation, totals, completion", "Checkout", "Critical", "8", "8", "Signed in; item in cart"],
    ["SUITE-05", "Session and navigation", "Menu, reset state, demo catalog, About link", "Global", "Medium", "4", "2", "Signed in as standard_user"],
]

cases = [
    # id, suite, title, module, priority, type, preconditions, steps, data, expected, automated, spec, status
    ["TC-AUTH-01", "SUITE-01", "Standard user signs in", "Login", "High", "Positive", "Fresh context on /", "1. Enter username\n2. Enter password\n3. Click Login", "standard_user / secret_sauce", "URL contains inventory.html; Products visible; cart empty", "Yes", "tests/ui/login.spec.ts", "Passed"],
    ["TC-AUTH-02", "SUITE-01", "Wrong password is rejected", "Login", "High", "Negative", "Fresh context on /", "1. Enter standard_user\n2. Enter wrong_password\n3. Click Login", "standard_user / wrong_password", "Error: Username and password do not match any user in this service", "Yes", "tests/ui/login.spec.ts", "Passed"],
    ["TC-AUTH-03", "SUITE-01", "Locked-out user is blocked", "Login", "High", "Negative", "Fresh context on /", "1. Enter locked_out_user\n2. Enter secret_sauce\n3. Click Login", "locked_out_user / secret_sauce", "Error: Sorry, this user has been locked out.", "Yes", "tests/ui/login.spec.ts", "Passed"],
    ["TC-AUTH-04", "SUITE-01", "Username is required", "Login", "Medium", "Validation", "Fresh context on /", "1. Leave username empty\n2. Enter secret_sauce\n3. Click Login", "password only", "Error: Username is required", "Yes", "tests/ui/login.spec.ts", "Passed"],
    ["TC-AUTH-05", "SUITE-01", "Password is required", "Login", "Medium", "Validation", "Fresh context on /", "1. Enter standard_user\n2. Leave password empty\n3. Click Login", "username only", "Error: Password is required", "Yes", "tests/ui/login.spec.ts", "Passed"],
    ["TC-AUTH-06", "SUITE-01", "Logout ends the session", "Login", "High", "Security", "Signed in", "1. Open Menu\n2. Click Logout", "standard_user", "Login page shown; inventory.html denied", "Yes", "tests/ui/login.spec.ts", "Passed"],

    ["TC-CAT-01", "SUITE-02", "Catalogue lists six products", "Inventory", "High", "Positive", "Signed in", "1. Read all item names and prices", "Six known products", "Six items with exact names and prices", "Yes", "tests/ui/catalog.spec.ts", "Passed"],
    ["TC-CAT-02", "SUITE-02", "Default order is name A to Z", "Inventory", "Medium", "Regression", "Signed in", "1. Read sort value\n2. Read item order", "Default state", "Name (A to Z) selected; Backpack first; Red T-Shirt last", "Yes", "tests/ui/catalog.spec.ts", "Passed"],
    ["TC-CAT-03", "SUITE-02", "Sort name Z to A", "Inventory", "Medium", "Regression", "Signed in", "1. Select Name (Z to A)", "Sort option za", "Red T-Shirt first; Backpack last", "Yes", "tests/ui/catalog.spec.ts", "Passed"],
    ["TC-CAT-04", "SUITE-02", "Sort price low to high", "Inventory", "Medium", "Regression", "Signed in", "1. Select Price (low to high)", "Sort option lohi", "Onesie first; Fleece Jacket last; prices non-decreasing", "Yes", "tests/ui/catalog.spec.ts", "Passed"],
    ["TC-CAT-05", "SUITE-02", "Sort price high to low", "Inventory", "Medium", "Regression", "Signed in", "1. Select Price (high to low)", "Sort option hilo", "Fleece Jacket first; Onesie last; prices non-increasing", "Yes", "tests/ui/catalog.spec.ts", "Passed"],
    ["TC-CAT-06", "SUITE-02", "Product detail shows selected item", "Inventory", "Medium", "Positive", "Signed in", "1. Click View details for Sauce Labs Backpack", "Backpack id=4", "inventory-item.html?id=4; name, description, $29.99; Back to products", "Yes", "tests/ui/catalog.spec.ts", "Passed"],

    ["TC-CART-01", "SUITE-03", "Adding one item updates the badge", "Cart", "High", "Positive", "Signed in; empty cart", "1. Click Add to cart on Backpack", "Backpack", "Badge reads 1; button changes to Remove", "Yes", "tests/ui/cart.spec.ts", "Passed"],
    ["TC-CART-02", "SUITE-03", "Two items appear in the cart", "Cart", "High", "Positive", "Signed in; empty cart", "1. Add Backpack and Bike Light\n2. Open cart", "Backpack, Bike Light", "Badge 2; cart lists both names and prices", "Yes", "tests/ui/cart.spec.ts", "Passed"],
    ["TC-CART-03", "SUITE-03", "Removing one item keeps the other", "Cart", "High", "Regression", "Signed in; two items", "1. Open cart\n2. Click Remove on Backpack", "Backpack, Bike Light", "Badge 1; Bike Light remains", "Yes", "tests/ui/cart.spec.ts", "Passed"],
    ["TC-CART-04", "SUITE-03", "Removing the last item clears the badge", "Cart", "Medium", "Negative", "Signed in; one item", "1. Add Bolt T-Shirt\n2. Click Remove on catalogue", "Bolt T-Shirt", "Badge absent; cart link reads Cart, empty", "Yes", "tests/ui/cart.spec.ts", "Passed"],
    ["TC-CART-05", "SUITE-03", "Continue Shopping returns to products", "Cart", "Medium", "Regression", "Signed in; one item", "1. Open cart\n2. Click Continue Shopping", "Bike Light", "Back on inventory.html; badge still 1", "Yes", "tests/ui/cart.spec.ts", "Passed"],

    ["TC-CHK-01", "SUITE-04", "One item order completes", "Checkout", "Critical", "E2E", "Signed in; Backpack in cart", "1. Checkout\n2. Fill information\n3. Continue\n4. Finish", "Sharif / Jobayed / 1207", "Complete page and Thank you for your order! visible; cart empty", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-02", "SUITE-04", "First name is required", "Checkout", "High", "Validation", "Checkout information; one item", "1. Leave First Name empty\n2. Fill rest\n3. Continue", "Last / Zip filled", "Error: First Name is required", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-03", "SUITE-04", "Last name is required", "Checkout", "High", "Validation", "Checkout information; one item", "1. Fill First Name only\n2. Continue", "First filled", "Error: Last Name is required", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-04", "SUITE-04", "Postal code is required", "Checkout", "High", "Validation", "Checkout information; one item", "1. Fill First and Last Name\n2. Continue", "Zip empty", "Error: Postal Code is required", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-05", "SUITE-04", "Cancel from information returns to cart", "Checkout", "Medium", "Regression", "Checkout information; one item", "1. Click Cancel", "Backpack", "cart.html shown; item still present", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-06", "SUITE-04", "Overview shows correct totals", "Checkout", "Critical", "Financial", "Checkout overview; Backpack", "1. Read summary rows", "Backpack $29.99", "Item total $29.99; Tax $2.40; Total $32.39", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-07", "SUITE-04", "Cancel from overview keeps the cart", "Checkout", "Medium", "Regression", "Checkout overview; one item", "1. Click Cancel", "Backpack", "inventory.html shown (healer finding); badge 1; item still in cart", "Yes", "tests/ui/checkout.spec.ts", "Passed"],
    ["TC-CHK-08", "SUITE-04", "Back Home after completion", "Checkout", "Medium", "Regression", "Order completed", "1. Click Back Home", "Order complete", "inventory.html shown; cart empty", "Yes", "tests/ui/checkout.spec.ts", "Passed"],

    ["TC-NAV-01", "SUITE-05", "Menu opens and closes", "Global", "Low", "UI", "Signed in", "1. Click Open Menu\n2. Click Close Menu", "standard_user", "Menu items visible; menu disappears after close", "Yes", "tests/ui/navigation.spec.ts", "Passed"],
    ["TC-NAV-02", "SUITE-05", "Reset App State clears the cart", "Global", "Medium", "Regression", "Signed in; Backpack in cart", "1. Open Menu\n2. Click Reset App State\n3. Click All Items", "Backpack", "Badge absent; products visible", "Yes", "tests/ui/navigation.spec.ts", "Passed"],
    ["TC-NAV-03", "SUITE-05", "Dynamic catalog pages load", "Global", "Low", "Exploratory", "Signed in", "1. Expand Dynamic Catalog\n2. Open Lazy Load, Spinner, Slider", "Demo pages", "Each page renders without server error", "No", "—", "Not automated"],
    ["TC-NAV-04", "SUITE-05", "About link target", "Global", "Low", "Manual", "Signed in", "1. Open Menu\n2. Inspect About href", "n/a", "href is https://saucelabs.com/", "No", "—", "Not automated"],
]

case_headers = ["Case ID", "Suite ID", "Title", "Module", "Priority", "Type", "Preconditions", "Steps", "Test data", "Expected result", "Automated", "Spec file", "Execution status"]

trace_rows = [["Case ID", "Automated", "Spec file", "Test title in spec"]]
for row in cases:
    cid, _, title, *_rest = row
    spec = row[11]
    if spec == "—":
        trace_rows.append([cid, "No", "—", "—"])
    else:
        trace_rows.append([cid, "Yes", spec, title])

defect_rows = [
    ["Defect ID", "Title", "Severity", "Case ID", "Steps to reproduce", "Expected", "Actual", "Status", "Owner", "Notes"],
    ["TEMPLATE", "Example only — delete before logging a real defect", "S3", "TC-XXX", "1. Step\n2. Step", "Expected result", "Actual result", "Open", "Unassigned", "Include screenshot path from test-results/"],
]

exploratory_rows = [
    ["Charter ID", "Area", "Timebox", "Heuristic", "Explore", "Record"],
    ["EX-01", "Dynamic Catalog", "20 min", "Latency, load states", "Lazy Load, Spinner, Slider under slow network", "Visible loading state, no duplicate items, no console error"],
    ["EX-02", "Alternate users", "20 min", "Intentional defects", "problem_user, error_user, visual_user, performance_glitch_user", "Defects reproducible; not treated as product regressions"],
    ["EX-03", "Checkout edge data", "15 min", "Boundaries, special characters", "Long names, postal code with spaces or symbols", "Validation message or accepted value; no UI break"],
    ["EX-04", "Cart persistence", "15 min", "Session reuse", "Reload and back/forward during cart and checkout", "State consistent; no duplicate orders"],
]

write_workbook([
    ("Test Plan", plan_rows, [22, 110]),
    ("Test Suite", suite_rows, [12, 24, 46, 16, 10, 8, 12, 28]),
    ("Test Cases", [case_headers] + cases, [14, 12, 38, 14, 10, 14, 28, 52, 28, 56, 12, 30, 16]),
    ("Traceability", trace_rows, [14, 12, 32, 42]),
    ("Defect Log", defect_rows, [12, 42, 10, 14, 40, 32, 32, 12, 14, 42]),
    ("Exploratory", exploratory_rows, [12, 24, 12, 26, 52, 56]),
])
