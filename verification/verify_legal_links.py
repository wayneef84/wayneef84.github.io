
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Check index.html footer
        page.goto("file:///home/jules/src/index.html")
        page.screenshot(path="verification/index_legal.png", full_page=True)
        print("Captured index.html")

        # Check about.html header
        page.goto("file:///home/jules/src/about.html")
        page.screenshot(path="verification/about_legal.png", full_page=True)
        print("Captured about.html")

        browser.close()

if __name__ == "__main__":
    run()
