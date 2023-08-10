import { EditorView, WidgetType } from "@codemirror/view";

export class ProgressWidget extends WidgetType {
	percent: number;
	task: string;
	done: number;
	total: number;

	constructor(percent: number, task: string, done: number, total: number) {
		super();
		this.percent = percent;
		this.task = task;
		this.done = done;
		this.total = total;
	}

	toDOM(view: EditorView) {
		const checked = this.task == "x" || this.task == "X";
		const div = document.createElement("div");
		div.className = "progress-widget";

		if (checked) {
			div.classList.add("complete");
		}
		div.style.animationDelay = "-" + this.percent + "s";

		const input = document.createElement("input");
		input.type = "checkbox";
		input.className = "progress-widget-checkbox task-list-checkbox";
		input.checked = checked;
		div.appendChild(input);

		const label = document.createElement("div");
		label.innerText = `${this.done} out of ${this.total} tasks complete`;
		label.className = "tooltip";
		div.appendChild(label);

		return div;
	}
}
