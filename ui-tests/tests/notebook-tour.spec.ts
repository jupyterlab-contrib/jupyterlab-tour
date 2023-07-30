import { expect, test as base } from '@jupyterlab/galata';

export const test = base.extend({
  waitForApplication: async ({ baseURL }, use, testInfo) => {
    const waitIsReady = async (page): Promise<void> => {
      await page.waitForSelector('#main-panel');
    };
    await use(waitIsReady);
  }
});

test('should run the welcome tour', async ({ page }) => {
  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();

  await expect
    .soft(page.locator('.react-joyride__tooltip h4'))
    .toHaveText('Command Palette');
  await page.getByLabel('Done').click();
});

test('should run the notebook tour', async ({ page }) => {
  await page.getByRole('menuitem', { name: 'File' }).click();
  await page.getByText('New', { exact: true }).click();
  await page.locator('#jp-mainmenu-file-new').getByText('Notebook').click();
  await page.getByRole('button', { name: 'Select Kernel' }).click();
  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await page.getByLabel('Next', { exact: true }).click();
  await expect
    .soft(page.locator('.react-joyride__tooltip p'))
    .toHaveText(/Its name and its status are displayed here\.$/);
  await page.getByLabel('Done').click();
});
