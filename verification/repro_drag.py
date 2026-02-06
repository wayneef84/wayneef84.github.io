from playwright.sync_api import sync_playwright, expect

def test_sprunki_drag():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"ERROR: {err}"))

        # Load
        page.goto("http://localhost:8000/games/sprunki/index.html")
        page.wait_for_selector(".char-box")

        # Get first character in palette
        char = page.locator(".char-box").first

        # Get first slot
        slot = page.locator("#slot-0")

        # Drag and drop
        print("Dragging character to slot...")
        char.drag_to(slot)

        # Wait a bit
        page.wait_for_timeout(1000)

        # Check if slot is active
        # The app logic adds 'active' class to slot if successful
        if "active" in slot.get_attribute("class"):
            print("SUCCESS: Character stayed in slot.")
        else:
            print("FAILURE: Character did not stay in slot.")
            # Screenshot for debug
            page.screenshot(path="verification/drag_fail.png")
            exit(1)

        browser.close()

if __name__ == "__main__":
    test_sprunki_drag()
