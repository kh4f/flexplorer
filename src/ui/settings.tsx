import { App, PluginSettingTab } from 'obsidian'
import type { SettingDefinitionItem } from 'obsidian'

import { logger } from '@/utils'
import type Flexplorer from '@/plugin'

export class SettingsTab extends PluginSettingTab {
	constructor(readonly app: App, readonly plugin: Flexplorer) {
		super(app, plugin)
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'New item placement',
				desc: 'Default placement for new items inside a folder',
				control: {
					type: 'dropdown',
					key: 'newItemPlacement',
					defaultValue: 'top',
					options: { top: 'Top', bottom: 'Bottom' },
				},
			},
			{
				name: 'Persist order on create/delete',
				desc: createFragment(frag => {
					frag.append('Update data.json immediately when files are created or deleted. ' +
						'Disable this if your sync service, especially Obsidian Sync, causes sync conflicts ' +
						'when merging data.json across devices. ')
					frag.createEl('a', {
						text: '(Issue #120)',
						href: 'https://github.com/kh4f/flexplorer/issues/120#issuecomment-3782479650',
					})
				}),
				control: { type: 'toggle', key: 'persistOrderOnCreateDelete' },
			},
			{
				name: 'Debug mode',
				desc: 'Show debug logs in the DevTools console',
				// `render` instead of `control`: this toggle has a side effect (logger level)
				render: setting => void setting.addToggle(toggle => toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(enableDebugMode => {
						this.plugin.settings.debugMode = enableDebugMode
						logger.level = enableDebugMode ? 'debug' : 'silent'
						void this.plugin.saveSettings()
					}),
				),
			},
		]
	}
}