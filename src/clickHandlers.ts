
const checkbox_regex = /^(\s*)([*+-] )(\[[Xx ]\])\s.*$/g;
const linkRegex = /\([^\(]+\)|<[^>]+>|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
const link_regex = /(?<!!)\[[^\]]*\]\(([^\(]+)\)|<([^>]+)>/g;

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
	// return (target.classList.contains('cm-rm-link') &&
	// 				target.innerText.match(/\(:\/.+\)/g));
					// && !target.innerText.match(/\[.*\]/));
}

export function isCheckbox(event: MouseEvent) {
	if (!event.target) return false;
	const target = event.target as HTMLElement;

	return target.classList.contains('cm-rm-checkbox');
}

function getMatchAt(line: string, regex: RegExp, ch: number) {
	let match = null;
	regex.lastIndex = 0;

	do {
		match = regex.exec(line);

		if (!match) break;

		const start = line.indexOf(match[0]);
		const end = start + match[0].length;

		if (start <= ch && ch <= end)
			return match;

	} while (match);

	return null;
}

// This function doesn't use coordsChar because it doesn't need to write back to the line
// i.e. this function only needs to read a link, not modify it, so DOM methods are good enough
export function getLinkUrl(event: MouseEvent) {
	const target = event.target as HTMLElement;

	let text = target.innerText;

	if (target.nextElementSibling) {
		const sibling = target.nextElementSibling as HTMLElement;

		if (sibling.innerText.match(linkRegex))
			text = sibling.innerText;
	}

	if (!text.match(linkRegex)) return;

	const url = text.replace(/[\(\<\>\)]|\".*\"|\'.*\'/g, '').trim();

	// Don't move the cursor or place extra cursors
	event.preventDefault();
	// Move the cursor, but don't place extras
	// event.codemirrorIgnore = true;

	return url;
}

export function toggleCheckbox(cm: any, event: MouseEvent) {
	const cursor = cm.getCursor();
	const { line, ch } = normalizeCoord(cm.coordsChar({left: event.clientX, top: event.clientY}));
	const lineText = cm.getLine(line);

	const match = getMatchAt(lineText, checkbox_regex, ch);

	if (!match || !match[3]) return;

	let from = lineText.indexOf(match[3])
	let to = from + match[3].length;

	const replace = match[3][1] === ' ' ? '[x]' : '[ ]';

	cm.replaceRange(replace, { ch: from, line }, { ch: to, line }, '+input');
	cm.setCursor(cursor, null, { scroll: false });

	event.preventDefault();
}

