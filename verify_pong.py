from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 800, "height": 600})
    try:
        page.goto("http://localhost:8080/games/pong/index.html")

        # Wait for overlay and verify text
        page.wait_for_selector("#startOverlay")
        print("Overlay found")

        # Click to start
        page.click("#startOverlay")
        print("Clicked start")

        # Wait for game to run a bit (particles, movement)
        # Simulate some input to move paddle and create curve
        # Press ArrowDown
        page.keyboard.down("ArrowDown")
        page.wait_for_timeout(500)
        page.keyboard.up("ArrowDown")

        # Press ArrowUp
        page.keyboard.down("ArrowUp")
        page.wait_for_timeout(500)
        page.keyboard.up("ArrowUp")

        # Wait a bit more for ball to move
        page.wait_for_timeout(1000)

        # Screenshot
        page.screenshot(path="pong_verification.png")
        print("Screenshot saved")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
