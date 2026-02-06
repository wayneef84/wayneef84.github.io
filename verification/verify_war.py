import os
from playwright.sync_api import sync_playwright

def verify_war():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Construct file URL
        cwd = os.getcwd()
        url = f"file://{cwd}/games/cards/war/index.html"
        print(f"Navigating to: {url}")

        page.goto(url)

        # Click Settings button
        print("Clicking Settings button...")
        page.click("#btnSettings")

        # Wait for modal
        page.wait_for_selector("#settingsModal:not(.hidden)")

        # Take screenshot
        output_path = "verification/war_settings.png"
        page.screenshot(path=output_path)
        print(f"Screenshot saved to {output_path}")

        browser.close()

if __name__ == "__main__":
    verify_war()
