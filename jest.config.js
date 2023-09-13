const jestJupyterLab = require('@jupyterlab/testutils/lib/jest-config');

const esModules = [
  '@codemirror',
  '@jupyter/ydoc',
  '@jupyterlab/',
  'lib0',
  'nanoid',
  'vscode-ws-jsonrpc',
  'y-protocols',
  'y-websocket',
  'yjs'
].join('|');

const baseConfig = jestJupyterLab(__dirname);

module.exports = {
  ...baseConfig,
  automock: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/.ipynb_checkpoints/*'
  ],
  coverageReporters: ['lcov', 'text'],
  modulePathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/jupyterlab_tour',
    '<rootDir>/lib',
    '<rootDir>/ui-tests'
  ],
  testRegex: 'src/.*/.*.spec.ts[x]?$',
  transformIgnorePatterns: [`/node_modules/(?!${esModules}).+`]
};
