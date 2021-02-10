const image_line_regex = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/
const image_inline_regex = /!\[([^\]]*)\]\(([^)]+)\)/
module.exports = {
	default: function(context) { 
		return {
			plugin: function(CodeMirror) {
				async function path_from_id(id: string) {
					return await context.postMessage({name:'getResourcePath', id: id});
				}
				async function get_settings() {
					return await context.postMessage({name:'getSettings'});
				}

				async function check_lines(cm: any, from: number, to: number) {
					// We'll need to restore this after the images load
					const currentScroll = cm.getScrollInfo();

					for (let i = from; i <= to; i++) {
						const line = cm.lineInfo(i);
						if (!line) continue;
						const match = line.text.match(image_line_regex);

						if (line.widgets) {
							for (const wid of line.widgets) {
								if (wid.className === 'rich-markdown-resource')
									wid.clear();
							}
						}

						if (match) {
							// If there's a match, then [1] and [2] will be defined
							let alt = match[1];
							let path = match[2];

							if (match[2].startsWith(':/') && match[2].length == 34) {
								path = await path_from_id(match[2].substring(2));
							}

							const img = document.createElement('img');
							img.src = path;
							img.alt = alt;
							img.style.maxWidth = '100%';
							img.style.height = 'auto';
							// Joplin doesn't like it when new images are added, particularly when there's
							// already a large number present, the scroll seems to jump to a random position
							// We manually restore the scroll position here, it doesn't prevent jumping
							// But at least puts the user back in the right place
							img.onload = function() { cm.scrollTo(currentScroll.left, currentScroll.top); };
							const wid = cm.addLineWidget(i, img, { className: 'rich-markdown-resource' });
						}
					}
				}

				function get_change_lines(change: any) {
					// change.from and change.to reflect the change location *before* the edit took place
					// when a larger scale edit happens they don't necessarily reflect the true scope of changes
					const from = change.from.line;
					let to = change.to.line;
					to -= change.removed.length;
					to += change.text.length;

					return { from, to };
				}

				async function on_change(cm: any, change: any) {
					const { from, to } = get_change_lines(change);

					if (cm.state.richMarkdown.settings.inlineImage)
						check_lines(cm, from, to);
				}

				function normalizeCoord(coord: any) {
					if (coord.sticky && coord.sticky === "before")
						return { ch: coord.ch - 1, line: coord.line };

					return coord;
				}

				async function on_mousedown(cm: any, event: any) {
					if (!(event.ctrlKey || event.metaKey)) return;

					const settings = cm.state.richMarkdown.settings;

					if (settings.links && event.target && (
							event.target.classList.contains('cm-link') ||
							event.target.classList.contains('cm-url'))) {
						// In images the cm-link class is used for the alt text
						if (event.target.innerText.match(/\[.*\]/)) return;

						// Only internal links are enabled for now
						if (event.target.innerText.match(/\(:\/.+\)/g)) {
							// TODO: this should be made mroe robust by getting the location
							// of the click and coordsChar seeking the url that way
							const url = event.target.innerText.replace(/[\(\<\:\/\>\)]|\".*\"|\'.*\'/g, '').trim();
							await context.postMessage({name:'openNote', id: url});

							// Don't move the cursor or place extra cursors
							event.preventDefault();
							// Move the cursor, but don't place extras
							// event.codemirrorIgnore = true;
						}
					}
					else if (settings.checkbox && event.target && (
									event.target.classList.contains('cm-meta') ||
									event.target.classList.contains('cm-property'))) {

						const cursor = cm.getCursor();
						const coords = normalizeCoord(cm.coordsChar({left: event.clientX, top: event.clientY}));
						const line = cm.getLine(coords.line);
						const chr = line[coords.ch];

						let from = { line: coords.line, ch: coords.ch };
						let to = { line: coords.line, ch: coords.ch };

						if (chr === ']') {
							from.ch = coords.ch - 1;
						}
						else if (chr === ' ' || chr.toLowerCase() === 'x') {
							to.ch = coords.ch + 1;
						}
						else if (chr === '[') {
							from.ch = coords.ch + 1;
							to.ch = coords.ch + 2;
						}

						const replace = line[from.ch] === ' ' ? 'x' : ' ';

						cm.replaceRange(replace, from, to, '+input');
						cm.setCursor(cursor, null, { scroll: false });

						event.preventDefault();
					}
				}

				function on_mousemove(settings: any) {
					return function(event: any) {
						if (!event.target) return;

						let cursor = '';

						if (settings.links && (
								event.target.classList.contains('cm-link') ||
								event.target.classList.contains('cm-url')) &&
								event.target.innerText.match(/\(:\/.+\)/g)) {
							cursor = 'pointer';
						}

						if (settings.checkbox && (
								event.target.classList.contains('cm-property') ||
								event.target.classList.contains('cm-meta')) &&
								event.target.innerText.match(/\[[\sxX]\]/g)) {
							cursor = 'pointer';
						}

						event.target.style.cursor = (event.ctrlKey || event.metaKey) ? cursor : '';
					}
				}

				CodeMirror.defineOption('enable-rich-mode', false, async function(cm, val, old) {
					// Cleanup
					if (old && old != CodeMirror.Init) {
						cm.off("change", on_change);
						cm.off("mousedown", on_mousedown);
						cm.state.richMarkdown = null;
					}
					// setup
					if (val) {
						const settings = await get_settings();
						cm.state.richMarkdown = {
							settings,
						};

						cm.on('change', on_change);
						cm.on('mousedown', on_mousedown);
						cm.getWrapperElement().onmousemove = on_mousemove(settings);

						if (settings.inlineImage)
							check_lines(cm, cm.firstLine(), cm.lastLine());
					}
				});
			},
			codeMirrorOptions: { 'enable-rich-mode': true },
		}
	},
}
