from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 1200})

        # Load the local index.html file
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Take a screenshot of the grid area
        element = page.locator('.game-grid')
        element.screenshot(path='verification_dual_icons.png')

        browser.close()

if __name__ == "__main__":
    run()
