from playwright.sync_api import sync_playwright
import os

def test_falldown(page):
    # Construct the absolute file path to the game
    game_path = os.path.abspath("games/falldown/index.html")
    file_url = f"file://{game_path}"

    print(f"Navigating to: {file_url}")
    page.goto(file_url)

    # Wait for the canvas to be visible, indicating the game loaded
    page.wait_for_selector("#game-canvas", state="visible")

    # Wait for the main menu to appear (it has class 'overlay')
    page.wait_for_selector("#main-menu", state="visible")

    # Take a screenshot of the main menu
    page.screenshot(path="verification/falldown_menu.png")
    print("Screenshot taken: verification/falldown_menu.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_falldown(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
