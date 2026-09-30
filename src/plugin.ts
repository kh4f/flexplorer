import { Plugin } from 'obsidian'
import type { FileExplorerView } from 'obsidian-typings'

import { DndEngine } from '@/core/dnd-engine'
import { ExplorerManager } from '@/core/explorer-manager'
import { OrderManager } from '@/core/order-manager'
import { Patcher } from '@/core/patcher'
import { populateFileMenu } from '@/ui/menu'
import { SettingsTab } from '@/ui/settings'
import { initLog, logger } from '@/utils'
import type { FolderSettings, Settings, SortOrder } from '@/types'

const DEFAULT_SETTINGS: Settings = {
	items: {},
	showHidden: false,
	newItemPlacement: 'top',
	persistOrderOnCreateDelete: true,
	debugMode: !!process.env.DEV,
}

export default class Flexplorer extends Plugin {
	readonly log = initLog('PLUGIN', '#00ccff')
	declare settings: Settings

	readonly dndEngine = new DndEngine(this)
	readonly orderManager = new OrderManager(this)
	readonly explorerManager = new ExplorerManager(this)
	readonly patcher = new Patcher(this)

	async onload() {
		await this.loadSettings()
		this.log('Loaded')
		this.app.workspace.onLayoutReady(() => this.init())
	}

	private init(): void {
		this.addSettingTab(new SettingsTab(this.app, this))
		this.registerVaultEventHandlers()
		this.patcher.patchExplorerSortMenu()
		this.orderManager.syncItems()

		this.explorerManager.observeExplorerMount(el => {
			this.log('Explorer mounted:', el)
			this.patcher.patchExplorerSorting()
			this.sortExplorer()
			this.dndEngine.attach(el)
			this.explorerManager.syncIndicators()

			this.explorerManager.observeExplorerMount(el => {
				this.log('Explorer remounted:', el)
				this.dndEngine.attach(el)
				this.explorerManager.syncIndicators()
			}, { watch: true })
		}, { checkExisting: true })

		this.log('Initialized')
	}

	onunload(): void {
		this.explorerManager.disconnectObservers()
		this.dndEngine.detach()
		this.patcher.unpatch()
		this.sortExplorer()
		document.body.removeClass('fp-show-hidden')
		this.log('Unloaded')
	}

	private registerVaultEventHandlers(): void {
		this.registerEvent(this.app.vault.on('create', item => {
			this.log(`Item created: ${item.path}`)
			this.orderManager.add(item)
		}))
		this.registerEvent(this.app.vault.on('rename', (item, oldPath) => {
			this.log(`Item renamed: ${oldPath} -> ${item.path}`)
			this.orderManager.move(oldPath, item.path)
		}))
		this.registerEvent(this.app.vault.on('delete', item => {
			this.log(`Item deleted: ${item.path}`)
			this.orderManager.remove(item.path)
		}))
		this.registerEvent(this.app.vault.on('modify', item => {
			const parentPath = item.parent!.path
			const folderSettings = this.settings.items[parentPath] as FolderSettings
			if (folderSettings.sortOrder.startsWith('byModifiedTime')) {
				this.log(`File modified in '${item.path}' with modified-time-based sorting, ` +
					`sorting the explorer`)
				this.sortExplorer()
			}
		}))
		this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
			this.log(`File menu opened for '${file.path}'`)
			if (file.path === '/') return this.log('Root folder menu, skipping')

			populateFileMenu(menu, file, this)
		}))
	}

	private async loadSettings(): Promise<void> {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData() as Partial<Settings>) }
		this.migrateSettingsV4ToV5()
		this.log('Settings loaded:', this.settings)

		this.syncRuntimeSettings()
	}

	private migrateSettingsV4ToV5(): void {
		const sortOrderMap: Record<string, SortOrder> = {
			byName: 'byNameAsc',
			byNameReverse: 'byNameDesc',
			byCreatedTime: 'byCreatedTimeAsc',
			byCreatedTimeReverse: 'byCreatedTimeDesc',
			byModifiedTime: 'byModifiedTimeAsc',
			byModifiedTimeReverse: 'byModifiedTimeDesc',
			custom: 'custom',
		}

		delete (this.settings as { pinnedFiles?: unknown }).pinnedFiles

		for (const itemSettings of Object.values(this.settings.items)) {
			if (!('sortOrder' in itemSettings)) continue
			const folderSettings = itemSettings
			folderSettings.sortOrder = sortOrderMap[folderSettings.sortOrder]
		}

		this.log('Migrated settings from v4 to v5')
	}

	private syncRuntimeSettings(): void {
		logger.level = this.settings.debugMode ? 'debug' : 'silent'
		document.body.toggleClass('fp-show-hidden', this.settings.showHidden)
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings)
		this.log('Settings updated:', this.settings)
	}

	async onExternalSettingsChange(): Promise<void> {
		this.log('Settings changed externally, reloading')
		await this.loadSettings()
		this.sortExplorer()
		this.explorerManager.syncIndicators()
	}

	getExplorerView(): FileExplorerView {
		return this.app.workspace.getLeavesOfType('file-explorer')[0].view as FileExplorerView
	}

	sortExplorer(): void {
		this.getExplorerView().sort()
	}
}