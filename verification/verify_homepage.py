
from playwright.sync_api import sync_playwright
import os

def test_homepage_about_hidden():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        filepath = os.path.abspath("index.html")
        page.goto(f"file://{filepath}")

        # Wait for the page to load
        page.wait_for_load_state("networkidle")

        # Check if the grid is visible
        grid = page.locator("#grid")
        if grid.is_visible():
            print("SUCCESS: Grid is visible.")
        else:
            print("FAILURE: Grid is NOT visible.")

        # Check if the about view is hidden
        about_view = page.locator("#about-view")

        # We need to check computed style because we used !important in CSS
        # Playwright's is_visible() checks if the element is attached and visible.
        # display: none makes it not visible.

        if not about_view.is_visible():
            print("SUCCESS: About view is hidden.")
        else:
            print("FAILURE: About view is visible.")
            # Let's check the computed style to be sure why
            display = about_view.evaluate("element => window.getComputedStyle(element).display")
            print(f"DEBUG: About view display style is: {display}")

        # Take a screenshot
        page.screenshot(path="verification/homepage_screenshot.png")
        print("Screenshot saved to verification/homepage_screenshot.png")

        browser.close()

if __name__ == "__main__":
    test_homepage_about_hidden()
