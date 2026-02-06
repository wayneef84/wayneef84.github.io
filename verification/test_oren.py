from playwright.sync_api import sync_playwright, expect

def test_oren_drag():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"ERROR: {err}"))

        # Load
        page.goto("http://localhost:8000/games/sprunki/index.html")
        page.wait_for_selector(".char-box")

        # Find Oren
        # Oren is the first one, but let's find by text to be sure
        oren = page.locator(".char-box", has_text="Oren").first

        # Get first slot
        slot = page.locator("#slot-0")

        # Drag and drop
        print("Dragging Oren to slot...")
        oren.drag_to(slot)

        # Wait a bit for async fetch
        page.wait_for_timeout(2000)

        # Check if slot is active
        if "active" in slot.get_attribute("class"):
            print("SUCCESS: Oren stayed in slot.")
            page.screenshot(path="verification/oren_success.png")
        else:
            print("FAILURE: Oren did not stay in slot.")
            page.screenshot(path="verification/oren_fail.png")
            exit(1)

        browser.close()

if __name__ == "__main__":
    test_oren_drag()
