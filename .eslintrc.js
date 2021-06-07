module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb-typescript',
    "plugin:prettier/recommended",
    "prettier",
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'prettier'
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    'no-unused-vars': ['error', {'varsIgnorePattern': '^_','argsIgnorePattern': '^_'}],
    "import/prefer-default-export": "off"
  },
  ignorePatterns: ['.eslintrc.js'],
}
