// @ts-check
const { test, expect } = require('@playwright/test');

test('OQ - Sudoku Smoke Test', async ({ page }) => {
  // 1. Navigate to the Beta Environment
  const betaUrl = process.env.BETA_URL;
  if (!betaUrl) {
    throw new Error('BETA_URL environment variable is not set');
  }
  console.log(`Navigating to: ${betaUrl}`);

  // Go to the beta URL
  await page.goto(betaUrl);

  // 2. Locate the "Sudoku" card
  // The card is an anchor tag with href="games/sudoku/index.html"
  // We can also find it by text "Sudoku" inside h3
  const sudokuCard = page.locator('a.game-card[href="games/sudoku/index.html"]');
  await expect(sudokuCard).toBeVisible();

  // 3. Click "Start/Play" (Click the card)
  await sudokuCard.click();

  // Wait for navigation to the game page. We use a regex to be flexible with trailing slashes or query params
  await page.waitForURL(/\/games\/sudoku\/index\.html/);

  // 4. Assert: A generic 9x9 grid exists in the DOM
  // The board container has id "sudoku-board"
  const board = page.locator('#sudoku-board');
  await expect(board).toBeVisible();

  // Check that 81 cells are generated
  const cells = board.locator('.cell');
  await expect(cells).toHaveCount(81);

  console.log('Sudoku grid verification passed.');
});
