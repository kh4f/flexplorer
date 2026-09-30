import { mountIndicator } from '@/ui/indicator'
import { initLog } from '@/utils'
import type Flexplorer from '@/plugin'

const EXPLORER_SELECTOR = '[data-type="file-explorer"] > .nav-files-container'

export class ExplorerManager {
	private readonly log = initLog('EXPLORER MANAGER', '#FF3B55')
	private readonly observers: MutationObserver[] = []

	constructor(private readonly plugin: Flexplorer) {}

	observeExplorerMount(onMount: (el: HTMLElement) => void, { checkExisting = false, watch = false }): void {
		if (checkExisting) {
			const explorerEl = document.querySelector<HTMLElement>(EXPLORER_SELECTOR)
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
		observer.observe(document.body, { childList: true, subtree: true })
		this.observers.push(observer)
	}

	syncIndicators(): void {
		Object.values(this.plugin.getExplorerView().fileItems)
			.forEach(item => mountIndicator(item, this.plugin.settings.items[item.file.path]))
		this.log('Indicators synced')
	}

	disconnectObservers(): void {
		this.observers.forEach(obs => obs.disconnect())
		this.observers.length = 0
		this.log('Observers disconnected')
	}

	private disconnectObserver(observer: MutationObserver): void {
		observer.disconnect()
		const observerIndex = this.observers.indexOf(observer)
		if (observerIndex !== -1) this.observers.splice(observerIndex, 1)
	}
}