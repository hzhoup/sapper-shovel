module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ['eslint-config-standard', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'esnext',
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  plugins: ['@typescript-eslint'],
  rules: {}
}
