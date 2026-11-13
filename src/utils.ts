export const cn = (...cls: unknown[]) => cls.filter(Boolean).join(' ')

export const logger = { level: 'silent' as 'silent' | 'debug' }

export const initLog = (scope: string, color: string) => (...args: unknown[]) => {
	if (logger.level === 'silent') return
	// `window.` avoids the obsidianmd 'no-console' lint error
	return window.console.log(`%c${scope}`, buildStyles(color), ...args)
}

const buildStyles = (color: string) => `
	color: ${color};
	background: #1d2131;
	border: 1px solid ${color};
	border-radius: 10px;
	font-family: consolas, monospace;
	font-size: 10px;
	padding: 0px 4px;
`