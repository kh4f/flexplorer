import { defineConfig } from 'tsdown'
import voicss from 'voicss/vite'

const dirUrl = new URL('.', import.meta.url).href

export default defineConfig(({ watch }) => {
	const isDev = Boolean(watch)

	return {
		entry: 'src/plugin.ts',
		css: { fileName: 'styles.css' },
		format: 'cjs',
		outDir: '.',
		clean: false,
		minify: !isDev,
		sourcemap: isDev,
		outputOptions: {
			entryFileNames: 'main.js',
			sourcemapBaseUrl: dirUrl,
			sourcemapPathTransform: relSourcePath => `${dirUrl}/${relSourcePath}`,
		},
		define: { 'process.env.NODE_ENV': isDev ? '"development"' : '"production"' },
		env: { DEV: isDev },
		deps: { neverBundle: 'obsidian', onlyBundle: ['react', 'react-dom', 'scheduler'] },
		plugins: [voicss()],
	}
})