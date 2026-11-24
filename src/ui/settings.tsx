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
				desc: 'Placement of new items inside a folder',
				control: {
					type: 'dropdown',
					key: 'newItemPlacement',
					defaultValue: 'top',
					options: { top: 'Top', bottom: 'Bottom' },
				},
			},
			{
				name: 'Copy placement',
				desc: 'Placement of copied items relative to their originals',
				control: {
					type: 'dropdown',
					key: 'copyPlacement',
					defaultValue: 'above',
					options: { above: 'Above', below: 'Below' },
				},
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
						`in the root folder's sort menu.`)
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
				name: 'Persist order on create/delete',
				desc: createFragment(frag => {
					frag.append('Save the custom order to data.json immediately after files are created or deleted. ' +
						'Disable this if you sync your vault in real time ' +
						'(e.g. via Obsidian Sync, Google Drive, or iCloud) ' +
						'while Obsidian is running on multiple devices. ' +
						'Changes will then be saved later, after a drag-and-drop operation or an Obsidian restart.')
					frag.createEl('br')
					frag.createEl('a', {
						text: '(Issue #120)',
						href: 'https://github.com/kh4f/flexplorer/issues/120#issuecomment-3782479650',
					})
				}),
				control: { type: 'toggle', key: 'persistOrderOnCreateDelete' },
			},
			{
				name: 'Folders first',
				desc: 'Group folders above files, matching the default Obsidian explorer behaviour. ' +
					'This applies to the name- and time-based sort orders, and also to folders mounted ' +
					'by external tools such as Folder Bridge. Custom order always follows the saved arrangement. ' +
					'Disable it to list folders and files together, ordered by the active sort instead.',
				// `render` instead of `control`: toggling this needs an immediate re-sort
				render: setting => void setting.addToggle(toggle => toggle
					.setValue(this.plugin.settings.foldersFirst)
					.onChange(foldersFirst => {
						this.plugin.settings.foldersFirst = foldersFirst
						void this.plugin.saveSettings()
						this.plugin.sortExplorer()
					}),
				),
			},
			{
				name: 'Store item timestamps',
				desc: createFragment(frag => {
					frag.append('Record each item\'s creation and modification time in data.json. ' +
						'These values are only used by the "Created time" and "Modified time" sort options. ' +
						'When disabled, new entries omit them, existing ones stop updating, and those sort ' +
						'options are hidden from the sort menu. Folders using them fall back to custom ' +
						'order or file name; re-enabling does not restore those sorts automatically.')
					frag.createEl('br')
					frag.createEl('br')
					frag.append('Disable this if you sync your vault across devices, ' +
						'or commit it to a git repository (e.g. with the Git plugin): ' +
						'the timestamps change on every sync and produce noisy ' +
						'diffs and merge conflicts in data.json.')
				}),
				// `render` instead of `control`: toggling must normalise state and re-sort
				render: setting => void setting.addToggle(toggle => toggle
					.setValue(this.plugin.settings.storeItemTimestamps)
					.onChange(storeItemTimestamps => {
						this.plugin.settings.storeItemTimestamps = storeItemTimestamps
						void this.plugin.saveSettings()
						this.plugin.normaliseTimestampState()
						this.plugin.sortExplorer()
					}),
				),
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