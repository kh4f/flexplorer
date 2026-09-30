export type NewItemPlacement = 'top' | 'bottom'

export type SortOrder =
	| 'custom'
	| 'byNameAsc'
	| 'byNameDesc'
	| 'byCreatedTimeAsc'
	| 'byCreatedTimeDesc'
	| 'byModifiedTimeAsc'
	| 'byModifiedTimeDesc'

export interface Settings {
	items: Record<string, ItemSettings>
	showHidden: boolean
	newItemPlacement: NewItemPlacement
	persistOrderOnCreateDelete: boolean
	debugMode: boolean
}

export interface BaseItemSettings {
	isPinned: boolean
	isHidden: boolean
}

export interface FolderSettings extends BaseItemSettings {
	customOrder: string[]
	sortOrder: SortOrder
}

export type ItemSettings = BaseItemSettings | FolderSettings