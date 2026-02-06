from playwright.sync_api import sync_playwright
import time

def verify_new_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 800, "height": 600})

        try:
            # 1. Snake Battle Royale UI Check
            print("Checking Snake Battle Royale UI...")
            page.goto("http://localhost:8081/games/snake/negen_version/index.html")
            page.wait_for_selector("text=BATTLE 360", timeout=5000)
            page.screenshot(path="verification_snake_ui_new.png")
            print("Snake Battle Royale UI verified")

            # 2. Animal Stack Load Check
            print("Checking Animal Stack...")
            page.goto("http://localhost:8081/games/animal_stack/index.html")
            page.wait_for_selector("text=ANIMAL STACK", timeout=5000)
            page.screenshot(path="verification_animal_stack.png")
            print("Animal Stack verified")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_failure_new.png")

        browser.close()

if __name__ == "__main__":
    verify_new_features()
