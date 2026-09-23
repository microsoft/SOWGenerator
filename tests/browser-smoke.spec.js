const fs = require('node:fs/promises');
const { test, expect } = require('@playwright/test');

test('consent, form, generation, and encrypted JSON round trip', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'I Acknowledge' }).click();
  await page.getByRole('button', { name: 'Decline' }).click();
  await expect(page.locator('#analyticsBanner')).toContainText('Declined Telemetry');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('analyticsConsent')))
    .toBe('declined');

  await page.locator('#partnerName').fill('Contoso Partner');
  await page.locator('#customerName').fill('Fabrikam Customer');
  await page.locator('#preparedBy').fill('Readiness Smoke Test');
  await page.locator('#duration').selectOption('4 weeks (1 month)');
  await page.getByRole('heading', { name: /Engagement Type/ }).click();
  await page.locator('#engType_deploy').check();
  await page.getByRole('heading', { name: /Data Security Services: Foundation/ }).click();
  await page.locator('#p1 input[type="checkbox"]').first().check();

  await page.getByRole('button', { name: /Generate SOW Document/ }).click();
  await expect(page.locator('#sowDoc')).toHaveClass(/visible/);
  await expect(page.locator('#sowContent')).toContainText('Fabrikam Customer');
  await expect(page.locator('#sowContent')).toContainText('Enable Microsoft Purview Audit Logging');

  const password = 'readiness-smoke-password';
  page.on('dialog', async dialog => {
    if (dialog.type() === 'prompt') {
      await dialog.accept(password);
    } else {
      await dialog.accept();
    }
  });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export JSON/ }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const exported = JSON.parse(await fs.readFile(downloadPath, 'utf8'));
  expect(exported).toMatchObject({
    encrypted: true,
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256-100k'
  });

  await page.getByRole('button', { name: /Back to Form/ }).click();
  await page.getByRole('button', { name: /Reset All/ }).click();
  await expect(page.locator('#customerName')).toHaveValue('');

  await page.locator('#jsonFileInput').setInputFiles(downloadPath);
  await expect(page.locator('#customerName')).toHaveValue('Fabrikam Customer');
  await expect(page.locator('#partnerName')).toHaveValue('Contoso Partner');
  await expect(page.locator('#p1 input[type="checkbox"]').first()).toBeChecked();
});
