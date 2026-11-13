import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'

export class HideManager {
	private readonly log = initLog('HIDE MANAGER', '#3ddc84')
	private regexes: RegExp[] = []

	constructor(private readonly plugin: Flexplorer) {}

	// recompiles the patterns from settings; must be called whenever `hidePatterns` changes
	syncRegexes(): void {
		this.regexes = this.plugin.settings.hidePatterns
			.map(pattern => pattern.trim())
			.filter(Boolean)
			.map(glob => this.globToRegex(glob))
	}

	isHidden(path: string): boolean {
		return this.regexes.some(regex => regex.test(path))
	}

	// converts a gitignore-style glob into a regex matched against the full vault path
	private globToRegex(glob: string): RegExp {
		// a leading `/` anchors the pattern to the vault root
		const isRootAnchored = glob.startsWith('/')
		if (isRootAnchored) glob = glob.slice(1)

		let source = ''
		for (let i = 0; i < glob.length; i++) {
			const char = glob[i]
			if (char === '*') {
				if (glob[i + 1] === '*') {
					i++
					if (i === glob.length - 1) {
						// absorb a preceding `/` so `templates/**` matches the folder itself too
						if (source.endsWith('/')) source = source.slice(0, -1)
						source += '(?:|/.*)'
					} else if (glob[i + 1] === '/') {
						// `**/` matches zero or more whole path segments
						source += '(?:[^/]*/)*'
						i++
					} else {
						// `**` between segments matches zero or more whole segments
						source += '(?:[^/]*/)*'
					}
				} else {
					// `*` matches any characters except `/`
					source += '[^/]*'
				}
			} else if (char === '?') {
				source += '[^/]'
			} else if ('\\^$.|+()[]{}'.includes(char)) {
				source += `\\${char}`
			} else {
				source += char
			}
		}

		// gitignore semantics: a pattern containing `/` matches from the root, a pattern without
		// `/` matches the item name at any depth
		const containsSlash = glob.includes('/')
		return new RegExp(`^${isRootAnchored || containsSlash ? '' : '(?:[^/]*/)*'}${source}$`)
	}
}