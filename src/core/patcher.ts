import { Menu } from 'obsidian'
import type { FileExplorerView } from 'obsidian-typings'

import { populateSortMenu } from '@/ui/menu'
import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'
import type { FolderSettings } from '@/types'

export class Patcher {
	private readonly log = initLog('PATCHER', '#988bff')

	private unpatchExplorerSorting: (() => void) | null = null
	private unpatchExplorerSortMenu: (() => void) | null = null

	constructor(private readonly plugin: Flexplorer) {}

	patchExplorerSorting(): void {
		const plugin = this.plugin

		const explorerProto = Object.getPrototypeOf(plugin.getExplorerView()) as FileExplorerView
		const origGetSortedFolderItems = explorerProto.getSortedFolderItems

		explorerProto.getSortedFolderItems = function (folder) {
			const origSorted = origGetSortedFolderItems.call(this, folder)
			const folderSettings = plugin.settings.items[folder.path] as FolderSettings
			return plugin.orderManager.getSortedItems(folderSettings, origSorted)
		}

		this.unpatchExplorerSorting = () => explorerProto.getSortedFolderItems = origGetSortedFolderItems
		this.log('Explorer patched')
	}

	patchExplorerSortMenu(): void {
		const patcher = this
		const plugin = this.plugin

		const origShowAtMouseEvent = Menu.prototype.showAtMouseEvent

		Menu.prototype.showAtMouseEvent = function (evt) {
			const button = evt.target as HTMLElement
			const changeSortAriaLabel = i18next.t('plugins.file-explorer.action-change-sort')
			const isChangeSortButton = button.getAttribute('aria-label') === changeSortAriaLabel
			const isFileExplorerActionButton = button.classList.contains('nav-action-button')
			if (!isChangeSortButton || !isFileExplorerActionButton)
				return origShowAtMouseEvent.call(this, evt)

			const folderSettings = plugin.settings.items['/'] as FolderSettings
			const customMenu = populateSortMenu(new Menu(), folderSettings.sortOrder, plugin, '/', folderSettings)
				.addItem(item => item.setTitle('Show hidden')
					.setChecked(plugin.settings.showHidden)
					.onClick(() => {
						plugin.settings.showHidden = !plugin.settings.showHidden
						void plugin.saveSettings()
						document.body.toggleClass('fp-show-hidden', plugin.settings.showHidden)
					}),
				)

			patcher.log(`Custom sort menu opened`)
			return origShowAtMouseEvent.call(customMenu, evt)
		}

		this.unpatchExplorerSortMenu = () => Menu.prototype.showAtMouseEvent = origShowAtMouseEvent
		this.log('Explorer sort menu patched')
	}

	unpatch(): void {
		this.unpatchExplorerSorting?.()
		this.unpatchExplorerSortMenu?.()
		this.log('Patches removed')
	}
}