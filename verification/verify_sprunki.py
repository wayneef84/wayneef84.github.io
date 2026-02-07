from playwright.sync_api import sync_playwright, expect

def test_sprunki_refactor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Enable logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"ERROR: {err}"))

        print("Loading game...")
        page.goto("http://localhost:8000/games/sprunki/index.html")

        # Wait for palette
        page.wait_for_selector(".char-box")
        print("Game loaded.")

        # Check for Buttons
        expect(page.get_by_text("📷 SCAN")).to_be_visible()

        # Check if Library loaded (by checking window.QRMaster)
        is_loaded = page.evaluate("() => !!window.QRMaster")
        print(f"QRMaster Loaded: {is_loaded}")
        assert is_loaded == True

        # Open Creator
        print("Opening Creator...")
        page.get_by_text("+ CREATE").click()
        expect(page.locator("#editorModal")).to_have_class("modal-overlay active")

        # Close Creator
        page.click("#btnCancelEdit")

        page.screenshot(path="verification/refactor_proof.png")

        print("Refactor Verification Passed!")
        browser.close()

if __name__ == "__main__":
    test_sprunki_refactor()
