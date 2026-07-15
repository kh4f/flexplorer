import { App, PluginSettingTab, Setting } from 'obsidian'

import { logger } from '@/utils'
import type Flexplorer from '@/plugin'
import type { NewItemPlacement } from '@/types'

export class SettingsTab extends PluginSettingTab {
	constructor(readonly app: App, readonly plugin: Flexplorer) { super(app, plugin) }

	display() {
		this.containerEl.empty()
		const persistOrderOnCreateDeleteDesc = activeWindow.createFragment()
		persistOrderOnCreateDeleteDesc.append('Update data.json immediately when files are created or deleted. Disable this if your sync service, especially Obsidian Sync, creates sync conflicts when merging data.json across devices after file create/delete events. ')
		persistOrderOnCreateDeleteDesc.createEl('a', {
			text: 'Issue #120 discussion',
			href: 'https://github.com/kh4f/flexplorer/issues/120#issuecomment-3782479650',
		})

		new Setting(this.containerEl)
			.setName('New item placement')
			.setDesc('Default placement for new items inside a folder')
			.addDropdown(dropdown => dropdown
				.addOption('top', 'Top')
				.addOption('bottom', 'Bottom')
				.setValue(this.plugin.settings.newItemPlacement)
				.onChange(newItemPlacement => {
					this.plugin.settings.newItemPlacement = newItemPlacement as NewItemPlacement
					void this.plugin.saveSettings()
				}),
			)
		new Setting(this.containerEl)
			.setName('Persist order on create/delete')
			.setDesc(persistOrderOnCreateDeleteDesc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.persistOrderOnCreateDelete)
				.onChange(shouldPersistOrderOnCreateDelete => {
					this.plugin.settings.persistOrderOnCreateDelete = shouldPersistOrderOnCreateDelete
					void this.plugin.saveSettings()
				}),
			)
		new Setting(this.containerEl)
			.setName('Debug mode')
			.setDesc('Show debug logs in the console')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debugMode)
				.onChange(enableDebugMode => {
					this.plugin.settings.debugMode = enableDebugMode
					logger.level = enableDebugMode ? 'debug' : 'silent'
					void this.plugin.saveSettings()
				}),
			)
	}
}