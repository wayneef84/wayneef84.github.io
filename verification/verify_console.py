
from playwright.sync_api import sync_playwright
import os

def test_homepage_console_errors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_messages = []
        page.on("console", lambda msg: console_messages.append(msg))
        page.on("pageerror", lambda err: console_messages.append(f"PAGE ERROR: {err}"))

        filepath = os.path.abspath("index.html")
        try:
            page.goto(f"file://{filepath}")
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Playwright Exception: {e}")

        for msg in console_messages:
            print(f"CONSOLE: {msg}")

        browser.close()

if __name__ == "__main__":
    test_homepage_console_errors()
