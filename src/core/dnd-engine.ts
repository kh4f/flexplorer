import { TAbstractFile, TFile, TFolder } from 'obsidian'
import type { AbstractFileTreeItem, FolderTreeItem } from 'obsidian-typings'

import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'
import type { FolderSettings } from '@/types'

export class DndEngine {
	private readonly log = initLog('DND ENGINE', '#a6ff00')
	private readonly sparseLog = this.initSparseLog(500)

	private explorerEl: HTMLElement | null = null
	private explorerRect: DOMRect | null = null

	private draggedItem: TAbstractFile | null = null
	private dropSibling: HTMLElement | null = null
	private dropFolder: HTMLElement | null = null
	private insertSide: 'before' | 'after' = 'before'
	private pointer = { x: 0, y: 0 }

	private readonly autoscrollZoneHeight = 60
	private readonly edgeScrollSpeed = 20
	private autoscrollRaf = 0

	private readonly expandDelay = 1000
	private expandTarget: HTMLElement | null = null
	private expandTimeout = 0

	constructor(private readonly plugin: Flexplorer) {}

	attach(explorerEl: HTMLElement): void {
		if (explorerEl === this.explorerEl) return this.log('Already attached to', explorerEl)
		this.explorerEl = explorerEl

		explorerEl.addEventListener('dragstart', this.onDragStart)
		// `dragover` instead of `drag` because `drag` fires on the drag source and stops firing once the source is
		// scrolled out of view by Chromium autoscroll;
		// listen on the document so it keeps firing out of the explorer, keeping `lastPointerY` updated for autoscroll
		// acceleration and letting `onDragOver` detect whether the cursor is still inside the explorer
		document.addEventListener('dragover', this.onDragOver)
		// Chromium suppresses drag events (including `dragover`) during its autoscroll, so recompute the drop target
		// from the last known pointer position on the `scroll` event
		explorerEl.addEventListener('scroll', this.onScroll)
		// capture phase to intercept the drop before Obsidian's handler and prevent it from moving the item by calling
		// `preventDefault()`;
		// listen on the document to detect drops outside the explorer and manually call `onDragEnd()` because `dragend`
		// doesn't fire when the drag source is scrolled out of view by Chromium autoscroll (same behavior as `drag`)
		document.addEventListener('drop', this.onDrop, { capture: true })
		// `dragend` fires even when the `drop` is canceled (except for the case above)
		explorerEl.addEventListener('dragend', this.onDragEnd)

		this.log('Attached to', explorerEl)
	}

	detach(): void {
		document.removeEventListener('dragover', this.onDragOver)
		document.removeEventListener('drop', this.onDrop, { capture: true })

		if (this.explorerEl) {
			this.explorerEl.removeEventListener('dragstart', this.onDragStart)
			this.explorerEl.removeEventListener('scroll', this.onScroll)
			this.explorerEl.removeEventListener('dragend', this.onDragEnd)
		}

		this.log('Detached from', this.explorerEl)
	}

	private readonly onDragStart = (event: DragEvent): void => {
		const closestTreeItem = (event.target as HTMLElement).closest<HTMLElement>('.tree-item')
		if (!closestTreeItem) return this.log('Drag started outside a tree item, ignoring')

		this.draggedItem = this.plugin.getExplorerView().files.get(closestTreeItem) ?? null
		if (!this.draggedItem) return this.log('Drag started on an unknown tree item, ignoring')

		this.explorerRect = this.explorerEl!.getBoundingClientRect()
		document.body.classList.add('fp-dragging')

		this.log(`Started dragging '${this.draggedItem.path}'`)
	}

	private readonly onDragOver = (event: DragEvent): void => {
		if (!this.draggedItem) return

		// prevent Obsidian from unexpectedly expanding the collapsed dragged folder and the collapsed folder that
		// ends up right after the dropped item
		this.plugin.getExplorerView().lastDropTargetEl = null

		this.pointer = { x: event.clientX, y: event.clientY }

		this.startAutoscroll()

		const rect = this.explorerRect!
		const isInsideExplorer = this.pointer.x >= rect.left && this.pointer.x <= rect.right
			&& this.pointer.y >= rect.top && this.pointer.y <= rect.bottom
		if (isInsideExplorer) this.updateDragState()
		else {
			this.sparseLog('Cursor left the explorer, clearing drop indicators')
			this.updateDragState.cancel()
			this.clearDropIndicators()
			this.dropSibling = null
			this.dropFolder = null
		}
	}

	private readonly onScroll = (): void => {
		if (!this.draggedItem) return

		this.sparseLog('Scrolled during dragging, updating drag state')
		this.updateDragState()
	}

	private readonly onDrop = (event: DragEvent): void => {
		if (!this.draggedItem) return
		this.log(`Dropped '${this.draggedItem.path}'`)

		if (!this.explorerEl?.contains(event.target as Node)) {
			this.log('Dropped outside the explorer, skipping the move')
			// call `onDragEnd()` manually because `dragend` doesn't fire when the drag source is scrolled out of
			// view by Chromium autoscroll (same behavior as `drag`)
			this.onDragEnd()
			return
		}

		event.preventDefault() // cancel the default action so Obsidian skips its own file move

		let dropSiblingPath = this.resolveItemPath(this.dropSibling)
		const dropFolderPath = this.resolveItemPath(this.dropFolder)
		if (!dropFolderPath) return this.log('Drop folder not found, skipping the move')

		const selectedItems = this.getSelectedItems()
		const isDraggedSelected = selectedItems.some(item => item.file === this.draggedItem)

		if (isDraggedSelected) {
			const pinnedStates = new Set(selectedItems.map(item => this.plugin.settings.items[item.file.path].isPinned))
			if (pinnedStates.size > 1) return this.log('Selection mixes pinned and unpinned items, skipping the move')

			if (pinnedStates.has(true)) {
				const parentPaths = new Set(selectedItems.map(item => item.file.parent?.path))
				if (parentPaths.size > 1) return this.log('Pinned selection spans multiple folders, skipping the move')
			}

			this.log('Moving selected items:', selectedItems)
			selectedItems.forEach((item, idx) => {
				const insertSide = idx === 0 ? this.insertSide : 'after'
				const newPath = this.resolveNewPath(item.file, dropFolderPath)
				this.moveItem(item.file, newPath, dropFolderPath, dropSiblingPath, insertSide)
				dropSiblingPath = newPath
			})
		} else {
			const newPath = this.resolveNewPath(this.draggedItem, dropFolderPath)
			this.moveItem(this.draggedItem, newPath, dropFolderPath, dropSiblingPath, this.insertSide)
		}
	}

	private readonly onDragEnd = (): void => {
		if (!this.draggedItem) return
		this.log(`Ended dragging '${this.draggedItem.path}'`)

		this.updateDragState.cancel()
		this.stopAutoscroll()

		this.clearDropIndicators()
		this.draggedItem = null
		this.dropSibling = null
		this.dropFolder = null
		this.explorerRect = null
		document.body.classList.remove('fp-dragging')
	}

	private readonly updateDragState: (() => void) & { cancel: () => void } = this.rafThrottle((): void => {
		if (!this.draggedItem) return

		this.clearDropIndicators()
		this.resolveDropTarget()
		this.applyDropIndicators()

		this.sparseLog(`Dragging '${this.draggedItem.path}' ${this.insertSide} ` +
			`'${this.resolveItemPath(this.dropSibling)}' in '${this.resolveItemPath(this.dropFolder)}'`)
		this.sparseLog.flush()
	})

	private clearDropIndicators(): void {
		delete this.dropSibling?.dataset.dropSibling
		delete this.dropFolder?.dataset.dropFolder
	}

	private resolveDropTarget(): void {
		const isDraggedPinned = this.plugin.settings.items[this.draggedItem!.path].isPinned

		this.resolveDropSibling(isDraggedPinned)
		if (this.dropSibling) this.dropFolder = this.dropSibling.parentElement!.closest<HTMLElement>(
			'[data-type="file-explorer"] > .nav-files-container > div, .nav-folder')!

		this.resolveHoveredFolder(isDraggedPinned)

		const dropFolderPath = this.resolveItemPath(this.dropFolder)!
		const dropFolderSettings = this.plugin.settings.items[dropFolderPath] as FolderSettings
		if (dropFolderSettings.sortOrder !== 'custom') this.dropSibling = null
	}

	private resolveDropSibling(isDraggedPinned: boolean): void {
		const siblingCandidates = [...this.explorerEl!.querySelectorAll<HTMLElement>(
			'.tree-item:not(.nav-folder:has(> .tree-item-self:is(.is-being-dragged, .is-selected)) .tree-item)')]
		const firstUnpinnedByParent = new Map<HTMLElement, HTMLElement>()
		let shortestDist = Infinity

		for (const candidate of siblingCandidates) {
			const candidateItem = this.plugin.getExplorerView().files.get(candidate)!
			const isCandidatePinned = this.plugin.settings.items[candidateItem.path].isPinned
			const parent = candidate.parentElement!
			if (!isCandidatePinned && !firstUnpinnedByParent.has(parent)) firstUnpinnedByParent.set(parent, candidate)

			if (isDraggedPinned !== isCandidatePinned) continue
			const areInSameFolder = this.draggedItem!.parent?.path === candidateItem.parent?.path
			if (isDraggedPinned && !areInSameFolder) continue

			const candidateRect = candidate.getBoundingClientRect()
			const distToBottom = Math.abs(this.pointer.y - candidateRect.bottom)
			const isFirstUnpinned = candidate.matches('.tree-item:nth-child(1 of .tree-item)')
				|| (!isDraggedPinned && candidate === firstUnpinnedByParent.get(candidate.parentElement!))
			const distToTop = isFirstUnpinned ? Math.abs(this.pointer.y - candidateRect.top) : Infinity
			const dist = Math.min(distToBottom, distToTop)

			if (dist < shortestDist) {
				shortestDist = dist
				this.dropSibling = candidate
				this.insertSide = distToBottom < distToTop ? 'after' : 'before'
			}
		}
	}

	private resolveHoveredFolder(isDraggedPinned: boolean): void {
		const hoveredEl = activeDocument.elementFromPoint(this.pointer.x, this.pointer.y) as HTMLElement
		const closestFolderTitle = hoveredEl.closest('.nav-folder-title')
		let shouldClearExpand = true

		if (closestFolderTitle && !isDraggedPinned) {
			const folderEl = closestFolderTitle.parentElement!
			const folderPath = this.resolveItemPath(folderEl)
			const draggedPath = this.draggedItem!.path
			// a folder can't be dropped into itself or into one of its descendants
			const isDraggedFolder = folderPath === draggedPath
				|| (folderPath?.startsWith(`${draggedPath}/`) ?? false)
			const titleRect = closestFolderTitle.getBoundingClientRect()
			const isTitleCenterHovered = this.pointer.y > titleRect.top + 5 && this.pointer.y < titleRect.bottom - 5

			if (isDraggedFolder) this.sparseLog('Hovering over the dragged folder or its descendant, ignoring it')
			else if (isTitleCenterHovered) {
				this.sparseLog(`Hovering over folder title center, treating it as drop folder`)
				this.dropFolder = folderEl
				this.dropSibling = null

				const isCollapsedFolder = this.dropFolder.classList.contains('is-collapsed')
				if (isCollapsedFolder) {
					if (folderEl !== this.expandTarget) {
						this.sparseLog('Folder is collapsed, starting expand timeout')
						this.scheduleFolderExpand(folderEl)
					}
					shouldClearExpand = false
				}
			}
		}

		if (shouldClearExpand) this.clearPendingExpand()
	}

	private applyDropIndicators(): void {
		if (this.dropSibling) this.dropSibling.dataset.dropSibling = this.insertSide
		if (this.dropFolder) this.dropFolder.dataset.dropFolder = ''
	}

	private scheduleFolderExpand(folderEl: HTMLElement): void {
		this.clearPendingExpand()

		this.expandTarget = folderEl
		this.expandTimeout = window.setTimeout(() => {
			const folderPath = this.resolveItemPath(folderEl)!
			const folderItem = this.plugin.getExplorerView().fileItems[folderPath] as FolderTreeItem
			void folderItem.setCollapsed(false, true)
			this.log(`Folder '${folderPath}' expanded after timeout`)
		}, this.expandDelay)
	}

	private clearPendingExpand(): void {
		window.clearTimeout(this.expandTimeout)
		this.expandTarget = null
	}

	private getSelectedItems(): AbstractFileTreeItem<TFile>[] {
		const selectedItems = [...this.plugin.getExplorerView().tree.selectedDoms]
		const nonNestedItems = selectedItems.filter(selected => !selectedItems.some(selectedFolder =>
			selectedFolder.file instanceof TFolder
			&& selectedFolder.file.path !== selected.file.path
			&& selected.file.path.startsWith(selectedFolder.file.path + '/'),
		))

		return nonNestedItems.sort((a, b) => {
			const elA = a.el
			const elB = b.el
			if (elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING) return -1
			if (elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_PRECEDING) return 1
			return 0
		})
	}

	private resolveNewPath(item: TAbstractFile, newParentPath: string): string {
		const prefix = newParentPath === '/' ? '' : `${newParentPath}/`
		let newPath = `${prefix}${item.name}`

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

	private resolveItemPath(el: HTMLElement | null): string | null {
		if (!el) return null
		if (el === this.explorerEl?.firstElementChild) return '/'

		return this.plugin.getExplorerView().files.get(el)?.path ?? null
	}

	private moveItem(
		draggedItem: TAbstractFile,
		newPath: string,
		folderPath: string,
		siblingPath: string | null,
		insertSide: typeof this.insertSide,
	): void {
		const folderSettings = this.plugin.settings.items[folderPath] as FolderSettings
		if (draggedItem.path === newPath && folderSettings.sortOrder !== 'custom')
			return this.log(`Item '${draggedItem.path}' is already in the drop folder ` +
				`and folder's sort order is not 'custom', skipping the move`)

		this.plugin.orderManager.move(draggedItem.path, newPath, siblingPath ?? undefined, insertSide)
		void this.plugin.app.fileManager.renameFile(draggedItem, newPath)
	}

	private startAutoscroll(): void {
		if (!this.autoscrollRaf) this.autoscrollRaf = window.requestAnimationFrame(this.handleAutoscroll)
	}

	private stopAutoscroll(): void {
		window.cancelAnimationFrame(this.autoscrollRaf)
		this.autoscrollRaf = 0
	}

	private readonly handleAutoscroll = (): void => {
		if (!this.explorerEl || !this.explorerRect || !this.draggedItem) {
			this.autoscrollRaf = 0
			return
		}

		const distToTop = this.pointer.y - this.explorerRect.top
		const distToBottom = this.explorerRect.bottom - this.pointer.y

		let speed = 0
		if (distToTop < this.autoscrollZoneHeight) speed = -this.resolveScrollSpeed(distToTop)
		else if (distToBottom < this.autoscrollZoneHeight) speed = this.resolveScrollSpeed(distToBottom)

		// stop the loop when the cursor is away from the edges; the next `dragover` event restarts it
		if (!speed) {
			this.autoscrollRaf = 0
			return
		}

		this.explorerEl.scrollTop += speed
		this.autoscrollRaf = window.requestAnimationFrame(this.handleAutoscroll)
	}

	private resolveScrollSpeed(distToEdge: number): number {
		// the scroll speed in px/frame based on the distance from the explorer edge;
		// quadratic growth: 0 at the zone start, `edgeScrollSpeed` at the explorer edge, accelerating beyond it
		return (1 - distToEdge / this.autoscrollZoneHeight) ** 2 * this.edgeScrollSpeed
	}

	private rafThrottle<T extends (...args: unknown[]) => void>(fn: T):
		((...args: Parameters<T>) => void) & { cancel: () => void } {
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

	private initSparseLog(delay: number): ((...args: unknown[]) => void) & { flush: () => void } {
		let lastFlush = 0
		let buffer: unknown[] = []

		const sparse = (...args: unknown[]) =>
			buffer.push(...(buffer.length ? ['\n', ...args] : args))

		sparse.flush = () => {
			if (!buffer.length) return

			const now = Date.now()
			if (now - lastFlush >= delay) {
				lastFlush = now
				this.log(...buffer)
			}

			buffer = []
		}

		return sparse
	}
}

void `css
body.fp-dragging {
	[data-type='file-explorer'] .nav-files-container {
		/* disable Chromium's native autoscroll */
		overflow: hidden !important;

		/* offset the bottom edge of nested folders so the drop indicator can be positioned at each level */
		.nav-folder-children {
			padding-bottom: 5px;
		}

		.tree-item[data-drop-sibling] {
			/* drop line */
			position: relative;
			&[data-drop-sibling='before']::before, &[data-drop-sibling='after']::after {
				content: '';
				position: absolute;
				display: block;
				translate: 12px -1px;
				height: 2px;
				width: 90%;
				left: 0px;
				z-index: 1;
				border-radius: 10px;
				background: var(--color-accent);
			}

			/* offset adjacent indicators */
			&.nav-folder[data-drop-sibling='after']:not(.is-collapsed)::after {
				transform: translateY(2px);
			}
			.nav-folder-children &[data-drop-sibling='after']:nth-last-child(1 of .tree-item)::after {
				transform: translateY(-2px);
			}
		}

		/* replace Obsidian's drop-folder highlight because it may target a different element */
		> div, .nav-folder {
			&.is-being-dragged-over {
				background-color: revert;

				> .nav-folder-title {
					color: var(--nav-item-color);
				}
			}

			&[data-drop-folder] {
				background-color: hsla(var(--interactive-accent-hsl), 0.05);
				border-radius: var(--radius-s);

				> .nav-folder-title {
					color: var(--nav-item-color-highlighted);
				}
			}
		}
	}

	/* hide the tooltip because it may show the wrong drop folder during dragging */
	.drag-ghost {
		display: none;
	}
}
`