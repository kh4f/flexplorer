import { defineConfig, globalIgnores } from 'eslint/config'
import obsidian from 'eslint-plugin-obsidianmd'
import kh4f from '@kh4f/eslint-config'
import voicss from 'voicss-eslint'

export default defineConfig([
	globalIgnores(['main.js']),
	{
		files: ['src/**/*.ts?(x)'],
		extends: obsidian.configs.recommended,
	},
	await kh4f({ react: true }),
	{
		rules: {
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-dynamic-delete': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	voicss.configs.recommended,
])