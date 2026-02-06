from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8080/projects/internal-tests/test_db.html")

    # Wait for the success message
    page.wait_for_selector("text=All tests passed!", timeout=5000)

    page.screenshot(path="verification/test_db_result.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
