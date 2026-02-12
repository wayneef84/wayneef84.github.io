from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Start a game with a specific pack (so we know the correct answer)
    # Using 'technology_v1.json' or something predictable would be ideal,
    # but the engine shuffles questions.
    # However, we can check for the CLASS being applied when "Lock Fast Forward" is on.

    print("Navigating...")
    page.goto("http://localhost:8080/games/j/index.html")
    page.click("#packGrid .pack-card:first-child")
    page.wait_for_selector("#gameContainer:not(.hidden)", timeout=3000)

    # 2. Enable Lock Fast Forward
    print("Enabling Fast Forward...")
    page.check("#lockToggle")

    # 3. Find correct answer (Playwright doesn't know, so we cheat: select A, if incorrect, try B...)
    # Actually, we can just click ANY answer and check if ONE of them gets .pop-correct.
    # Because even if we click wrong, the correct one is highlighted.

    print("Selecting an answer...")
    # Click option A
    page.click("button[data-option='A']")

    # 4. Check for .pop-correct class
    # We need to wait for it to appear
    try:
        # Wait for ANY button to have .pop-correct
        page.wait_for_selector(".answer-btn.pop-correct", timeout=2000)
        print("Animation class .pop-correct appeared!")
    except Exception as e:
        print("Failed to find .pop-correct class.")
        # Maybe we need to verify if the toggle worked?
        is_checked = page.is_checked("#lockToggle")
        print(f"Lock Toggle Checked: {is_checked}")
        raise e

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
