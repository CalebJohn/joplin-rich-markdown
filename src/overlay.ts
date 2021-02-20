
// Taken from codemirror/addon/edit/continuelist.js
const checkbox_regex = /^(\s*)([*+-] )\[[Xx ]\]\s.*$/g;
// Last part of regex taken from https://stackoverflow.com/a/17773849/12245502
const link_regex = /(?<!!)\[[^\]]*\]\([^\(]+\)|<[^>]+>|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
const image_regex = /!\[[^\]]*\]\([^\(]+\)/g;

function exec(query: RegExp, stream: any) {
	query.lastIndex = stream.pos;
	return query.exec(stream.string);
}

function advance(match: any, stream: any) {
	stream.pos += match[0].length || 1;
}

function jump_to_match(c: any, l: any, i: any, stream: any) {
	let min_index = Infinity;

	if (c && c.index < min_index) {
		min_index = c.index;
	}
	else if (l && l.index < min_index) {
		min_index = l.index;
	}
	else if (i && i.index < min_index) {
		min_index = i.index;
	}

	if (min_index < Infinity)
		stream.pos = min_index;
}

export const overlay = {
	name: "RichMarkdownOverlay",
	token: function(stream: any) {
		const cmatch = exec(checkbox_regex, stream);
		const lmatch = exec(link_regex, stream);
		const imatch = exec(image_regex, stream);

		if (cmatch && cmatch.index === stream.pos) {
			advance(cmatch, stream);
			return 'rm-checkbox';
		}
		else if (lmatch && lmatch.index === stream.pos) {
			advance(lmatch, stream);
			return 'rm-link';
		}
		else if (imatch && imatch.index === stream.pos) {
			advance(imatch, stream);
			return 'rm-image';
		}
		else if (cmatch || lmatch || imatch) {
			jump_to_match(cmatch, lmatch, imatch, stream);
		}
		else {
			stream.skipToEnd();
		}

		return null;
	},
};

