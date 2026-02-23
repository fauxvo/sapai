import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      'packages/api/src/generated/**',
      'packages/dashboard/src/routeTree.gen.ts',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Language options for all TS files
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },

  // Disable rules that conflict with Prettier (must be last)
  prettier,
);
