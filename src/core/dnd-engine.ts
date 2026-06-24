import { Platform, TAbstractFile, TFile, TFolder } from 'obsidian'
import type { FolderTreeItem } from 'obsidian-typings'

import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'
import type { FolderSettings } from '@/types'

type DragPointerEvent = DragEvent | TouchEvent
type InsertPosition = 'before' | 'after'
interface SiblingDropTarget {
	sibling: HTMLElement
	folderEl: HTMLElement
	folderPath: string
	insertPos: InsertPosition
}

const ROOT_PATH = '/'
const ROOT_FOLDER_SELECTOR = '[data-type="file-explorer"] > .nav-files-container > div'
const TREE_ITEM_SELECTOR = '.tree-item'
const DRAGGING_CLASS = 'fp-dragging'
const DRAGGING_SELECTOR = '[data-dragging]'
const DROP_SIBLING_SELECTOR = '[data-drop-sibling]'
const INSERT_POS_SELECTOR = '[data-insert-pos]'
const DROP_FOLDER_SELECTOR = '[data-drop-folder]'

export class DndEngine {
	private readonly log = initLog('DND-ENGINE', '#a6ff00')
	private readonly sparseLog = this.initSparseLog(1000)

	private readonly dragStartEvent = Platform.isMobile ? 'touchstart' : 'dragstart'
	private readonly dragEvent = Platform.isMobile ? 'touchmove' : 'drag'
	private readonly dropEvent = Platform.isMobile ? 'touchend' : 'drop'

	private readonly scrollZone = 60
	private readonly baseScrollSpeed = 25
	private readonly handleWidth = 36
	private readonly expandDelay = 800

	private explorerEl?: HTMLElement
	private explorerRect?: DOMRect
	private draggingItem?: TAbstractFile
	private draggingEl: HTMLElement | null = null
	private dropSibling: HTMLElement | null = null
	private dropFolder: HTMLElement | null = null
	private insertPos: InsertPosition = 'before'
	private dropSiblingIndicator: HTMLElement | null = null
	private dropFolderIndicator: HTMLElement | null = null
	private indicatorInsertPos: InsertPosition | null = null
	private pointerY = 0
	private autoscrollRaf = 0
	private expandTimeout = 0
	private expandTarget: HTMLElement | null = null

	constructor(private readonly plugin: Flexplorer) {}

	attach(explorerEl: HTMLElement) {
		if (this.explorerEl === explorerEl) return this.log('DnD already attached')
		if (this.explorerEl) this.detach()

		this.log('Attaching to', explorerEl)
		this.explorerEl = explorerEl

		explorerEl.addEventListener(this.dragStartEvent, this.onDragStart)
		explorerEl.addEventListener(this.dragEvent, this.onDrag)
		explorerEl.addEventListener(this.dropEvent, this.onDrop, { capture: true })
		if (!Platform.isMobile) explorerEl.addEventListener('dragend', this.onDragEnd)

		this.log('DnD enabled')
	}

	detach() {
		if (!this.explorerEl) return

		this.onDrag.cancel()
		this.explorerEl.removeEventListener(this.dragStartEvent, this.onDragStart)
		this.explorerEl.removeEventListener(this.dragEvent, this.onDrag)
		this.explorerEl.removeEventListener(this.dropEvent, this.onDrop, { capture: true })
		if (!Platform.isMobile) this.explorerEl.removeEventListener('dragend', this.onDragEnd)
		this.clearDropIndicators()
		this.explorerEl = undefined

		this.log('DnD disabled')
	}

	private readonly onDragStart = (event: DragPointerEvent) => {
		const treeItem = (event.target as HTMLElement).closest<HTMLElement>(TREE_ITEM_SELECTOR)
		if (!treeItem) return

		if (Platform.isMobile) {
			const distRight = treeItem.getBoundingClientRect().right - this.handleWidth
			const pointerX = this.getPointerX(event)
			if (pointerX < distRight) return this.log('Drag not in handle area')
			event.preventDefault()
		}

		this.log('Drag started')
		this.draggingItem = this.plugin.getExplorerView().files.get(treeItem)
		this.explorerRect = this.explorerEl!.getBoundingClientRect()
		this.draggingEl = treeItem
		treeItem.dataset.dragging = ''
		activeDocument.body.classList.add(DRAGGING_CLASS)
	}

	private readonly onDrag = this.rafThrottle((event: DragPointerEvent) => {
		if (!this.draggingItem) return
		this.sparseLog('Dragging')

		if (Platform.isMobile) event.preventDefault() // prevent swiping explorer horizontally on mobile

		const pointerX = this.getPointerX(event)
		this.pointerY = this.getPointerY(event)

		if (this.isPointerOutsideExplorer(pointerX)) {
			this.sparseLog('Pointer outside explorer, clearing drop indicators')
			this.dropSibling = null
			this.dropFolder = null
			this.updateDropIndicators()
			return
		}

		this.startAutoscroll()

		const hoveredEl = activeDocument.elementFromPoint(pointerX, this.pointerY)
		const folderTitle = hoveredEl?.closest<HTMLElement>('.nav-folder-title')
		this.dropSibling = null
		this.dropFolder = null
		let shouldClearExpand = true

		if (folderTitle) {
			const titleRect = folderTitle.getBoundingClientRect()
			if (this.pointerY > titleRect.top + 10 && this.pointerY < titleRect.bottom - 10) {
				this.sparseLog('Hovering over folder title, treating it as drop folder')
				const folderEl = folderTitle.parentElement!
				this.dropSibling = null
				this.dropFolder = folderEl

				if (folderEl.matches('.is-collapsed')) {
					if (folderEl !== this.expandTarget) {
						this.sparseLog('Folder is collapsed, starting expand timeout')
						this.scheduleFolderExpand(folderEl)
					}
					shouldClearExpand = false
				}
			}
		}

		if (shouldClearExpand) {
			this.clearPendingExpand()
			const treeItem = hoveredEl?.closest<HTMLElement>(TREE_ITEM_SELECTOR)
			if (treeItem) {
				const dropTarget = this.getSiblingDropTarget(treeItem)
				if (dropTarget) {
					this.dropSibling = dropTarget.sibling
					this.dropFolder = dropTarget.folderEl
					this.insertPos = dropTarget.insertPos
					const folderSettings = this.plugin.settings.items[dropTarget.folderPath] as FolderSettings | undefined
					if (folderSettings?.sortOrder !== 'custom') this.dropSibling = null
				}
			}
		}
		this.updateDropIndicators()

		// prevent Obsidian's native drop-target expansion from competing with custom DnD handling
		this.plugin.getExplorerView().lastDropTargetEl = null

		this.sparseLog.flush()
	})

	private readonly onDrop = (event: DragPointerEvent) => {
		if (!this.draggingItem) return
		this.log('Dropped')
		event.preventDefault()

		let siblingPath: string | undefined
		let dropFolderPath: string | undefined
		if (this.dropSibling) {
			const siblingItem = this.plugin.getExplorerView().files.get(this.dropSibling)!
			siblingPath = siblingItem.path
			dropFolderPath = siblingItem.parent!.path
		} else if (this.dropFolder) {
			dropFolderPath = this.plugin.getExplorerView().files.get(this.dropFolder)?.path ?? ROOT_PATH
		} else {
			return this.log('Nowhere to drop')
		}

		const draggingItem = this.draggingItem
		const selectedItems = this.getSelectedItems()
		const isDraggingSelected = selectedItems.some(item => item.file === draggingItem)
		if (isDraggingSelected) {
			this.log('Moving selected items:', selectedItems)
			let insertPos = this.insertPos
			selectedItems.forEach(item => {
				const newPath = this.getNewPath(item.file, dropFolderPath)
				this.moveItem(item.file, newPath, dropFolderPath, siblingPath, insertPos)
				siblingPath = newPath
				insertPos = 'after'
			})
		} else {
			const newPath = this.getNewPath(draggingItem, dropFolderPath)
			this.moveItem(draggingItem, newPath, dropFolderPath, siblingPath, this.insertPos)
		}

		if (Platform.isMobile) this.onDragEnd()
		this.plugin.getExplorerView().lastDropTargetEl = null
	}

	private moveItem(
		draggingItem: TAbstractFile,
		newPath: string,
		dropFolderPath: string,
		siblingPath: string | undefined,
		insertPosition: InsertPosition,
	) {
		const folderSettings = this.plugin.settings.items[dropFolderPath] as FolderSettings | undefined
		if (draggingItem.path === newPath && folderSettings?.sortOrder !== 'custom') {
			return this.log(`Item '${draggingItem.path}' is already in the target folder and folder does not have custom order`)
		}
		this.plugin.orderManager.move(draggingItem.path, newPath, siblingPath, insertPosition)
		void this.plugin.app.fileManager.renameFile(draggingItem, newPath)
	}

	private getNewPath(item: TAbstractFile, newParentPath: string) {
		let newPath = `${newParentPath}/${item.name}`.replace(/^\/+/, '')
		const isPathChanged = item.path !== newPath
		const duplicate = this.plugin.app.vault.getAbstractFileByPathInsensitive(newPath)
		if (isPathChanged && duplicate) {
			if (item instanceof TFile) {
				const basePath = newPath.slice(0, -(item.extension.length + 1))
				newPath = this.plugin.app.vault.getAvailablePath(basePath, item.extension)
			} else if (item instanceof TFolder) {
				newPath = this.plugin.app.vault.getAvailablePath(newPath, '')
			}
		}
		return newPath
	}

	private getSelectedItems() {
		const items = [...this.plugin.getExplorerView().tree.selectedDoms]
		const nonNestedItems = items.filter(selectedItem => !items.some(selectedFolder =>
			selectedFolder.file instanceof TFolder
			&& selectedFolder.file.path !== selectedItem.file.path
			&& selectedItem.file.path.startsWith(selectedFolder.file.path + '/'),
		))
		return nonNestedItems.sort((a, b) => {
			const elA = a.el
			const elB = b.el
			if (elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING) return -1
			if (elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_PRECEDING) return 1
			return 0
		})
	}

	private readonly onDragEnd = () => {
		this.log('Drag ended')
		this.onDrag.cancel()
		window.cancelAnimationFrame(this.autoscrollRaf)
		this.autoscrollRaf = 0
		this.clearPendingExpand()
		this.clearDropIndicators()
	}

	private clearDropIndicators(resetState = true) {
		if (this.dropSiblingIndicator) {
			delete this.dropSiblingIndicator.dataset.dropSibling
			delete this.dropSiblingIndicator.dataset.insertPos
		}
		if (this.dropFolderIndicator) delete this.dropFolderIndicator.dataset.dropFolder
		this.dropSiblingIndicator = null
		this.dropFolderIndicator = null
		this.indicatorInsertPos = null
		if (resetState) {
			activeDocument.querySelectorAll<HTMLElement>(DROP_SIBLING_SELECTOR).forEach(el => delete el.dataset.dropSibling)
			activeDocument.querySelectorAll<HTMLElement>(INSERT_POS_SELECTOR).forEach(el => delete el.dataset.insertPos)
			activeDocument.querySelectorAll<HTMLElement>(DROP_FOLDER_SELECTOR).forEach(el => delete el.dataset.dropFolder)
			if (this.draggingEl) delete this.draggingEl.dataset.dragging
			else activeDocument.querySelectorAll<HTMLElement>(DRAGGING_SELECTOR).forEach(el => delete el.dataset.dragging)
			this.draggingItem = undefined
			this.draggingEl = null
			this.dropSibling = null
			this.insertPos = 'before'
			this.dropFolder = null
			activeDocument.body.classList.remove(DRAGGING_CLASS)
		}
	}

	private updateDropIndicators() {
		const siblingChanged = this.dropSiblingIndicator !== this.dropSibling || this.indicatorInsertPos !== this.insertPos
		if (siblingChanged && this.dropSiblingIndicator) {
			delete this.dropSiblingIndicator.dataset.dropSibling
			delete this.dropSiblingIndicator.dataset.insertPos
		}
		if (siblingChanged) {
			this.dropSiblingIndicator = this.dropSibling
			this.indicatorInsertPos = this.dropSibling ? this.insertPos : null
			if (this.dropSibling) {
				this.dropSibling.dataset.dropSibling = ''
				this.dropSibling.dataset.insertPos = this.insertPos
			}
		}

		const dropFolderIndicator = this.dropSibling ? null : this.dropFolder
		if (this.dropFolderIndicator !== dropFolderIndicator) {
			if (this.dropFolderIndicator) delete this.dropFolderIndicator.dataset.dropFolder
			this.dropFolderIndicator = dropFolderIndicator
			if (dropFolderIndicator) dropFolderIndicator.dataset.dropFolder = ''
		}
	}

	private getSiblingDropTarget(candidate: HTMLElement): SiblingDropTarget | null {
		if (!this.explorerEl || !this.draggingItem || this.isExcludedDropSibling(candidate)) return null

		const explorerFiles = this.plugin.getExplorerView().files
		const folderEl = candidate.parentElement!.closest<HTMLElement>(`${ROOT_FOLDER_SELECTOR}, .nav-folder`)!
		const folderPath = explorerFiles.get(folderEl)?.path ?? ROOT_PATH
		const rect = candidate.getBoundingClientRect()
		const insertPos = this.pointerY < rect.top + rect.height / 2 ? 'before' : 'after'
		return { sibling: candidate, folderEl, folderPath, insertPos }
	}

	private isExcludedDropSibling(candidate: HTMLElement) {
		if (candidate === this.draggingEl) return true

		const candidateItem = this.plugin.getExplorerView().files.get(candidate)
		if (!candidateItem) return true

		const draggingItem = this.draggingItem!
		const draggingItemSettings = this.plugin.settings.items[draggingItem.path] as { isPinned?: boolean } | undefined
		if (draggingItemSettings?.isPinned) {
			const inSameFolder = candidateItem.parent?.path === draggingItem.parent?.path
			const isSiblingPinned = this.plugin.settings.pinnedFiles.includes(candidateItem.path)
			if (!inSameFolder || !isSiblingPinned) return true
		}

		for (let el = candidate.parentElement; el && el !== this.explorerEl; el = el.parentElement) {
			if (el.matches('.nav-folder')) {
				if (el.hasAttribute('data-dragging')) return true
				if (el.firstElementChild?.classList.contains('is-selected')) return true
			}
		}
		return false
	}

	private readonly handleAutoscroll = () => {
		if (!this.explorerEl || !this.explorerRect) return

		const topDist = this.pointerY - this.explorerRect.top
		const bottomDist = this.explorerRect.bottom - this.pointerY

		let speed = 0
		if (topDist < this.scrollZone) {
			speed = -Math.max(0.1, 1 - topDist / this.scrollZone) * this.baseScrollSpeed
		} else if (bottomDist < this.scrollZone) {
			speed = Math.max(0.1, 1 - bottomDist / this.scrollZone) * this.baseScrollSpeed
		}

		this.explorerEl.scrollTop += speed
		this.autoscrollRaf = window.requestAnimationFrame(this.handleAutoscroll)
	}

	private startAutoscroll() {
		if (!this.autoscrollRaf) {
			this.autoscrollRaf = window.requestAnimationFrame(this.handleAutoscroll)
		}
	}

	private clearPendingExpand() {
		window.clearTimeout(this.expandTimeout)
		this.expandTarget = null
	}

	private scheduleFolderExpand(folderEl: HTMLElement) {
		this.clearPendingExpand()
		this.expandTarget = folderEl
		this.expandTimeout = window.setTimeout(() => {
			const folderPath = this.plugin.getExplorerView().files.get(folderEl)!.path
			const folderItem = this.plugin.getExplorerView().fileItems[folderPath] as FolderTreeItem
			void folderItem.setCollapsed(false, true)
			this.log(`Folder '${folderPath}' expanded after timeout`)
		}, this.expandDelay)
	}

	private isPointerOutsideExplorer(pointerX: number) {
		return pointerX < this.explorerRect!.left
			|| pointerX > this.explorerRect!.right
			|| this.pointerY < this.explorerRect!.top
			|| this.pointerY > this.explorerRect!.bottom
	}

	private getPointerX(event: DragPointerEvent) {
		return event instanceof TouchEvent ? event.touches[0].clientX : event.clientX
	}

	private getPointerY(event: DragPointerEvent) {
		return event instanceof TouchEvent ? event.touches[0].clientY : event.clientY
	}

	private rafThrottle<T extends (...args: any[]) => void>(fn: T) {
		let raf = 0
		let latestArgs: Parameters<T>

		const throttled = (...args: Parameters<T>) => {
			latestArgs = args

			if (raf) return

			raf = window.requestAnimationFrame(() => {
				raf = 0
				fn(...latestArgs)
			})
		}

		throttled.cancel = () => {
			window.cancelAnimationFrame(raf)
			raf = 0
		}

		return throttled
	}

	private initSparseLog(delay: number) {
		let lastFlush = 0
		let buffer: unknown[][] = []

		const sparse = (...args: unknown[]) => buffer.push(args)

		sparse.flush = () => {
			if (!buffer.length) return
			const now = Date.now()
			if (now - lastFlush >= delay) {
				lastFlush = now
				for (const args of buffer) this.log(...args)
			}
			buffer = []
		}

		return sparse
	}
}

void `css
[data-type='file-explorer'] {
	.tree-item[data-drop-sibling] {
		position: relative;

		/* drop indicators */
		&[data-insert-pos='before']::before, &[data-insert-pos='after']::after {
			content: '';
			position: absolute;
			display: block;
			translate: 12px -1px;
			height: 1px;
			width: 90%;
			left: 0px;
			background: var(--color-accent);
		}

		/* offset adjacent indicators */
		&.nav-folder[data-insert-pos='after']:not(.is-collapsed)::after {
			transform: translateY(2px);
		}
		.nav-folder-children &[data-insert-pos='after']:nth-last-child(1 of .tree-item)::after {
			transform: translateY(-2px);
		}
	}

	/* replace Obsidian's drop-folder styling because it may target a different element */
	> .nav-files-container > div, .nav-folder {
		&.is-being-dragged-over {
			background-color: revert;

			> .nav-folder-title { color: var(--nav-item-color); }
		}

		&[data-drop-folder] {
			background-color: hsla(var(--interactive-accent-hsl), 0.1);
			border-radius: var(--radius-s);

			> .nav-folder-title { color: var(--nav-item-color-highlighted); }
		}
	}
}

/* hide the tooltip because it can show the wrong drop folder during dragging */
body.fp-dragging .drag-ghost {
	display: none;
}
`