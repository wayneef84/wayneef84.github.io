from playwright.sync_api import sync_playwright
import time

def verify_slots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the game
        print("Navigating to slots game...")
        page.goto("http://localhost:8000/games/slots/index.html")

        # Wait for game to initialize
        time.sleep(2)

        # Select the 'pirates' theme to verify it exists
        print("Selecting 'pirates' theme...")
        try:
            page.select_option("#themeSelector", "pirates")
            print("Pirates theme selected.")
        except Exception as e:
            print(f"Failed to select pirates theme: {e}")

        # Wait for theme change
        time.sleep(1)

        # Take a screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_slots.png")

        # Verify 3D mode debug info if visible
        # We can toggle debug to see FPS/etc
        print("Toggling debug...")
        page.click("#debugButton")
        time.sleep(0.5)
        page.screenshot(path="verification_slots_debug.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_slots()
