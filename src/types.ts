export interface Settings {
	items: Record<string, ItemSettings>
	showHidden: boolean
	newItemPlacement: 'top' | 'bottom'
	persistOrderOnCreateDelete: boolean
	debugMode: boolean
}

export type ItemSettings = BaseItemSettings | FolderSettings
export interface BaseItemSettings {
	isPinned: boolean
	isHidden: boolean
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