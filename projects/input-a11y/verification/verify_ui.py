
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        # Assuming the script is run from repo root
        file_path = os.path.abspath("projects/input-a11y/index.html")
        page.goto(f"file://{file_path}")

        # Click on Settings Tab
        page.click("button[data-tab='settings']")

        # Take a screenshot of the settings tab
        page.screenshot(path="projects/input-a11y/verification/settings_tab.png")

        # Check if new elements exist
        try:
            page.wait_for_selector("#set-camera-device")
            print("Camera Source dropdown found.")
        except:
            print("Camera Source dropdown NOT found.")

        try:
            page.wait_for_selector(".settings-footer")
            print("Settings Footer found.")
        except:
            print("Settings Footer NOT found.")

        try:
            page.wait_for_selector("#set-ocr-manual-override")
            print("OCR Manual Override toggle found.")
        except:
            print("OCR Manual Override toggle NOT found.")

        try:
            page.wait_for_selector("#set-barcode-manual-override")
            print("Barcode Manual Override toggle found.")
        except:
            print("Barcode Manual Override toggle NOT found.")

        # Test History Layout
        page.click("button[data-tab='history']")
        page.screenshot(path="projects/input-a11y/verification/history_tab.png")

        browser.close()

if __name__ == "__main__":
    run()
