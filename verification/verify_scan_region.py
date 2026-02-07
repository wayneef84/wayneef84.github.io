from playwright.sync_api import sync_playwright

def verify(page):
    page.goto("file:///app/projects/i-seek-queue/index.html")

    # Click the details summary to expand
    summary = page.locator("summary", has_text="Scanning Settings")
    summary.click()

    # Wait for animation if any
    page.wait_for_timeout(500)

    # Verify the selector exists
    region_select = page.locator("#set-region")
    if not region_select.is_visible():
        print("Region select not visible")

    # Take screenshot of the settings panel
    panel = page.locator(".settings-panel")
    panel.screenshot(path="/app/verification/settings_panel.png")

    page.screenshot(path="/app/verification/full_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        finally:
            browser.close()
