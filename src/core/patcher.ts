import { Menu, Vault } from 'obsidian'
import type { FileExplorerView } from 'obsidian-typings'

import { populateSortMenu } from '@/ui/menu'
import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'
import type { FolderSettings } from '@/types'

export class Patcher {
	private readonly log = initLog('PATCHER', '#988bff')

	private unpatchExplorerSorting: (() => void) | null = null
	private unpatchExplorerSortMenu: (() => void) | null = null
	private unpatchVaultCopy: (() => void) | null = null

	constructor(private readonly plugin: Flexplorer) {}

	patchVaultCopy(): void {
		const plugin = this.plugin
		const log = this.log

		const vaultProto = Vault.prototype as { copy: Vault['copy'] }
		const origCopy = vaultProto.copy

		vaultProto.copy = async function (file, newPath) {
			log(`Item copied: '${file.path}' -> '${newPath}'`)
			plugin.orderManager.stageCopyState(file.path, newPath)
			const copy = await origCopy.call(this, file, newPath)
			// the copy's DOM items exist only after all its `create` events are processed
			plugin.explorerManager.syncIndicators()
			return copy
		}

		this.unpatchVaultCopy = () => vaultProto.copy = origCopy
		this.log('Vault copy patched')
	}

	patchExplorerSorting(): void {
		const plugin = this.plugin

		const explorerProto = Object.getPrototypeOf(plugin.getExplorerView()) as FileExplorerView
		// eslint-disable-next-line @typescript-eslint/unbound-method -- intentional prototype patching
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
		const plugin = this.plugin
		const log = this.log

		// eslint-disable-next-line @typescript-eslint/unbound-method -- intentional prototype patching
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

			log(`Custom sort menu opened`)
			return origShowAtMouseEvent.call(customMenu, evt)
		}

		this.unpatchExplorerSortMenu = () => Menu.prototype.showAtMouseEvent = origShowAtMouseEvent
		this.log('Explorer sort menu patched')
	}

	unpatch(): void {
		this.unpatchExplorerSorting?.()
		this.unpatchExplorerSortMenu?.()
		this.unpatchVaultCopy?.()
		this.log('Patches removed')
	}
}