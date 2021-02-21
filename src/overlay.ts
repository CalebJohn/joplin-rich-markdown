
// Taken from codemirror/addon/edit/continuelist.js
const checkbox_regex = /^(\s*)([*+-] )\[[Xx ]\]\s.*$/g;
// Last part of regex taken from https://stackoverflow.com/a/17773849/12245502
const link_regex = /(?<!!)\[[^\]]*\]\([^\(]+\)|<[^>]+>|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
const image_regex = /!\[[^\]]*\]\([^\(]+\)/g;

function exec(query: RegExp, stream: any) {
	query.lastIndex = stream.pos;
	return query.exec(stream.string);
}

function regexOverlay(name: string, regex: RegExp) {
	return {
		name: "RichMarkdownOverlay-" + name,
		token: function(stream: any) {
			const match = exec(regex, stream);
	
			if (match && match.index === stream.pos) {
				// advance
				stream.pos += match[0].length || 1;
				return 'rm-' + name;
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
	regexOverlay('checkbox', checkbox_regex),
	regexOverlay('link', link_regex),
	regexOverlay('image', image_regex),
];

export function add(cm: any) {
	for (let overlay of overlays)
		cm.addOverlay(overlay);
}

export function remove(cm: any) {
	for (let overlay of overlays)
		cm.removeOverlay(overlay);
}
