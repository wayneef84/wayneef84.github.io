from playwright.sync_api import sync_playwright

def verify_phase2():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the test page
        page.goto("http://localhost:8081/negen/verification/phase2_test.html")

        # Wait for canvas to be drawn
        page.wait_for_timeout(2000) # Wait 2 seconds for animation/auto-flip

        # Screenshot
        screenshot_path = "verification/phase2_result.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_phase2()
