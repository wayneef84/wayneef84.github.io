import os
from playwright.sync_api import sync_playwright

def verify_hub():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop
        print("Taking desktop screenshot...")
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")
        page.screenshot(path="verification/hub_desktop.png", full_page=True)

        # Mobile
        print("Taking mobile screenshot...")
        context = browser.new_context(viewport={'width': 375, 'height': 812}, user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1')
        page_mobile = context.new_page()
        page_mobile.goto(f"file://{cwd}/index.html")
        page_mobile.screenshot(path="verification/hub_mobile.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    verify_hub()
