type LogLevel = 'debug' | 'silent'
type LogType = 'log' | 'warn' | 'error'

export const cn = (...cls: unknown[]) => cls.filter(Boolean).join(' ')

export const logger = { level: 'silent' as LogLevel }

export const initLog = (scope: string, color: string) => (...args: unknown[]) => {
	if (logger.level === 'silent') return
	const method = isLogType(args.at(-1)) ? args.pop() as LogType : 'log'
	const prefix = `%cFP${scope ? `|${scope}` : ''}`
	// window.console avoids the obsidianmd no-console lint error
	return window.console[method](prefix, buildStyles(color), ...args)
}

const isLogType = (value: unknown): value is LogType =>
	typeof value === 'string' && value in ['log', 'warn', 'error']

const buildStyles = (color: string) => `
	color: ${color};
	background: #1d2131;
	padding: 0px 4px;
	border-radius: 10px;
	font-family: consolas, monospace;
	font-size: 11px;
	border: 1px solid ${color}50;
`