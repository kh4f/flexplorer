import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from '@eslint-react/eslint-plugin'
import hooks from 'eslint-plugin-react-hooks'
import stylistic from '@stylistic/eslint-plugin'
import voicss from 'voicss-eslint'
import obsidian from 'eslint-plugin-obsidianmd'

export default defineConfig([
	{
		name: 'Base Rules',
		files: ['**/*.ts?(x)'],
		extends: [js.configs.recommended],
	},
	{
		name: 'Obsidian Rules',
		files: ['src/**/*.ts?(x)'],
		extends: [obsidian.configs.recommended],
	},
	{
		name: 'Type-Aware Rules',
		files: ['**/*.ts?(x)'],
		extends: [ts.configs.strictTypeChecked, ts.configs.stylisticTypeChecked],
		languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
		rules: {
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-dynamic-delete': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		name: 'React Rules',
		files: ['**/*.ts?(x)'],
		extends: [react.configs['recommended-type-checked'], hooks.configs.flat.recommended],
	},
	{
		name: 'Stylistic Rules',
		files: ['**/*.ts?(x)'],
		extends: [stylistic.configs.recommended, voicss.configs.recommended],
		rules: {
			'@stylistic/no-tabs': 'off',
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/indent-binary-ops': ['error', 'tab'],
			'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
			'@stylistic/arrow-parens': ['error', 'as-needed'],
			'@stylistic/eol-last': ['error', 'never'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/jsx-one-expression-per-line': 'off',
			'@stylistic/jsx-tag-spacing': ['error', { beforeClosing: 'never', beforeSelfClosing: 'never' }],
			'@stylistic/jsx-wrap-multilines': 'off',
			'@stylistic/jsx-closing-tag-location': 'off',
			'@stylistic/jsx-closing-bracket-location': 'off',
			'@stylistic/jsx-quotes': ['error', 'prefer-single'],
			'@stylistic/operator-linebreak': 'off',
			'@stylistic/jsx-first-prop-new-line': 'off',
		},
	},
])