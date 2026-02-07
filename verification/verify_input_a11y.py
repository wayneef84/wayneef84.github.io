from playwright.sync_api import sync_playwright
import os

def verify_input_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load page
        # Resolving absolute path for file://
        cwd = os.getcwd()
        path = f"file://{cwd}/projects/input-a11y/index.html"
        print(f"Navigating to {path}")
        page.goto(path)

        # 1. Check Title
        title = page.title()
        print(f"Page Title: {title}")
        assert "Input A11y" in title, f"Expected 'Input A11y' in title, got '{title}'"

        # 2. Check UI for URL Input option
        # It's in a select #set-action. It might be hidden under details, but value is accessible.
        action_value = page.eval_on_selector("#set-action", "el => el.value")
        print(f"Action Value: {action_value}")
        assert action_value == "URL_INPUT", f"Expected 'URL_INPUT', got '{action_value}'"

        # 3. Check OCR Manager existence
        is_ocr_defined = page.evaluate("typeof OCRManager !== 'undefined'")
        print(f"OCRManager Defined: {is_ocr_defined}")
        assert is_ocr_defined, "OCRManager is not defined"

        # 4. Check Scan Mode options
        # We expect 'TEXT_OCR' to be an option
        ocr_option = page.locator("#scanMode option[value='TEXT_OCR']")
        assert ocr_option.count() > 0, "TEXT_OCR option missing"

        # Take screenshot of the UI
        # Open details to show settings
        page.click("summary")
        page.screenshot(path="verification/input_a11y_ui.png")
        print("Screenshot saved to verification/input_a11y_ui.png")

        browser.close()

if __name__ == "__main__":
    verify_input_a11y()
