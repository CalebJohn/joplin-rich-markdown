import * as Overlay from './overlay';

function normalizeCoord(coord: any) {
	if (coord.sticky && coord.sticky === "before")
		return { ch: coord.ch - 1, line: coord.line };

	return coord;
}

export function isLink(event: MouseEvent) {
	if (!event.target) return false;
	const target = event.target as HTMLElement;

	return target.matches('.cm-rm-link *, .cm-rm-link') || target.matches('.cm-rm-link-label *, .cm-rm-link-label');
}

export function isCheckbox(event: MouseEvent) {
	if (!event.target) return false;
	const target = event.target as HTMLElement;

	return target.matches('.cm-rm-checkbox *, .cm-rm-checkbox');
}

// Joplin uses es2015 so we don't have matchAll
export function getMatchAt(lineText: string, regex: RegExp, ch: number) {
	let match = null;
	regex.lastIndex = 0;

	if (!regex.global) {
		console.error("getMatchAt requires a global regex; Consider adding a `g` after ${regex}");
		return null;
	}

	do {
		match = regex.exec(lineText);

		if (!match) break;

		const start = match.index;
		const end = start + match[0].length;

		if (start <= ch && ch <= end)
			return match;

	} while (match);

	return null;
}

export function getClickCoord(cm: any, event: MouseEvent) {
	return normalizeCoord(cm.coordsChar({left: event.clientX, top: event.clientY}));
}

export function clickAt(cm: any, coord: any) {
	if (!cm.state.richMarkdown) return;

	const settings = cm.state.richMarkdown.settings;

	if (settings.links) {
		const url = getLinkAt(cm, coord);
		if (url)
			return {name: 'followLink', url };
	}

	if (settings.checkbox) {
		if (toggleCheckbox(cm, coord, ''))
			return null;
	}

	return null;
}

export enum TextItemType {
	Link = 'link',
	Checkbox = 'checkbox',
	Image = 'image',
}

export interface TextItem {
	type: TextItemType;
	coord: any;
	url?: string;
}

export function getItemsAt(cm:any, coord:any):TextItem[] {
	if (!cm.state.richMarkdown) return null;

	const settings = cm.state.richMarkdown.settings;
	let items: TextItem[] = [];

	if (settings.links) {
		const url = getLinkAt(cm, coord);
		if (url) {
			items.push({ type: TextItemType.Link, url, coord });
		}
	}

	if (settings.checkbox) {
		const checkboxInfo = getCheckboxInfo(cm, coord);
		if (checkboxInfo) {
			items.push({ type: TextItemType.Checkbox, coord });
		}
	}

	// no setting yet for html image behaviours, I'm not sure if this is going to mess things
	// up, so reserving it as a future option
	if (true) {
		const url = getRegexAt(cm, coord, Overlay.html_full_image_regex, 2);
		if (url) {
			items.push({ type: TextItemType.Image, url, coord });
		}
	}

	return items;
}

function getLinkAt(cm: any, coord: any) {
	let { line, ch } = coord;

	const lineText = cm.getLine(line);

	const match = getMatchAt(lineText, Overlay.link_regex, ch);

	let url = '';
	if (match) {
		for (let i = 1; i <= 4; i++) {
			url = url || match[i];
		}
	}
	else { // This might be a reference link, check for that
		const reference_match = getMatchAt(lineText, Overlay.link_reference_regex, ch)

		if (!reference_match) return;

		const reference = reference_match[1] || reference_match[2];

		if (reference.trim() === '' || reference.toLowerCase() === 'x') return; // This is a checkbox

		const link_definition_regex = new RegExp(`\\[${reference}\\]:\\s([^\\n]+)`, 'g');

		for (let i = 0; i < cm.lineCount(); i++) {
			// a link reference definition can only be preceded by up to 3
			// spaces, so we will be sure to find a match (if it exists) that
			// contains character 4
			const definition_match = getMatchAt(cm.getLine(i), link_definition_regex, 4);

			if (definition_match) {
				url = definition_match[1];
				break;
			};
		}

		// No match found, just exit
		if (url === '') {
			alert(`No link defintion for [${reference}]. Press Esc to dismiss.`);
			return;
		}
	}

	// Special case, if this matches a link inside of an image, we will need to strip
	// the trailing )
	if (url && url.endsWith(')')) {
		// this is not safe based on RFC 1738 (the ) character is allowd in URLS)
		// so we'll need to do an additional check
		if (getMatchAt(lineText, Overlay.image_regex, ch))
			url = url.slice(0, url.length - 1);
	}
	// URLs inside html elements have a trailing quote character
	else if (url && (url.endsWith('"') || url.endsWith("'"))) {
		// Quotes are not allowed in URLs as per RFC 1738
		// https://www.ietf.org/rfc/rfc1738.txt
		// Page 2 includes a list of unsafe characters
		url = url.slice(0, url.length - 1);
	}

	// Take the first element in case a title has been provided
	// [](https://link.ca "title")
	// spaces are not allowed in urls (RFC 1738) so this is safe
	url = url.split(' ')[0];

	return url;
}

function getRegexAt(cm: any, coord: any, regex: RegExp, groupNum: number) {
	let { line, ch } = coord;

	const lineText = cm.getLine(line);

	const match = getMatchAt(lineText, regex, ch);

	if (match) {
		return match[groupNum];
	}

	return '';
}

function getCheckboxInfo(cm:any, coord:any) {
	const { line, ch } = coord;
	const lineText = cm.getLine(line);

	const match = getMatchAt(lineText, Overlay.checkbox_regex, ch);

	if (!match || !match[3]) return null;

	return { match, lineText, line };
}

function toggleCheckboxInner(cm: any, coord: any, replacement: string) {
	const cursor = cm.getCursor();

	const info = getCheckboxInfo(cm, coord);

	if (!info) return false;

	const { match, line, lineText } = info;

	let from = lineText.indexOf(match[3])
	let to = from + match[3].length;

	let replace = replacement;
	if (replace === '') {
		replace = match[3][1] === ' ' ? '[x]' : '[ ]';
	}

	cm.replaceRange(replace, { ch: from, line }, { ch: to, line }, '+input');
	// This isn't exactly needed, but the replaceRange does move the cursor
	// to the end of the range if the cursor is withing the section that changes
	cm.setCursor(cursor, null, { scroll: false });

	return true;
}

export function toggleCheckbox(cm: any, coord: any, replacement: string) {
	if (!cm.somethingSelected()) {
		return toggleCheckboxInner(cm, coord, replacement);
	}

	for (let selection of cm.listSelections()) {
		let start, end;
		if (selection.anchor.line > selection.head.line) {
			start = selection.head;
			end = selection.anchor;
		} else {
			start = selection.anchor;
			end = selection.head;
		}

		for (let i = start.line; i <= end.line; i++) {
			toggleCheckboxInner(cm, {line: i, ch: 0}, replacement);
		}
	}

	return true;
}

