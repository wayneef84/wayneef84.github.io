from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set a large viewport to capture the whole grid
        page = browser.new_page(viewport={"width": 1280, "height": 1800})

        # Load the local index.html
        # Using file:// protocol
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Wait for any potential animations (though none expected for static load)
        page.wait_for_timeout(500)

        # Screenshot
        page.screenshot(path="verification_md_reader.png")
        print("Screenshot saved to verification_md_reader.png")

        browser.close()

if __name__ == "__main__":
    run()
