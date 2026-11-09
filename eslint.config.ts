import obsidian from 'eslint-plugin-obsidianmd'
import { defineConfig, globalIgnores } from 'eslint/config'
import kh4f from '@kh4f/eslint-config'
import voicss from 'voicss-eslint'

export default defineConfig([
	globalIgnores(['main.js']),
	{ files: ['src/**/*.ts?(x)'], extends: obsidian.configs.recommended },
	await kh4f({ react: true }),
	voicss.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-dynamic-delete': 'off',
			// the plugin only targets the file explorer, which always lives in the main window's sidebar,
			// so the global `document` is intentional and `activeDocument` (which may point to a popout) is wrong here
			'obsidianmd/prefer-active-doc': 'off',
		},
	},
])
