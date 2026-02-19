from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8080/index.html")

        # Wait for the grid
        page.wait_for_selector(".game-grid")

        # Screenshot
        grid = page.locator(".game-grid")
        grid.screenshot(path="verification_grid_restored.png")

        browser.close()

if __name__ == "__main__":
    run()
