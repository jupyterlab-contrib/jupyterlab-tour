/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  testMatch: 'tests/notebook*.spec.ts',
  use: {
    ...baseConfig.use,
    appPath: ''
  },
  webServer: {
    command: 'jlpm start:notebook',
    url: 'http://localhost:8888/tree',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
};
