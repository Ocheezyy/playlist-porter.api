import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from "@stylistic/eslint-plugin-ts";

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    plugins: {
      "@stylistic/ts": stylistic,
    },
    rules: {
      "@stylistic/ts/semi": ["error", "always"],
      "@stylistic/ts/object-curly-spacing": ["error", "always"],
      "@stylistic/ts/quotes": ["error", "double"]
    },
  },
)
