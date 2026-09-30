import { TAbstractFile, TFile, TFolder } from 'obsidian'
import type { FileTreeItem } from 'obsidian-typings'

import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'
import type { BaseItemSettings, FolderSettings } from '@/types'

const DEFAULT_ITEM_SETTINGS: BaseItemSettings = { isPinned: false, isHidden: false }
const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

export class OrderManager {
	private readonly log = initLog('ORDER MANAGER', '#ff5000')

	constructor(private readonly plugin: Flexplorer) {}

	syncItems(): void {
		this.log(`Syncing tracked items with vault`)
		this.cleanUpInvalidPaths()
		this.sync(this.plugin.app.vault.root)
		void this.plugin.saveSettings()
	}

	add(item: TAbstractFile): void {
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

		this.persistCreateDeleteChange()
	}

	move(oldPath: string, newPath: string, siblingPath?: string, insertSide?: 'before' | 'after'): void {
		this.log(`Moving '${oldPath}' to '${newPath}' ${insertSide} '${siblingPath}'`)
		if (oldPath === newPath && siblingPath === newPath) return this.log('No move needed')

		const items = this.plugin.settings.items
		const fromName = this.getName(oldPath)
		const toName = this.getName(newPath)
		const fromParentPath = this.getParentPath(oldPath)
		const toParentPath = this.getParentPath(newPath)
		const fromParent = items[fromParentPath] as FolderSettings | undefined
		const toParent = items[toParentPath] as FolderSettings | undefined
		const parentChanged = fromParentPath !== toParentPath

		if (!(oldPath in items)) return this.log('No settings entry for the source item, skipping the move')

		if (oldPath !== newPath) {
			items[newPath] = items[oldPath]
			delete items[oldPath]
		}

		if (fromParent && toParent) {
			const fromIndex = fromParent.customOrder.indexOf(fromName)

			let insertIndex = 0
			if (siblingPath) {
				const siblingIndex = toParent.customOrder.indexOf(this.getName(siblingPath))
				insertIndex = insertSide === 'before' ? siblingIndex : siblingIndex + 1
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

		void this.plugin.saveSettings()

		if (!parentChanged) {
			this.log('Directory did not change, sorting explorer')
			this.plugin.sortExplorer()
		}
	}

	remove(path: string): void {
		this.log(`Removing item '${path}'`)

		const items = this.plugin.settings.items
		const name = this.getName(path)
		const parentItem = items[this.getParentPath(path)] as FolderSettings

		delete items[path]
		parentItem.customOrder = parentItem.customOrder.filter(p => p !== name)

		this.persistCreateDeleteChange()
	}

	getSortedItems(folderSettings: FolderSettings, items: FileTreeItem[]): FileTreeItem[] {
		return items.slice().sort((aItem, bItem) => {
			const [a, b] = [aItem.file, bItem.file]
			const isAPinned = this.plugin.settings.items[a.path].isPinned
			const isBPinned = this.plugin.settings.items[b.path].isPinned
			if (isAPinned !== isBPinned) return isAPinned ? -1 : 1

			if (folderSettings.sortOrder !== 'custom') {
				const isAFolder = a instanceof TFolder
				const isBFolder = b instanceof TFolder
				if (isAFolder !== isBFolder) return isAFolder ? -1 : 1
			}

			switch (folderSettings.sortOrder) {
				case 'custom': {
					const aIndex = folderSettings.customOrder.indexOf(a.name)
					const bIndex = folderSettings.customOrder.indexOf(b.name)
					if (aIndex === -1 || bIndex === -1) return this.compareByName(a, b)
					return aIndex - bIndex
				}
				case 'byNameDesc': return this.compareByName(b, a)
				case 'byCreatedTimeAsc': return this.compareByTimestamp(a, b, 'ctime', 'asc')
				case 'byCreatedTimeDesc': return this.compareByTimestamp(a, b, 'ctime', 'desc')
				case 'byModifiedTimeAsc': return this.compareByTimestamp(a, b, 'mtime', 'asc')
				case 'byModifiedTimeDesc': return this.compareByTimestamp(a, b, 'mtime', 'desc')
				case 'byNameAsc':
				default: return this.compareByName(a, b)
			}
		})
	}

	private sync(folder: TFolder): void {
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

	private cleanUpInvalidPaths(): void {
		for (const path of Object.keys(this.plugin.settings.items)) {
			if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
				delete this.plugin.settings.items[path]
			}
		}
	}

	private compareByName(a: TAbstractFile, b: TAbstractFile): number {
		return collator.compare(a.name, b.name)
	}

	private compareByTimestamp(
		a: TAbstractFile,
		b: TAbstractFile,
		type: 'ctime' | 'mtime',
		direction: 'asc' | 'desc',
	): number {
		const aTimestamp = a instanceof TFile ? a.stat[type] : -Infinity
		const bTimestamp = b instanceof TFile ? b.stat[type] : -Infinity
		return direction === 'asc' ? aTimestamp - bTimestamp : bTimestamp - aTimestamp
	}

	private persistCreateDeleteChange(): void {
		if (!this.plugin.settings.persistOrderOnCreateDelete)
			return this.log(`Order persistence on create/delete is disabled, skipping data.json update`)

		void this.plugin.saveSettings()
	}

	private getName(path: string): string {
		return path.substring(path.lastIndexOf('/') + 1)
	}

	private getParentPath(path: string): string {
		return path.substring(0, path.lastIndexOf('/')) || '/'
	}
}