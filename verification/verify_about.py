from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html
        cwd = os.getcwd()
        url = f"file://{cwd}/index.html"
        print(f"Loading {url}")
        page.goto(url)

        # Click the 'About' filter button
        print("Clicking 'About' button...")
        page.get_by_role("button", name="About").click()

        # Wait for About section to be visible
        about_view = page.locator("#about-view")
        about_view.wait_for(state="visible")

        # Wait a bit for animations
        page.wait_for_timeout(1000)

        # Screenshot the whole page
        print("Taking screenshot of About View...")
        page.screenshot(path="verification/about_page.png", full_page=True)

        # Click on 'Jules' in the team grid to see profile
        print("Clicking 'Jules' card...")
        page.locator(".team-card h3", has_text="Jules").click()

        page.wait_for_timeout(500)
        page.screenshot(path="verification/jules_profile.png", full_page=True)

        # Check Sidebar expansion
        print("Checking sidebar...")
        # Collapse all
        page.get_by_role("button", name="Collapse All").click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/sidebar_collapsed.png")

        # Expand all
        page.get_by_role("button", name="Expand All").click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/sidebar_expanded.png")

        browser.close()

if __name__ == "__main__":
    run()
