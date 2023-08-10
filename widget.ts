import { EditorView, WidgetType } from "@codemirror/view";

export class ProgressWidget extends WidgetType {
	percent: number;
	constructor(percent: number) {
		super();
		this.percent = percent;
	}

	toDOM(view: EditorView) {
		const div = document.createElement("span");
		div.className = "progress-widget";

		div.innerText = this.percent + "%";

		return div;
	}
}
