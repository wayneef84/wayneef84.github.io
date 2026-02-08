from playwright.sync_api import sync_playwright

def verify_homepage_projects():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to homepage
        page.goto("http://localhost:8000/index.html")
        page.wait_for_load_state("networkidle")

        # Take screenshot of initial state (All games)
        page.screenshot(path="verification/homepage_all.png", full_page=True)
        print("Screenshot 'homepage_all.png' taken.")

        # Click "Projects" filter (now 'tool' category)
        # Note: The button text is "Projects", but data-filter is "tool" or "project"
        # In my implementation, I kept data-filter="project" on the button
        page.click("button[data-filter='project']")

        # Wait for animation/filtering
        page.wait_for_timeout(1000)

        # Take screenshot of Projects/Tools view
        page.screenshot(path="verification/homepage_projects.png", full_page=True)
        print("Screenshot 'homepage_projects.png' taken.")

        # Verify specific project cards are present
        content = page.content()
        if "Input A11y" in content and "MD Reader" in content and "Cookbook" in content:
            print("SUCCESS: Input A11y, MD Reader, and Cookbook found in DOM.")
        else:
            print("FAILURE: New projects not found in DOM.")

        browser.close()

if __name__ == "__main__":
    verify_homepage_projects()
