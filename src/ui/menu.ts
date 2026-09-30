import { Menu } from 'obsidian'

import { ConfirmModal } from '@/ui/modal'
import type Flexplorer from '@/plugin'
import type { FolderSettings, SortOrder } from '@/types'

const SORT_OPTIONS: [string, SortOrder][] = [
	['Custom order', 'custom'],
	['File name (A → Z)', 'byNameAsc'],
	['File name (Z → A)', 'byNameDesc'],
	['Created time (new → old)', 'byCreatedTimeDesc'],
	['Created time (old → new)', 'byCreatedTimeAsc'],
	['Modified time (new → old)', 'byModifiedTimeDesc'],
	['Modified time (old → new)', 'byModifiedTimeAsc'],
]

export const populateSortMenu = (
	menu: Menu,
	currentSortOrder: SortOrder,
	plugin: Flexplorer,
	folderPath: string,
	folderSettings: FolderSettings,
): Menu => {
	SORT_OPTIONS.forEach(([title, sortOrder]) => {
		menu.addItem(item => item.setTitle(title)
			.setChecked(currentSortOrder === sortOrder)
			.onClick(() => {
				folderSettings.sortOrder = sortOrder
				void plugin.saveSettings()
				plugin.sortExplorer()
			}))
	})
	return menu.setNoIcon().addSeparator()
		.addItem(item => item.setTitle('Save as custom order')
			.onClick(() => {
				new ConfirmModal(plugin.app, isConfirmed => {
					if (folderSettings.sortOrder === 'custom' || !isConfirmed) return
					const folder = plugin.app.vault.getFolderByPath(folderPath)!
					const items = plugin.getExplorerView().getSortedFolderItems(folder)
					const sortedItems = plugin.orderManager.getSortedItems(folderSettings, items, folderSettings.sortOrder)
					folderSettings.customOrder = sortedItems.map(item => item.file.name)
					folderSettings.sortOrder = 'custom'
					void plugin.saveSettings()
					plugin.sortExplorer()
				}).open()
			}))
}