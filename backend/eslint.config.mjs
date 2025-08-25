import js from '@eslint/js'
import globals from "globals";
import stylistic from '@stylistic/eslint-plugin'

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      'eqeqeq': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'no-console': 0,
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
    }
  },
  {
    ignores: ['dist/']
  }
];