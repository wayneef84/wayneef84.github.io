from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to index...")
    page.goto("http://localhost:8080/games/j/index.html")
    page.wait_for_selector("#customGameBtn", timeout=5000)

    # 1. Open Custom Game Modal
    print("Opening Custom Game setup...")
    page.click("#customGameBtn")
    page.wait_for_selector("#multiPackSelection:not(.hidden)", timeout=2000)

    # 2. Select Packs (First 3)
    checkboxes = page.locator("#multiPackList input[type='checkbox']")
    count = checkboxes.count()
    print(f"Found {count} available packs.")

    if count < 3:
        raise Exception("Not enough packs to test multi-select")

    print("Selecting first 3 packs...")
    checkboxes.nth(0).check()
    checkboxes.nth(1).check()
    checkboxes.nth(2).check()

    # 3. Set Limit to 2
    print("Setting pack limit to 2...")
    page.fill("#packLimitRange", "2")
    # Trigger input event if fill doesn't
    page.evaluate("document.getElementById('packLimitRange').dispatchEvent(new Event('input'))")

    # Verify display update
    limit_text = page.locator("#packLimitDisplay").inner_text()
    if limit_text != "2":
        print(f"Warning: Range display is '{limit_text}', expected '2'")

    # 4. Start Game
    print("Starting custom game...")
    page.click("#startGameBtn")
    page.wait_for_selector("#gameContainer:not(.hidden)", timeout=5000)

    # Verify Title
    title = page.locator("#packTitle").inner_text()
    print(f"Game Title: {title}")
    if "CUSTOM MIX" not in title:
        raise Exception("Game title indicates wrong mode")

    print("Custom game started successfully.")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
