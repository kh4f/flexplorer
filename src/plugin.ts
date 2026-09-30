import { Plugin, TFolder } from 'obsidian'
import type { FileExplorerView } from 'obsidian-typings'

import { DndEngine } from '@/core/dnd-engine'
import { ExplorerManager } from '@/core/explorer-manager'
import { OrderManager } from '@/core/order-manager'
import { Patcher } from '@/core/patcher'
import { populateSortMenu } from '@/ui/menu'
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
	private readonly log = initLog('', '#00ccff')

	declare settings: Settings
	readonly dndEngine = new DndEngine(this)
	readonly orderManager = new OrderManager(this)
	readonly explorerManager = new ExplorerManager(this)
	readonly patcher = new Patcher(this)

	async onload() {
		await this.loadSettings()
		this.syncRuntimeSettings()
		this.log('Plugin loaded')
		this.app.workspace.onLayoutReady(() => this.init())
	}

	onunload() {
		this.explorerManager.disconnectObservers()
		this.dndEngine.detach()
		this.patcher.unpatch()
		this.sortExplorer()
		activeDocument.body.removeClass('fp-show-hidden')
		this.log('Plugin unloaded')
	}

	async saveSettings() {
		await this.saveData(this.settings)
		this.log('Settings updated:', this.settings)
	}

	async onExternalSettingsChange() {
		this.log('Settings changed externally')
		await this.loadSettings()
		this.syncRuntimeSettings()
		this.sortExplorer()
		this.explorerManager.syncIndicators()
	}

	getExplorerView() {
		return this.app.workspace.getLeavesOfType('file-explorer')[0].view as FileExplorerView
	}

	sortExplorer() {
		this.getExplorerView().sort()
	}

	private init() {
		this.addSettingTab(new SettingsTab(this.app, this))
		this.registerVaultEventHandlers()
		this.patcher.patchMenu()
		this.orderManager.syncItems()
		this.syncShowHiddenClass()

		this.explorerManager.observeExplorerMount(this.onExplorerMount, { checkExisting: true })
		this.explorerManager.observeExplorerMount(this.onExplorerRemount, { watch: true })

		this.log('Plugin initialized')
	}

	private readonly onExplorerMount = (el: HTMLElement) => {
		this.log('Explorer mounted, initializing features:', el)
		this.patcher.patchExplorer()
		this.sortExplorer()
		this.explorerManager.syncIndicators()
		this.dndEngine.attach(el)
	}

	private readonly onExplorerRemount = (el: HTMLElement) => {
		this.log('Explorer remounted, re-attaching DnD engine:', el)
		this.dndEngine.attach(el)
	}

	private registerVaultEventHandlers() {
		this.registerEvent(this.app.vault.on('create', item => {
			this.log(`Item created: ${item.path}`)
			this.orderManager.add(item)
		}))
		this.registerEvent(this.app.vault.on('rename', (item, oldPath) => {
			this.log(`Item renamed from ${oldPath} to ${item.path}`)
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
				this.log(`File modified in '${item.path}' with modified-time-based sorting, sorting explorer`)
				this.sortExplorer()
			}
		}))
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				this.log(`File menu opened for '${file.path}'`)
				if (file.path === '/') return this.log('Root folder menu, skipping')

				const fileSettings = this.settings.items[file.path]

				if (file instanceof TFolder) {
					const folderSettings = fileSettings as FolderSettings
					const currentOrder = folderSettings.sortOrder

					menu.addItem(item => {
						item.setTitle('Sort order').setIcon('sort-asc')
						const submenu = item.setSubmenu().setNoIcon()
						populateSortMenu(submenu, currentOrder, this, file.path, folderSettings)
					})
				}

				menu.addItem(item => item
					.setTitle(fileSettings.isPinned ? 'Unpin' : 'Pin')
					.setIcon(fileSettings.isPinned ? 'pin-off' : 'pin')
					.onClick(() => {
						fileSettings.isPinned = !fileSettings.isPinned
						void this.saveSettings()
						this.sortExplorer()
						this.explorerManager.syncIndicators()
					}))
					.addItem(item => item
						.setTitle(fileSettings.isHidden ? 'Unhide' : 'Hide')
						.setIcon(fileSettings.isHidden ? 'eye' : 'eye-off')
						.onClick(() => {
							fileSettings.isHidden = !fileSettings.isHidden
							void this.saveSettings()
							this.explorerManager.syncIndicators()
						}))
			}),
		)
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

	private async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData() as Partial<Settings>) }
		this.migrateSettingsV4ToV5()
		this.log('Settings loaded:', this.settings)
	}

	private syncRuntimeSettings() {
		logger.level = this.settings.debugMode ? 'debug' : 'silent'
		this.syncShowHiddenClass()
	}

	private syncShowHiddenClass() {
		activeDocument.body.toggleClass('fp-show-hidden', this.settings.showHidden)
	}
}