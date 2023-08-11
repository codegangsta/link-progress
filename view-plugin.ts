import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
} from "@codemirror/view";
import { RangeSet, RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { ProgressWidget } from "widget";

// TODO: Add these as settings
const incompleteChars = [" ", "/"];
const completeChars = ["x", "X", "-"];
const taskChars = [...completeChars, ...incompleteChars];

class ProgressViewPlugin {
	decorations: RangeSet<Decoration>;

	constructor(view: EditorView) {
		this.decorations = this.updateDecorations(view);
	}

	update(update: ViewUpdate) {
		// Optimize this a bit for mobile, use a timer to update
		if (
			update.docChanged ||
			update.viewportChanged ||
			update.focusChanged
		) {
			this.decorations = this.updateDecorations(update.view);
		}
	}

	updateDecorations(view: EditorView) {
		const builder = new RangeSetBuilder<Decoration>();

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.type.name.contains("hmd-internal-link")) {
						// TODO: Handle links with aliases
						const text = view.state.doc.slice(node.from, node.to);

						const file = app.metadataCache.getFirstLinkpathDest(
							text.toString(),
							""
						);
						if (!file) return;

						const cache = app.metadataCache.getFileCache(file);
						if (!cache) return;

						const tasks = cache.listItems?.filter((item) =>
							taskChars.includes(item.task ?? "")
						);
						if (!tasks || tasks.length == 0) return;

						const incomplete = tasks.filter((task) =>
							incompleteChars.includes(task.task ?? "")
						);

						const percent = Math.min(
							Math.round(
								((tasks.length - incomplete.length) /
									tasks.length) *
									100
							),
							99.9
						);

						const parent = node.node.parent;
						if (parent) {
							const text = view.state.doc.sliceString(
								parent.from,
								parent.to
							);
							const mark = text.at(3);
							if (taskChars.includes(mark ?? "") && mark != "-") {
								builder.add(
									parent.from,
									parent.from,
									Decoration.widget({
										widget: new ProgressWidget(
											percent,
											mark ?? " ",
											tasks.length - incomplete.length,
											tasks.length
										),
									})
								);
							}
						}
					}
				},
			});
		}

		return builder.finish();
	}
}

export const viewPlugin = ViewPlugin.fromClass(ProgressViewPlugin, {
	decorations: (v) => v.decorations,
});
