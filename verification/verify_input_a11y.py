from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        # Navigate to the Input A11y page
        page.goto("http://localhost:8081/projects/input-a11y/index.html")

        # Verify title
        print("Page title:", page.title())
        assert "Input A11y" in page.title()

        # Wait for the "Start Scanner" button (or similar UI element) to be visible
        # In modern version, it might be dynamically created or present in HTML.
        # Based on app.js code: `btn.innerText = 'Start Scanner';`
        # Or check for the tab buttons.

        # Check for tabs
        page.wait_for_selector(".tab-btn.active")

        # Take a screenshot
        page.screenshot(path="verification/input_a11y_ui.png")
        print("Screenshot saved to verification/input_a11y_ui.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
