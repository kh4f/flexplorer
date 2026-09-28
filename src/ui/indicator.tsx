import { setIcon, TAbstractFile } from 'obsidian'
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import type { AbstractFileTreeItem } from 'obsidian-typings'

import type { ItemSettings } from '@/types'

const roots = new WeakMap<HTMLElement, ReturnType<typeof createRoot>>()

const Indicator = ({ itemSettings }: { itemSettings: ItemSettings }) => {
	return itemSettings.isPinned ? <PinIndicator/> : null
}

const PinIndicator = () => {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (ref.current) setIcon(ref.current, 'pin')
	}, [])

	return <div className='pin-indicator' ref={ref}/>
}

export const mountIndicator = (item: AbstractFileTreeItem<TAbstractFile>, itemSettings: ItemSettings) => {
	const indicatorEl = item.coverEl.querySelector<HTMLElement>('.fp-indicator')
		?? item.coverEl.createDiv({ cls: 'fp-indicator' })
	let root = roots.get(indicatorEl)
	if (!root) {
		root = createRoot(indicatorEl)
		roots.set(indicatorEl, root)
	}

	root.render(<Indicator itemSettings={itemSettings}/>)
	item.el.toggleClass('fp-hidden', itemSettings.isHidden)
}

void `css
[data-type='file-explorer'] .tree-item {
	&.fp-hidden {
		display: none;
		opacity: .3;

		body.fp-show-hidden & {
			display: revert;
		}
	}

	.tree-item-self {
		align-items: center;

		.fp-indicator {
			margin-left: auto;

			.pin-indicator {
				height: var(--icon-s);
				width: var(--icon-s);
				padding-top: 0.5px;
				opacity: .3;

				svg {
					margin-bottom: -2px;
					transform: rotate(45deg);
					--icon-size: 14px;
					--icon-stroke: var(--icon-s-stroke-width);
				}
			}
		}
	}
}
`