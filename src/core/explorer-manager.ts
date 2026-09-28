import { mountIndicator } from '@/ui/indicator'
import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'

const EXPLORER_SELECTOR = '[data-type="file-explorer"] > .nav-files-container'

interface ObserveExplorerMountOptions {
	checkExisting?: boolean
	watch?: boolean
}

export class ExplorerManager {
	private readonly log = initLog('EXPLORER-MANAGER', '#FF3B55')
	private readonly observers: MutationObserver[] = []

	constructor(private readonly plugin: Flexplorer) {}

	waitForExplorerEl() {
		return new Promise<HTMLElement>(resolve => this.observeExplorerMount(resolve, { checkExisting: true }))
	}

	observeExplorerMount(onMount: (el: HTMLElement) => void, { checkExisting = false, watch = false }: ObserveExplorerMountOptions = {}) {
		if (checkExisting) {
			const explorerEl = this.getExplorerEl()
			if (explorerEl) {
				onMount(explorerEl)
				if (!watch) return
			}
		}
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.instanceOf(HTMLElement) && node.matches(EXPLORER_SELECTOR)) {
						if (!watch) this.disconnectObserver(observer)
						return onMount(node)
					}
				}
			}
		})
		observer.observe(activeDocument.body, { childList: true, subtree: true })
		this.observers.push(observer)
	}

	disconnectObservers() {
		this.observers.forEach(obs => obs.disconnect())
		this.observers.length = 0
	}

	syncIndicators() {
		Object.values(this.plugin.getExplorerView().fileItems)
			.forEach(item => mountIndicator(item, this.plugin.settings.items[item.file.path]))
		this.log('Indicators synced')
	}

	private getExplorerEl() {
		return activeDocument.querySelector<HTMLElement>(EXPLORER_SELECTOR)
	}

	private disconnectObserver(observer: MutationObserver) {
		observer.disconnect()
		const observerIndex = this.observers.indexOf(observer)
		if (observerIndex !== -1) this.observers.splice(observerIndex, 1)
	}
}