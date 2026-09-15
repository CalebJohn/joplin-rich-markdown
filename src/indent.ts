// This module is modified from the CodeMirror indent wrap demo
// https://codemirror.net/demo/indentwrap.html

import { list_token_regex } from './overlay';

// These variables are cached when the plugin is loaded
// This stores the width of a space in the current font
let spaceWidth = 0;
// This stores the width of a monospace character using the current monospace font
let monoSpaceWidth = 0;
// This stores the width of the > character in the current font
let blockCharWidth = 0;

// Must be called when the editor is mounted
// Returns whether the widths could be measured, an editor that is mounted while
// hidden (ex. its pane is showing the viewer) has no layout to measure.
export function calculateSpaceWidth(cm: any) {
	spaceWidth = charWidth(cm, ' ', '');
	monoSpaceWidth = charWidth(cm, ' ', 'cm-rm-monospace');
	blockCharWidth = charWidth(cm, '>', '');
	return spaceWidth > 0;
}

// Adapted from codemirror/lib/codemirror.js
function charWidth(cm: any, chr: string, cls: string) {
	const wrapper = cm.getWrapperElement();
	const measure = wrapper && wrapper.getElementsByClassName('CodeMirror-measure')[0];

	// There's nothing to measure against until the editor has been created
	if (!measure) return 0;

	let e = document.createElement('span');
	if (cls)
		e.classList.add(cls);
	e.style.whiteSpace = "pre-wrap";
	e.appendChild(document.createTextNode(chr.repeat(10)))

	if (measure.firstChild)
		measure.removeChild(measure.firstChild);

	measure.appendChild(e);

  const rect = e.getBoundingClientRect()
	const width = (rect.right - rect.left) / 10;

	if (width) return width;

	// A hidden editor has no layout, so the width measured above is always 0.
	// CodeMirror 5 has a fallback for this case, but the CodeMirror 6
	// compatibility layer in Joplin doesn't implement it.
	return typeof cm.defaultCharWidth === 'function' ? cm.defaultCharWidth() : 0;
}

// Adapted from
// https://github.com/codemirror/CodeMirror/blob/master/demo/indentwrap.html
export function onRenderLine(cm: any, line: any, element: HTMLElement, CodeMirror: any) {
	if (!cm.state.richMarkdown) return;

	if (cm.state.richMarkdown.settings.alignIndent) {
		const matches = line.text.match(list_token_regex);
		if (!matches) return;

		let off = CodeMirror.countColumn(line.text, matches[0].length, cm.getOption("tabSize")) * spaceWidth;

		// Special case handling for checkboxes with monospace enabled
		if (cm.state.richMarkdown.settings.enforceMono && matches[0].indexOf('[') > 0) {
			// "- [ ] " is 6 characters
			off += monoSpaceWidth * 6 - spaceWidth * 6;
		}
		else if (cm.state.richMarkdown.settings.enforceMono && matches[0].indexOf('>') >= 0) {
			off += blockCharWidth - spaceWidth;
		}

		element.style.textIndent = "-" + off + "px";
    element.style.paddingLeft = off + "px";
	}
}
