import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-unused-vars': 'off',
            'no-undef': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },

    },
    {
        ignores: ['dist', '.eslintrc.cjs', 'node_modules', '*.cjs', 'debug_*.cjs', 'verify_*.cjs', 'take_screenshot.cjs'],
    },
];

