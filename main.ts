import { Plugin } from "obsidian";
import { viewPlugin } from "view-plugin";

// Remember to rename these classes and interfaces!

interface LinkProgressSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: LinkProgressSettings = {
	mySetting: "default",
};

export default class LinkProgress extends Plugin {
	settings: LinkProgressSettings;

	async onload() {
		await this.loadSettings();

		this.registerEditorExtension(viewPlugin);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
