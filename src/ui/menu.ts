import { Menu, TAbstractFile, TFolder } from 'obsidian'

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

export function populateFileMenu(menu: Menu, file: TAbstractFile, plugin: Flexplorer): void {
	const fileSettings = plugin.settings.items[file.path]

	if (file instanceof TFolder) {
		const folderSettings = fileSettings as FolderSettings
		menu.addItem(item => {
			item.setTitle('Sort order').setIcon('sort-asc')
			const submenu = item.setSubmenu().setNoIcon()
			populateSortMenu(submenu, folderSettings.sortOrder, plugin, file.path, folderSettings)
		})
	}

	menu.addItem(item => item
		.setTitle(fileSettings.isPinned ? 'Unpin' : 'Pin')
		.setIcon(fileSettings.isPinned ? 'pin-off' : 'pin')
		.onClick(() => {
			fileSettings.isPinned = !fileSettings.isPinned
			plugin.log(`Toggling pinned state for '${file.path}' to ${fileSettings.isPinned}`)
			void plugin.saveSettings()
			plugin.sortExplorer()
			plugin.explorerManager.syncIndicators()
		}),
	).addItem(item => item
		.setTitle(fileSettings.isHidden ? 'Unhide' : 'Hide')
		.setIcon(fileSettings.isHidden ? 'eye' : 'eye-off')
		.onClick(() => {
			fileSettings.isHidden = !fileSettings.isHidden
			plugin.log(`Toggling hidden state for '${file.path}' to ${fileSettings.isHidden}`)
			void plugin.saveSettings()
			plugin.explorerManager.syncIndicators()
		}),
	)
}

export function populateSortMenu(
	menu: Menu,
	currentSortOrder: SortOrder,
	plugin: Flexplorer,
	folderPath: string,
	folderSettings: FolderSettings,
): Menu {
	SORT_OPTIONS.forEach(([title, sortOrder]) => {
		menu.addItem(item => item
			.setTitle(title)
			.setChecked(currentSortOrder === sortOrder)
			.onClick(() => {
				folderSettings.sortOrder = sortOrder
				void plugin.saveSettings()
				plugin.sortExplorer()
			}),
		)
	})

	return menu
		.setNoIcon()
		.addSeparator()
		.addItem(item => item.setTitle('Save as custom order')
			.onClick(() => {
				new ConfirmModal(plugin.app, isConfirmed => {
					if (folderSettings.sortOrder === 'custom' || !isConfirmed) return

					const folder = plugin.app.vault.getFolderByPath(folderPath)!
					const items = plugin.getExplorerView().getSortedFolderItems(folder)
					const sortedItems = plugin.orderManager.getSortedItems(folderSettings, items)

					folderSettings.customOrder = sortedItems.map(item => item.file.name)
					folderSettings.sortOrder = 'custom'
					void plugin.saveSettings()
					plugin.sortExplorer()
				}).open()
			}),
		)
}