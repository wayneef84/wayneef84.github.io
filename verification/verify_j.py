from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the game (via local server)
    page.goto("http://localhost:8000/games/j/index.html")

    # Wait for pack title to load (indicates JSON fetch success)
    page.wait_for_selector("#packTitle", state="visible")

    # Check if title is correct
    title = page.inner_text("#packTitle")
    print(f"Pack Title: {title}")

    # Wait for question text
    page.wait_for_selector("#questionText")
    question = page.inner_text("#questionText")
    print(f"Question: {question}")

    # Check if answers are enabled
    page.wait_for_selector(".answer-btn:not([disabled])")

    # Take a screenshot of the initial state
    page.screenshot(path="verification/j_initial.png")

    # Click an answer (e.g., Option B)
    page.click("button[data-option='B']")

    # Wait for feedback or button state change
    # If correct, class 'correct' added. If incorrect, 'incorrect'.
    # We just want to see the UI state after interaction.
    page.wait_for_timeout(1000) # Wait for animation/feedback

    page.screenshot(path="verification/j_answered.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
