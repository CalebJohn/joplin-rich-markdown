import type { Decoration, DecorationSet, PluginValue } from '@codemirror/view';
import { require_codemirror_view, require_codemirror_state, require_codemirror_language } from "./cm6Requires";

function calculateIndent(indentStr, tabSize) {
	let width = 0;
	let hasTab = false;
	for (let i = 0; i < indentStr.length; i++) {
		if (indentStr[i] === '\t') {
			// Round up to next tab stop
			width = Math.ceil((width + 1) / tabSize) * tabSize;
			hasTab = true;
		} else {
			width += 1;
		}
	}
	return { width, hasTab };
}

function createListIndentPlugin() {
	const { RangeSetBuilder } = require_codemirror_state();
	const { Decoration, ViewPlugin } = require_codemirror_view();
	const { getIndentUnit, syntaxTree } = require_codemirror_language();

	const wrapIndent = (indent, hasTab) => Decoration.line({
		// For some off reason, chrome needs the text-indent to be slightly larger than the tab
		// stop to get actual indentation happening, so we fudge it with a 1.
		attributes: { style: `text-indent: -${indent + (hasTab ? 1 : 0)}ch; padding-left: ${indent}ch;` }
	});

	const listMarkerRegex = /^(\s*)([-*+>](?:\s\[[Xx ]\])?|\d+[.)]|) /;

	return ViewPlugin.fromClass(class implements PluginValue {
		decorations!: DecorationSet;

		constructor(view) {
			this.decorations = this.buildDecorations(view);
		}
		
		update(update) {
			if (update.docChanged || update.viewportChanged) {
				this.decorations = this.buildDecorations(update.view);
			}
		}

		buildDecorations(view) {
			const builder = new RangeSetBuilder<Decoration>();
			const tree = syntaxTree(view.state);
			
			const tabSize = view.state.tabSize || 6;
			
			tree.iterate({
				enter: (node) => {
					if (node.name === "ListItem" || node.name == "Blockquote") {
						const line = view.state.doc.lineAt(node.from);
						const lineText = line.text;
						const match = listMarkerRegex.exec(lineText);
						
						if (match) {
							const indentStr = match[1];
							const marker = match[2];
							
							// Calculate visual width of indentation
							const { width, hasTab } = calculateIndent(indentStr, tabSize);
							
							// +1 for the space after the marker
							const markerWidth = marker.length + 1;
							// Chrome insists on using tab stops so line indentation needs to be a multiple
							// of the tab stop, which also means that we can't align the indented lines with
							// the marker :'(
							const totalIndent = width + (hasTab ? 0 : markerWidth);
							
							builder.add(line.from, line.from, wrapIndent(totalIndent, hasTab));
						}
					}
				}
			})
			
			return builder.finish();
		}
	}, {
		decorations: v => v.decorations,
	})
}

export const listIndent = () => {
	const { EditorView } = require_codemirror_view();
	return [
		EditorView.lineWrapping,
		createListIndentPlugin()
	];
}
