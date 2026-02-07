from playwright.sync_api import sync_playwright

def verify_games():
    with sync_playwright() as p:
        device = p.devices['iPhone 12']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**device)
        page = context.new_page()

        # Catch console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        games = [
            ("Space Invaders", "games/space_invaders/index.html", "space_invaders"),
            ("Pong", "games/pong/index.html", "pong"),
            ("Breakout", "games/breakout/index.html", "breakout")
        ]

        for name, path, file_prefix in games:
            print(f"--- Testing {name} ---")
            try:
                page.goto(f"http://localhost:8080/{path}")

                overlay = page.locator("#startOverlay")
                overlay.wait_for(state="visible", timeout=5000)

                print("Tapping overlay...")
                overlay.tap()

                overlay.wait_for(state="hidden", timeout=5000)
                print(f"SUCCESS: {name} started.")

                page.screenshot(path=f"verification/{file_prefix}_started.png")

            except Exception as e:
                print(f"FAILURE: {name} - {e}")

        browser.close()

if __name__ == "__main__":
    verify_games()
