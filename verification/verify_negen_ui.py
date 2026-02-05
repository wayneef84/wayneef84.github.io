from playwright.sync_api import sync_playwright
import time

def verify_negen_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 800, "height": 600})

        try:
            # Pong
            print("Checking Pong...")
            page.goto("http://localhost:8081/games/pong/index.html")
            page.wait_for_selector("text=PONG", timeout=5000)
            page.screenshot(path="verification_pong.png")
            print("Pong verified")

            # Breakout
            print("Checking Breakout...")
            page.goto("http://localhost:8081/games/breakout/index.html")
            page.wait_for_selector("text=Breakout", timeout=5000)
            page.screenshot(path="verification_breakout.png")
            print("Breakout verified")

            # Space Invaders
            print("Checking Space Invaders...")
            page.goto("http://localhost:8081/games/space_invaders/index.html")
            page.wait_for_selector("text=SPACE INVADERS", timeout=5000)
            page.screenshot(path="verification_space_invaders.png")
            print("Space Invaders verified")

            # Snake
            print("Checking Snake...")
            page.goto("http://localhost:8081/games/snake/negen_version/index.html")
            page.wait_for_selector("text=NEON SERPENT", timeout=5000)
            page.screenshot(path="verification_snake.png")
            print("Snake verified")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_failure.png")

        browser.close()

if __name__ == "__main__":
    verify_negen_ui()
