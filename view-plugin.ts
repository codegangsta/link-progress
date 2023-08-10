import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
} from "@codemirror/view";
import { RangeSet, RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { ProgressWidget } from "./widget";

class ProgressViewPlugin {
	decorations: RangeSet<Decoration>;

	constructor(view: EditorView) {
		this.decorations = this.updateDecorations(view);
	}

	update(update: ViewUpdate) {
		// Optimize this a bit
		if (update.docChanged || update.viewportChanged) {
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
						console.log("LINK NODE: ", node);

						const file = app.metadataCache.getFirstLinkpathDest(
							text.toString(),
							""
						);
						if (!file) return;

						const cache = app.metadataCache.getFileCache(file);
						if (!cache) return;

						const tasks = cache.listItems?.filter(
							(item) => item.task
						);
						if (!tasks) return;

						const incomplete = tasks.filter(
							(task) => task.task == " " || task.task == "/"
						);

						const percent = Math.round(
							((tasks.length - incomplete.length) /
								tasks.length) *
								100
						);

						builder.add(
							node.from,
							node.from,
							Decoration.widget({
								widget: new ProgressWidget(percent),
							})
						);
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
