from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Start on Pack Selector
    print("Navigating to index...")
    page.goto("http://localhost:8080/games/j/index.html")
    page.wait_for_selector("#packGrid .pack-card", timeout=5000)

    # 2. Click a pack and verify URL change
    print("Clicking pack...")
    page.click("#packGrid .pack-card:first-child")
    page.wait_for_selector("#gameContainer:not(.hidden)", timeout=3000)

    current_url = page.url
    print(f"Current URL: {current_url}")
    if "pack=" not in current_url:
        raise Exception("URL did not update with pack parameter")

    # 3. Use Back Button (In-Game) and verify URL clear
    print("Clicking in-game back button...")
    page.on("dialog", lambda dialog: dialog.accept())
    page.click("#backToPacksBtn")
    page.wait_for_selector("#packSelector:not(.hidden)", timeout=3000)

    current_url = page.url
    print(f"Current URL after back: {current_url}")
    if "pack=" in current_url:
        raise Exception("URL did not clear pack parameter")

    # 4. Test Direct Navigation with URL
    pack_path = "packs/technology_v1.json"
    target_url = f"http://localhost:8080/games/j/index.html?pack={pack_path}"
    print(f"Navigating directly to: {target_url}")
    page.goto(target_url)

    # Wait for game container (skip pack selector wait)
    page.wait_for_selector("#gameContainer:not(.hidden)", timeout=5000)
    print("Direct navigation successful")

    # Verify title contains TECHNOLOGY (checking case-insensitive or part of it)
    title = page.locator("#packTitle").inner_text()
    print(f"Pack Title: {title}")
    if "TECHNOLOGY" not in title:
         raise Exception("Loaded wrong pack or title not updated")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
