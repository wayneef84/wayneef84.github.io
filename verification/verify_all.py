
from playwright.sync_api import sync_playwright
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Poker
        # We need to serve the file. Since we don't have a server running,
        # we can try file:// access if possible, or assume a relative path from repo root.
        # But Playwright handles file paths well.
        repo_root = os.getcwd()

        # Poker URL
        poker_url = f"file://{repo_root}/games/cards/poker/5card/index.html"
        print(f"Checking Poker at: {poker_url}")
        page.goto(poker_url)
        page.wait_for_timeout(1000) # Wait for init
        page.screenshot(path="verification/poker_initial.png")

        # 2. Verify Snake (NEGEN Version)
        snake_url = f"file://{repo_root}/games/snake/negen_version/index.html"
        print(f"Checking Snake at: {snake_url}")
        page.goto(snake_url)
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/snake_negen.png")

        # 3. Verify SKYbreakers
        sky_url = f"file://{repo_root}/games/sky_breakers/index.html"
        print(f"Checking SKYbreakers at: {sky_url}")
        page.goto(sky_url)
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/sky_initial.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
