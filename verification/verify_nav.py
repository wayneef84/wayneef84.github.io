from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Main Page with Retro Filter
        print("Navigating to Home Page...")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_selector(".game-grid")

        # Check for Retro Button
        retro_btn = page.locator("button[data-filter='retro']")
        if retro_btn.is_visible():
            print("Retro button found.")
            retro_btn.click()
            page.wait_for_timeout(500) # Wait for filter
            page.screenshot(path="verification/home_retro_filter.png")
            print("Home page retro filter screenshot taken.")
        else:
            print("Retro button NOT found!")

        # 2. Check if Flash Classics is visible
        flash_card = page.locator("a[href='games/flash_classics/index.html']")
        if flash_card.is_visible():
            print("Flash Classics card found.")
        else:
            print("Flash Classics card NOT found!")

        browser.close()

if __name__ == "__main__":
    run()
