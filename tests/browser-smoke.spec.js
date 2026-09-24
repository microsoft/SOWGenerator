const fs = require('node:fs/promises');
const { test, expect } = require('@playwright/test');

test('consent, form, generation, and encrypted JSON round trip', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#disclaimerOverlay')).toHaveAttribute('data-clarity-mask', 'true');
  await expect(page.locator('#treeOverlay')).toHaveAttribute('data-clarity-mask', 'true');
  await expect(page.locator('#sowDoc')).toHaveAttribute('data-clarity-mask', 'true');

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
  await expect(page.locator('#sowContent')).toHaveAttribute('data-clarity-mask', 'true');
  await expect(page.locator('.export-guidance')).toContainText('Word, Print/PDF, and clipboard outputs are plaintext');

  const password = 'Readiness smoke phrase 2026!';
  const promptAnswers = [];
  const dialogMessages = [];
  page.on('dialog', async dialog => {
    dialogMessages.push(dialog.message());
    if (dialog.type() === 'prompt') {
      const answer = promptAnswers.shift();
      await dialog.accept(answer === undefined ? '' : answer);
    } else {
      await dialog.accept();
    }
  });

  promptAnswers.push('passwordpassword');
  await page.getByRole('button', { name: /Export JSON/ }).click();
  await expect.poll(() => dialogMessages.some(message => message.includes('commonly used or compromised')))
    .toBe(true);

  promptAnswers.push(password, password);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export JSON/ }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const exported = JSON.parse(await fs.readFile(downloadPath, 'utf8'));
  expect(exported).toMatchObject({
    version: 2,
    encrypted: true,
    algorithm: 'AES-256-GCM',
    kdf: {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 600000,
      keyLength: 256
    }
  });
  expect(Object.keys(exported).sort()).toEqual(['algorithm', 'data', 'encrypted', 'iv', 'kdf', 'salt', 'version']);
  expect(Object.keys(exported.kdf).sort()).toEqual(['hash', 'iterations', 'keyLength', 'name']);

  await page.getByRole('button', { name: /Back to Form/ }).click();
  await page.getByRole('button', { name: /Reset All/ }).click();
  await expect(page.locator('#customerName')).toHaveValue('');

  const tampered = JSON.parse(JSON.stringify(exported));
  tampered.kdf.iterations = 600001;
  await page.locator('#jsonFileInput').setInputFiles({
    name: 'tampered-sow.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(tampered))
  });
  await expect.poll(() => dialogMessages.some(message => message.includes('Unsupported or unreasonable version 2 KDF parameters')))
    .toBe(true);
  await expect(page.locator('#customerName')).toHaveValue('');

  promptAnswers.push(password);
  await page.locator('#jsonFileInput').setInputFiles(downloadPath);
  await expect(page.locator('#customerName')).toHaveValue('Fabrikam Customer');
  await expect(page.locator('#partnerName')).toHaveValue('Contoso Partner');
  await expect(page.locator('#p1 input[type="checkbox"]').first()).toBeChecked();
});

test('published archive does not initialize Microsoft Clarity', async ({ page }) => {
  const clarityRequests = [];
  page.on('request', request => {
    if (request.url().includes('clarity.ms')) clarityRequests.push(request.url());
  });

  await page.goto('/Archive/mip-sow-generator.html');
  await page.waitForTimeout(250);
  expect(clarityRequests).toEqual([]);
});

test('imports legacy encrypted JSON exports with the fixed 100k KDF', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'I Acknowledge' }).click();

  const password = 'legacy-short';
  const legacyState = {
    engagement: {
      partnerName: 'Legacy Partner',
      customerName: 'Legacy Customer',
      preparedBy: 'Legacy Author',
      startDate: '',
      duration: '2 weeks',
      deliveryModel: ['deploy']
    },
    environment: {
      userCount: '1–500 users',
      license: '',
      industry: 'Technology',
      maturity: '',
      dlpMaturity: ''
    },
    services: { p1: [], p2: [], p3: [] },
    managedServices: []
  };

  const legacyEnvelope = await page.evaluate(async ({ password, legacyState }) => {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(JSON.stringify(legacyState))
    );
    const toBase64 = value => btoa(String.fromCharCode(...new Uint8Array(value)));
    return {
      encrypted: true,
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256-100k',
      salt: toBase64(salt),
      iv: toBase64(iv),
      data: toBase64(ciphertext)
    };
  }, { password, legacyState });

  page.on('dialog', async dialog => {
    if (dialog.type() === 'prompt') {
      await dialog.accept(password);
    } else {
      await dialog.accept();
    }
  });

  await page.locator('#jsonFileInput').setInputFiles({
    name: 'legacy-sow.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(legacyEnvelope))
  });
  await expect(page.locator('#customerName')).toHaveValue('Legacy Customer');
  await expect(page.locator('#partnerName')).toHaveValue('Legacy Partner');
  await expect(page.locator('#engType_deploy')).toBeChecked();
});
