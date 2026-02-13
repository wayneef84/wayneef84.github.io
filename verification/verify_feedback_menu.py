from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set a tall viewport to ensure modal fits
        context = browser.new_context(viewport={"width": 1280, "height": 1200})
        page = context.new_page()

        # Navigate to the game
        page.goto("http://localhost:8080/games/j/index.html")

        # Wait for pack selector
        page.wait_for_selector("#packSelector")

        # Click a pack (e.g. first one)
        page.locator(".pack-card").first.click()

        # Wait for setup modal
        page.wait_for_selector("#setupModal:not(.hidden)")

        # Start Game (Normal mode, no fast forward)
        page.click("#startGameBtn", force=True)

        # Wait for game container
        page.wait_for_selector("#gameContainer:not(.hidden)")

        # Ensure Lock Fast Forward is OFF (default)

        # Select an answer (A)
        page.click("button[data-option='A']")

        # Wait for feedback backdrop
        page.wait_for_selector("#feedbackBackdrop:not(.hidden)")
        print("PASS: Feedback menu appeared.")

        # Take screenshot 1: Menu Open
        page.screenshot(path="verification/j_feedback_menu_open.png")

        # Click Backdrop (outside the menu box) to dismiss
        # The backdrop is fixed full screen, the menu is centered.
        # Clicking at 0,0 (top left) should hit the backdrop.
        page.mouse.click(10, 10)

        # Wait for backdrop to hide
        # It has transition, give it a moment
        time.sleep(0.5)

        # Verify hidden
        # We can check class 'hidden' or visibility
        # The backdrop has .hidden class when closed
        if "hidden" in page.get_attribute("#feedbackBackdrop", "class"):
             print("PASS: Feedback menu closed on outside click.")
        else:
             print("FAIL: Feedback menu did not close.")

        # Take screenshot 2: Menu Closed (Board Visible)
        page.screenshot(path="verification/j_feedback_menu_closed.png")

        # Click Next (Footer) to advance
        page.click("#nextBtn")

        # Wait for next question (qCount changes to 2/10)
        page.wait_for_function("document.getElementById('qCount').textContent.startsWith('2/')")
        print("PASS: Advanced to next question via footer.")

        # Answer next question
        page.click("button[data-option='B']")

        # Wait for feedback menu again
        page.wait_for_selector("#feedbackBackdrop:not(.hidden)")

        # Click "Next Question" inside the menu
        page.click("#feedbackNextBtn")

        # Wait for next question (qCount 3/10)
        page.wait_for_function("document.getElementById('qCount').textContent.startsWith('3/')")
        print("PASS: Advanced to next question via menu button.")

        browser.close()

if __name__ == "__main__":
    run()
