import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Use file protocol to access the local file directly
        page.goto('file:///app/games/cards/poker/5card/index.html')

        # Wait for game to initialize and deal
        page.wait_for_timeout(2000)

        # Click Deal
        page.click('#btnDeal')
        page.wait_for_timeout(1000)

        # Take screenshot
        page.screenshot(path='verification/5card_poker.png')
        browser.close()

if __name__ == '__main__':
    run()
