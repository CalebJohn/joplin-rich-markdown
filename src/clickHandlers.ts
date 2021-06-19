import * as Overlay from './overlay.ts';

function normalizeCoord(coord: any) {
	if (coord.sticky && coord.sticky === "before")
		return { ch: coord.ch - 1, line: coord.line };

	return coord;
}

// Only internal links are supported for now
export function isLink(event: MouseEvent) {
	if (!event.target) return false;
	const target = event.target as HTMLElement;

	return target.classList.contains('cm-rm-link');
}

export function isCheckbox(event: MouseEvent) {
	if (!event.target) return false;
	const target = event.target as HTMLElement;

	return target.classList.contains('cm-rm-checkbox');
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
		if (toggleCheckbox(cm, coord))
			return null;
	}

	return null;
}

function getLinkAt(cm: any, coord: any) {
	let { line, ch } = coord;

	const lineText = cm.getLine(line);

	const match = getMatchAt(lineText, Overlay.link_regex, ch);

	if (!match) return;

	let url = '';
	for (let i = 1; i <= 4; i++) {
		url = url || match[i];
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

function toggleCheckbox(cm: any, coord: any) {
	const cursor = cm.getCursor();

	const { line, ch } = coord;
	const lineText = cm.getLine(line);

	const match = getMatchAt(lineText, Overlay.checkbox_regex, ch);

	if (!match || !match[3]) return false;

	let from = lineText.indexOf(match[3])
	let to = from + match[3].length;

	const replace = match[3][1] === ' ' ? '[x]' : '[ ]';

	cm.replaceRange(replace, { ch: from, line }, { ch: to, line }, '+input');
	// This isn't exactly needed, but the replaceRange does move the cursor
	// to the end of the range if the cursor is withing the section that changes
	cm.setCursor(cursor, null, { scroll: false });

	return true;
}

