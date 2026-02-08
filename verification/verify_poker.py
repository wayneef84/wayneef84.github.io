from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Capture console logs to catch errors
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: errors.append(str(exc)))

    # Go to the poker page
    try:
        page.goto("http://localhost:8000/games/cards/poker/5card/index.html")

        # Wait for the title to be visible
        page.wait_for_selector("h1", timeout=5000)

        # Wait a bit for JS to init
        page.wait_for_timeout(2000)

        # Check for our specific error
        for err in errors:
            print(f"Console Error: {err}")
            if "card-assets" in err or "Engine" in err:
                print("FAILURE: Found known error!")

        # Take screenshot
        page.screenshot(path="verification/poker_screenshot.png")
        print("Screenshot saved to verification/poker_screenshot.png")

    except Exception as e:
        print(f"Error during verification: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
