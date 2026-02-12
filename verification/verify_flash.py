from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Menu
        print("Navigating to Flash Menu...")
        page.goto("http://localhost:8080/games/flash_classics/index.html")
        page.wait_for_selector(".menu-container")
        page.screenshot(path="verification/menu.png")
        print("Menu screenshot taken.")

        # 2. Chopper
        print("Navigating to Chopper...")
        page.click("text=CHOPPER")
        page.wait_for_selector("#gameCanvas")
        # Click Play to start (optional, but shows the game running)
        page.click("#start-btn")
        page.wait_for_timeout(500) # Wait a bit for game to start
        page.screenshot(path="verification/chopper.png")
        print("Chopper screenshot taken.")

        page.go_back()
        page.wait_for_selector(".menu-container")

        # 3. Defender
        print("Navigating to Defender...")
        page.click("text=DEFENDER")
        page.wait_for_selector("#gameCanvas")
        page.click("#start-btn")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/defender.png")
        print("Defender screenshot taken.")

        page.go_back()
        page.wait_for_selector(".menu-container")

        # 4. Runner
        print("Navigating to Neon Runner...")
        page.click("text=NEON RUNNER")
        page.wait_for_selector("#gameCanvas")
        page.click("#start-btn")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/runner.png")
        print("Runner screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
