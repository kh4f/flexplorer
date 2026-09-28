import { TAbstractFile, TFile, TFolder } from 'obsidian'
import type { FileTreeItem } from 'obsidian-typings'

import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'
import type { BaseItemSettings, FolderSettings, SortOrder } from '@/types'

const DEFAULT_ITEM_SETTINGS: BaseItemSettings = { isPinned: false, isHidden: false }
const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

export class OrderManager {
	private readonly log = initLog('ORDER-MANAGER', '#ff5000')

	constructor(private readonly plugin: Flexplorer) {}

	syncItems(root = this.plugin.app.vault.root) {
		this.log(`Syncing items with vault in root '${root.path}'`)
		this.cleanUpInvalidPaths()
		this.sync(root)
		this.persistAndLog('Items synced:')
	}

	add(item: TAbstractFile) {
		const insertPos = this.plugin.settings.newItemPlacement
		this.log(`Adding new item '${item.path}' at '${insertPos}'`)

		const items = this.plugin.settings.items
		const isFolder = item instanceof TFolder
		const parentItem = items[item.parent!.path] as FolderSettings

		items[item.path] = {
			...DEFAULT_ITEM_SETTINGS,
			...(isFolder ? { customOrder: [], sortOrder: 'custom' } : {}),
		}

		if (insertPos === 'top') parentItem.customOrder.unshift(item.name)
		else parentItem.customOrder.push(item.name)

		this.persistCreateDeleteChange('Order updated after item creation:')
	}

	move(from: string, to: string, siblingPath?: string, pos?: 'before' | 'after') {
		this.log(`Moving '${from}' to '${to}' ${pos} '${siblingPath}'`)
		if (from === to && siblingPath === to) return this.log('No move needed')

		const items = this.plugin.settings.items
		const fromName = this.getName(from)
		const toName = this.getName(to)
		const fromParentPath = this.getParentPath(from)
		const toParentPath = this.getParentPath(to)
		const fromParent = items[fromParentPath] as FolderSettings | undefined
		const toParent = items[toParentPath] as FolderSettings | undefined
		const parentChanged = fromParentPath !== toParentPath

		if (!(from in items)) return this.log('Source item not found in settings')
		if (from !== to) {
			items[to] = items[from]
			delete items[from]
			this.plugin.settings.pinnedFiles = this.plugin.settings.pinnedFiles.map(p => p === from ? to : p)
		}

		if (fromParent && toParent) {
			const fromIndex = fromParent.customOrder.indexOf(fromName)

			let insertIndex = 0
			if (siblingPath) {
				const siblingIndex = toParent.customOrder.indexOf(this.getName(siblingPath))
				insertIndex = pos === 'before' ? siblingIndex : siblingIndex + 1
			} else if (!parentChanged) {
				insertIndex = fromIndex
			}
			fromParent.customOrder = fromParent.customOrder.filter(p => {
				if (p === fromName) {
					if (!parentChanged && fromIndex < insertIndex) insertIndex--
					return false
				}
				return true
			})
			if (!toParent.customOrder.includes(toName)) toParent.customOrder.splice(insertIndex, 0, toName)
		}

		this.persistAndLog('Order updated:')

		if (!parentChanged) {
			this.log('Directory did not change, sorting explorer')
			this.plugin.sortExplorer()
		}
	}

	remove(path: string) {
		this.log(`Removing '${path}'`)

		const items = this.plugin.settings.items
		const name = this.getName(path)
		const parentItem = items[this.getParentPath(path)] as FolderSettings

		delete items[path]

		parentItem.customOrder = parentItem.customOrder.filter(p => p !== name)

		this.persistCreateDeleteChange('Order updated after item deletion:')
	}

	private sync(folder: TFolder) {
		const folderPath = folder.path
		const oldSettings = this.plugin.settings.items[folderPath] as FolderSettings | undefined
		const newChildren = folder.children.map(c => c.name)

		const oldChildren = oldSettings?.customOrder ?? []
		let mergedChildren = oldChildren.filter(p => newChildren.includes(p))
		const addedChildren = newChildren.filter(p => !oldChildren.includes(p))
		mergedChildren = this.plugin.settings.newItemPlacement === 'top'
			? [...addedChildren, ...mergedChildren]
			: [...mergedChildren, ...addedChildren]

		this.plugin.settings.items[folderPath] = {
			...DEFAULT_ITEM_SETTINGS,
			sortOrder: 'custom',
			...oldSettings,
			customOrder: mergedChildren,
		}

		for (const child of folder.children) {
			if (child instanceof TFolder) {
				this.sync(child)
				continue
			}

			if (child instanceof TFile) {
				const prevSettings = this.plugin.settings.items[child.path] as BaseItemSettings | undefined
				this.plugin.settings.items[child.path] = { ...DEFAULT_ITEM_SETTINGS, ...prevSettings }
			}
		}
	}

	private cleanUpInvalidPaths() {
		for (const path of Object.keys(this.plugin.settings.items)) {
			if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
				delete this.plugin.settings.items[path]
			}
		}
		for (const path of this.plugin.settings.pinnedFiles) {
			if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
				this.plugin.settings.pinnedFiles.remove(path)
			}
		}
		this.plugin.settings.pinnedFiles = this.plugin.settings.pinnedFiles.unique()
	}

	getSortedItems(
		folderSettings: FolderSettings,
		items: FileTreeItem[],
		sortOrder: SortOrder = folderSettings.sortOrder,
	): FileTreeItem[] {
		return items.slice().sort((aItem, bItem) => {
			const [a, b] = [aItem.file, bItem.file]
			const isAPinned = this.plugin.settings.items[a.path].isPinned
			const isBPinned = this.plugin.settings.items[b.path].isPinned
			if (isAPinned !== isBPinned) return isAPinned ? -1 : 1

			if (sortOrder !== 'custom') {
				const isAFolder = a instanceof TFolder
				const isBFolder = b instanceof TFolder
				if (isAFolder !== isBFolder) return isAFolder ? -1 : 1
			}

			switch (sortOrder) {
				case 'custom': {
					const aIndex = folderSettings.customOrder.indexOf(a.name)
					const bIndex = folderSettings.customOrder.indexOf(b.name)
					if (aIndex === -1 || bIndex === -1) return this.compareByName(a, b)
					return aIndex - bIndex
				}
				case 'byNameReverse': return this.compareByName(b, a)
				case 'byCreatedTime': return this.compareByTimestamp(a, b, 'ctime', 'asc')
				case 'byCreatedTimeReverse': return this.compareByTimestamp(a, b, 'ctime', 'desc')
				case 'byModifiedTime': return this.compareByTimestamp(a, b, 'mtime', 'asc')
				case 'byModifiedTimeReverse': return this.compareByTimestamp(a, b, 'mtime', 'desc')
				case 'byName':
				default: return this.compareByName(a, b)
			}
		})
	}

	private compareByName(a: TAbstractFile, b: TAbstractFile) {
		return collator.compare(a.name, b.name)
	}

	private compareByTimestamp(a: TAbstractFile, b: TAbstractFile, type: 'ctime' | 'mtime', direction: 'asc' | 'desc') {
		const aTimestamp = a instanceof TFile ? a.stat[type] : -Infinity
		const bTimestamp = b instanceof TFile ? b.stat[type] : -Infinity
		return direction === 'asc' ? aTimestamp - bTimestamp : bTimestamp - aTimestamp
	}

	private persistAndLog(message: string) {
		void this.plugin.saveSettings()
		this.log(message, structuredClone(this.plugin.settings.items))
	}

	private persistCreateDeleteChange(message: string) {
		if (!this.plugin.settings.persistOrderOnCreateDelete) {
			this.log(message, structuredClone(this.plugin.settings.items))
			return this.log('Skipping data.json update')
		}

		this.persistAndLog(message)
	}

	private getName(path: string) {
		return path.substring(path.lastIndexOf('/') + 1)
	}

	private getParentPath(path: string) {
		return path.substring(0, path.lastIndexOf('/')) || '/'
	}
}