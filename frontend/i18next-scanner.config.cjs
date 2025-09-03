const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const langs = ['zh', 'en'];

module.exports = {
  input: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/i18n/**',
    '!**/node_modules/**'
  ],
  output: './',
  options: {
    debug: false,
    removeUnusedKeys: false,
    func: {
      list: ['t'],
      extensions: ['.ts', '.tsx']
    },
    trans: false,
    lngs: langs,
    ns: ['translation'],
    defaultLng: 'zh',
    defaultNs: 'translation',
    defaultValue: '',
    resource: {
      loadPath: 'src/i18n/{{lng}}.json',
      savePath: 'src/i18n/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false,
    keySeparator: '.',
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    },
    // 忽略 Trans 组件解析错误，专注于 t() 函数
    ignoreBabelExpressions: true
  }
};