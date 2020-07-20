const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'),
);

module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'prettier', 'prettier/babel'],
  plugins: ['prettier'],
  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {
    'arrow-body-style': [2, 'as-needed'],
    'class-methods-use-this': 0,
    'comma-dangle': [2, 'always-multiline'],
    'no-unneeded-ternary': 1,
    'import/imports-first': 0,
    'import/newline-after-import': 0,
    'import/no-dynamic-require': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-named-as-default': 0,
    'import/no-unresolved': [2, {caseSensitive: true}],
    'import/no-webpack-loader-syntax': 0,
    'import/prefer-default-export': 0,
    'max-len': 0,
    'newline-per-chained-call': 0,
    'no-confusing-arrow': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
    'no-unused-vars': 2,
    'no-use-before-define': 0,
    'prefer-template': 2,
    camelcase: ['error', {allow: ['_(get|post|delete|patch|put)']}],
    'require-yield': 0,
    'no-underscore-dangle': 'off',
    'no-unused-expressions': ['error', {allowShortCircuit: true}],
    'consistent-return': 0,
    'prettier/prettier': ['error', prettierOptions],
  },
};
