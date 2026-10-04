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
				name: 'Hide patterns',
				desc: createFragment(frag => {
					frag.append('Patterns matching items to hide, one per line.')
					frag.createEl('ul', undefined, list => {
						list.createEl('li', undefined, li => {
							li.createEl('code', { text: '*' })
							li.append(' — zero or more characters, except ')
							li.createEl('code', { text: '/' })
						})
						list.createEl('li', undefined, li => {
							li.createEl('code', { text: '**' })
							li.append(' — zero or more characters, including ')
							li.createEl('code', { text: '/' })
						})
						list.createEl('li', undefined, li => {
							li.createEl('code', { text: '?' })
							li.append(' — a single character, except ')
							li.createEl('code', { text: '/' })
						})
						list.createEl('li', undefined, li => {
							li.createEl('code', { text: '/pattern' })
							li.append(' — match from the root folder only')
						})
					})
					frag.append('Both pattern- and manually-hidden items can be revealed via "Show hidden" ' +
						`in the explorer's sort menu.`)
				}),
				// `render` instead of `control`: a multi-line textarea needs custom wiring
				render: setting => void setting.addTextArea(ta => {
					ta.inputEl.rows = 7
					ta.inputEl.cols = 30
					return ta
						.setPlaceholder('any-1?3-*.md\n' +
							'/only-root.md\n' +
							'*/nested.*\n' +
							'deep/**/nested.png')
						.setValue(this.plugin.settings.hidePatterns.join('\n'))
						.onChange(value => {
							this.plugin.settings.hidePatterns = value.split('\n')
							this.plugin.hideManager.syncRegexes()
							void this.plugin.saveSettings()
							this.plugin.explorerManager.syncIndicators()
						})
				}),
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