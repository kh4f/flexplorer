import { dirname } from 'node:path'
import { defineConfig } from 'tsdown'
import voicss from 'voicss/vite'

const prod = process.argv.includes('-p')
const dir = dirname(import.meta.url)

export default defineConfig({
	entry: 'src/plugin.ts',
	css: { fileName: 'styles.css' },
	format: 'cjs',
	outDir: '.',
	clean: false,
	fixedExtension: true,
	minify: prod,
	sourcemap: !prod,
	outputOptions: {
		entryFileNames: 'main.js',
		sourcemapBaseUrl: dir,
		sourcemapPathTransform: relSourcePath => `${dir}/${relSourcePath}`,
	},
	define: { 'process.env.NODE_ENV': prod ? '"production"' : '"development"' },
	env: { DEV: !prod },
	deps: { neverBundle: 'obsidian', onlyBundle: ['react', 'react-dom', 'scheduler'] },
	plugins: [voicss()],
})