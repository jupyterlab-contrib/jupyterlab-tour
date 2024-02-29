import { expect, test } from '@jupyterlab/galata';

test.use({
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
  await page.getByLabel('file browser').getByText('New').click();

  const [notebookPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByText('Python 3 (ipykernel)').click()
  ]);
  await notebookPage.getByRole('button', { name: 'Start now' }).click();
  await notebookPage.getByLabel('Next', { exact: true }).click();
  await notebookPage.getByLabel('Next', { exact: true }).click();
  await notebookPage.getByLabel('Next', { exact: true }).click();
  await notebookPage.getByLabel('Next', { exact: true }).click();
  await notebookPage.getByLabel('Next', { exact: true }).click();
  await notebookPage.getByLabel('Next', { exact: true }).click();
  await expect
    .soft(notebookPage.locator('.react-joyride__tooltip p'))
    .toHaveText(/Its name and its status are displayed here\.$/);
  await notebookPage.getByLabel('Done').click();
});
