import { App, Modal, Setting } from 'obsidian'

export class ConfirmModal extends Modal {
	constructor(app: App, private readonly onSubmit: (isConfirmed: boolean) => void) {
		super(app)

		this.setTitle('Flexplorer')
		this.setContent('Save the current sort order as custom?')

		new Setting(this.contentEl)
			.addButton(btn => btn
				.setButtonText('Yes')
				.setCta()
				.onClick(() => {
					this.onSubmit(true)
					this.close()
				}),
			).addButton(btn => btn
				.setButtonText('No')
				.onClick(() => {
					this.onSubmit(false)
					this.close()
				}),
			)
	}
}