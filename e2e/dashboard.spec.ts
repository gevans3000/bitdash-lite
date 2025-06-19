import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load the dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Verify the main elements are present
    await expect(page.getByRole('heading', { name: /bitdash lite/i })).toBeVisible();
    await expect(page.getByTestId('market-chart')).toBeVisible();
    await expect(page.getByTestId('price-card')).toBeVisible();
    await expect(page.getByTestId('signal-card')).toBeVisible();
  });

  test('should display price data', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the chart to load data
    const chart = page.getByTestId('market-chart');
    await expect(chart).toBeVisible();
    
    // Verify price data is displayed
    const priceCard = page.getByTestId('price-card');
    await expect(priceCard).toContainText(/\.\d{2}/); // Check for price format
  });
});
