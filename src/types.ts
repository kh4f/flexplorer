export interface Settings {
	items: Record<string, ItemSettings>
	showHidden: boolean
	hidePatterns: string[]
	newItemPlacement: 'top' | 'bottom'
	copyPlacement: 'above' | 'below'
	persistOrderOnCreateDelete: boolean
	foldersFirst: boolean
	storeItemTimestamps: boolean
	debugMode: boolean
}

export type ItemSettings = BaseItemSettings | FolderSettings
export interface BaseItemSettings {
	isPinned: boolean
	isHidden: boolean
	// plugin-tracked timestamps, stable across devices unlike the OS file stats
	ctime?: number
	mtime?: number
}
export interface FolderSettings extends BaseItemSettings {
	customOrder: string[]
	sortOrder: SortOrder
}

export type SortOrder =
	| 'custom'
	| 'byNameAsc'
	| 'byNameDesc'
	| 'byCreatedTimeAsc'
	| 'byCreatedTimeDesc'
	| 'byModifiedTimeAsc'
	| 'byModifiedTimeDesc'

/** sort orders that read the plugin-tracked `ctime`/`mtime` values */
export const TIMESTAMP_SORT_ORDERS: readonly SortOrder[] = [
	'byCreatedTimeAsc',
	'byCreatedTimeDesc',
	'byModifiedTimeAsc',
	'byModifiedTimeDesc',
]