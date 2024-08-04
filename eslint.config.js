import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';

const compat = new FlatCompat();

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'doc/**'],
  },
  ...compat.extends('airbnb-base'),
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-await-in-loop': 'off',
      'no-promise-executor-return': 'off',
      'no-plusplus': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': ['error', 'always', {
        js: 'always',
        jsx: 'always',
      }],
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'no-use-before-define': 'off',
      'no-param-reassign': 'off',
      'global-require': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },
  },
];
