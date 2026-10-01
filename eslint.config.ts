import obsidian from 'eslint-plugin-obsidianmd'
import { defineConfig, globalIgnores } from 'eslint/config'
import kh4f from '@kh4f/eslint-config'
import voicss from 'voicss-eslint'

export default defineConfig([
	globalIgnores(['main.js']),
	{ files: ['src/**/*.ts?(x)'], extends: obsidian.configs.recommended },
	await kh4f({ react: true }),
	{ rules: { '@typescript-eslint/no-dynamic-delete': 'off' } },
	voicss.configs.recommended,
])