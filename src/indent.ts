// This module is modified from the CodeMirror indent wrap demo
// https://codemirror.net/demo/indentwrap.html

import { list_token_regex } from './overlay';

let spaceWidth = 0

// Must be called when the editor is mounted
// Adapted from codemirror/lib/codemirror.js
export function calculateSpaceWidth(cm: any) {
	let e = document.createElement('span');
	e.style.whiteSpace = "pre-wrap";
	e.appendChild(document.createTextNode('          '))

	const measure = cm.getWrapperElement().getElementsByClassName('CodeMirror-measure')[0];
	if (measure.firstChild)
		measure.removeChild(measure.firstChild);

	measure.appendChild(e);

  const rect = e.getBoundingClientRect()
	const width = (rect.right - rect.left) / 10;

  spaceWidth = width || cm.defaultCharWidth();
}

// Adapted from
// https://github.com/codemirror/CodeMirror/blob/master/demo/indentwrap.html
export function onRenderLine(cm: any, line: any, element: HTMLElement, CodeMirror: any) {
	if (!cm.state.richMarkdown) return;

	if (cm.state.richMarkdown.settings.alignIndent) {
		const matches = line.text.match(list_token_regex);
		if (!matches) return;

		const off = CodeMirror.countColumn(line.text, matches[0].length, cm.getOption("tabSize")) * spaceWidth;
		element.style.textIndent = "-" + off + "px";
    element.style.paddingLeft = off + "px";
	}
}
