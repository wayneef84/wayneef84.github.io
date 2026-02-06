from playwright.sync_api import sync_playwright

def verify_board_games():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load Xiangqi (Default)
        url = "http://localhost:8080/games/board/index.html"
        print(f"Navigating to {url}")
        page.goto(url)
        page.wait_for_load_state("networkidle")

        # Verify Title
        title = page.title()
        print(f"Page Title: {title}")
        if "Board Games Arcade" not in title:
            print("ERROR: Title mismatch")

        # Screenshot Xiangqi
        page.screenshot(path="verification/xiangqi.png")
        print("Xiangqi screenshot taken.")

        # Load Chess
        print("Selecting Chess...")
        page.select_option("#gameSelector", "chess")
        page.wait_for_timeout(1000) # Wait for canvas redraw
        page.screenshot(path="verification/chess.png")
        print("Chess screenshot taken.")

        # Load Checkers
        print("Selecting Checkers...")
        page.select_option("#gameSelector", "checkers")
        page.wait_for_timeout(1000) # Wait for canvas redraw
        page.screenshot(path="verification/checkers.png")
        print("Checkers screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_board_games()
