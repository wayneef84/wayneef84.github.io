from playwright.sync_api import sync_playwright

def verify_poker_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Go to Homepage
        page.goto("http://localhost:8080/index.html")
        print("Loaded Homepage")

        # 2. Find Poker Hall card
        poker_card = page.locator("a.game-card:has-text('Poker Hall')")
        if poker_card.count() == 0:
            print("Poker Hall card not found!")
            browser.close()
            return

        print("Found Poker Hall card")

        # 3. Click it
        poker_card.click()

        # 4. Wait for navigation
        page.wait_for_load_state("networkidle")
        print(f"Navigated to: {page.url}")

        # 5. Check URL
        expected_url = "http://localhost:8080/games/cards/index.html?game=poker"
        if page.url == expected_url:
            print("URL matches expected.")
        else:
            print(f"URL mismatch! Expected: {expected_url}, Got: {page.url}")

        # 6. Verify Sidebar active state (desktop) or Title (mobile)
        # We are running headless desktop size by default (1280x720) so sidebar should be visible
        sidebar_poker_btn = page.locator("#desktop-list button.game-btn.active:has-text('Poker')")
        if sidebar_poker_btn.count() > 0:
             print("Sidebar Poker button is active.")
        else:
             print("Sidebar Poker button is NOT active.")

        # 7. Take screenshot
        page.screenshot(path="verification/poker_verification.png")
        print("Screenshot saved to verification/poker_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_poker_navigation()
