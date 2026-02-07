from playwright.sync_api import sync_playwright

def verify(page):
    page.goto("file:///app/projects/i-seek-queue/index.html")

    # 1. Expand settings
    summary = page.locator("summary", has_text="Scanning Settings")
    summary.click()
    page.wait_for_timeout(500)

    # 2. Verify Action Selector exists
    action_select = page.locator("#set-action")
    if not action_select.is_visible():
        print("Action selector not visible")

    # 3. Select URL Lookup to reveal Base URL input
    action_select.select_option("URL_LOOKUP")

    # 4. Verify Base URL input appears and has default value
    base_url_input = page.locator("#set-base-url")
    if not base_url_input.is_visible():
        print("Base URL input not visible after selection")

    value = base_url_input.input_value()
    print(f"Base URL Value: {value}")

    # 5. Take screenshot of the configured settings
    panel = page.locator(".settings-panel")
    panel.screenshot(path="/app/verification/settings_action_mode.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        finally:
            browser.close()
