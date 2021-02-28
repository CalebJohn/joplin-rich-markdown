
// Taken from codemirror/addon/edit/continuelist.js
const checkbox_regex = /^(\s*)([*+-] )\[[Xx ]\]\s.*$/g;
// Last part of regex taken from https://stackoverflow.com/a/17773849/12245502
const link_regex = /(?<!!)\[[^\]]*\]\([^\(]+\)|<[^>]+>|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
const image_regex = /!\[[^\]]*\]\([^\(]+\)/g;
const highlight_regex = /(?<!\\)==[^=\s]*[^=\s\\]==/g;
const header_regex = /^#+\s/g;
// Taken from codemirror/addon/edit/continuelist.js
export const list_token_regex = /^(\s*)([*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]\s))(\s*)/g;

const checkbox_mono_regex = /^(\s*)([*+-] )\[[Xx ]\]\s/g;
const table_regex = /^\|[^\n]+\|/g;

function exec(query: RegExp, stream: any) {
	query.lastIndex = stream.pos;
	return query.exec(stream.string);
}

function regexOverlay(name: string, regex: RegExp, settingName: string) {
	return {
		name: "RichMarkdownOverlay-" + name,
		settingName: settingName,
		token: function(stream: any) {
			const match = exec(regex, stream);
	
			if (match && match.index === stream.pos) {
				// advance
				stream.pos += match[0].length || 1;
				return name;
			}
			else if (match) {
				// jump to the next match
				stream.pos = match.index;
			}
			else {
				stream.skipToEnd();
			}
	
			return null;
		},
	};
}

const overlays = [
	regexOverlay('rm-checkbox', checkbox_regex, null),
	regexOverlay('rm-link', link_regex, null),
	regexOverlay('rm-image', image_regex, null),
	regexOverlay('rm-list-token', list_token_regex, null),
	regexOverlay('rm-header-token', header_regex, 'extraCSS'),
	regexOverlay('search-marker', highlight_regex, 'markHighlight'),
	regexOverlay('rm-monospace', checkbox_mono_regex, 'enforceMono'),
	regexOverlay('rm-monospace', table_regex, 'enforceMono'),
];

export function add(cm: any) {
	for (let overlay of overlays)
		if (!overlay.settingName || cm.state.richMarkdown.settings[overlay.settingName])
			cm.addOverlay(overlay);
}

export function remove(cm: any) {
	for (let overlay of overlays)
		cm.removeOverlay(overlay);
}
