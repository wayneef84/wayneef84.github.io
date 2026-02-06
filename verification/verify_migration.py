from playwright.sync_api import sync_playwright, expect
import json

def test_migration():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Seed legacy data
        legacy_data = [{
            "id": "legacy_char_1",
            "name": "Legacy Char",
            "type": "beats",
            "img": "img/b01.svg",
            "audio": "audio/b01.wav",
            "pack_id": "custom",
            "custom": True
        }]

        print("Seeding legacy data...")
        # Must be on domain to set localstorage
        page.goto("http://localhost:8000/games/sprunki/index.html")
        page.evaluate(f"localStorage.setItem('s4k_custom_chars', '{json.dumps(legacy_data)}')")

        # Reload to trigger migration
        print("Reloading to migrate...")
        page.reload()

        # Wait for data manager to init and migrate
        page.wait_for_timeout(2000)

        # Check if character is present in the "Custom" pack (or just loaded in memory)
        # We can check global config
        chars = page.evaluate("config.characters")
        found = any(c['id'] == 'legacy_char_1' for c in chars)

        if found:
            print("SUCCESS: Legacy character migrated and loaded.")
        else:
            print("FAILURE: Legacy character not found.")
            exit(1)

        browser.close()

if __name__ == "__main__":
    test_migration()
