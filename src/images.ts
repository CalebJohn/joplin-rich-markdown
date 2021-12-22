import * as ClickHandlers from './clickHandlers';
import * as Overlay from './overlay';

export const image_line_regex = /^\s*!\[([^\]]*)\]\((<[^\)]+>|[^)\s]+)[^)]*\)\s*$/;
export const image_inline_regex = /!\[([^\]]*)\]\((<[^\)]+>|[^)\s]+)[^)]*\)/g;
export const html_image_line_regex = /^\s*<img([^>]+?)\/?>\s*$/;


export function onSourceChanged(cm: any, from: number, to: number) {
	if (!cm.state.richMarkdown) return;

	if (cm.state.richMarkdown.settings.inlineImages) {
		check_lines(cm, from, to);
		refreshAllWidgets(cm);
	}
}

export function afterSourceChanges(cm: any) {
	if (!cm.state.richMarkdown) return;

	if (cm.state.richMarkdown.settings.imageHover)
		update_hover_widgets(cm);
}

async function getImageData(cm: any, coord: any) {
	let { line, ch } = coord;

	const lineText = cm.getLine(line);

	const match = ClickHandlers.getMatchAt(lineText, image_inline_regex, ch);
	let img = null;

	if (match) {
		img = await createImage(match[2], match[1], cm.state.richMarkdown.path_from_id);
	}
	else {
		const imgMatch = ClickHandlers.getMatchAt(lineText, Overlay.html_image_regex, ch);

		if (imgMatch) {
			img = await createImageFromImg(imgMatch[0], cm.state.richMarkdown.path_from_id);
		}
	}

	return img;
}

function open_widget(cm: any) {
	return async function(event: MouseEvent) {
		if (!event.target) return;
		if (!cm.state.richMarkdown) return;
		if (!cm.state.richMarkdown.settings.imageHover) return;
		// This shortcut is only enabled for the ctrl case because in the default case I would
		// prefer to accidentally display 2 images rather than not dislpay anything
		if (!cm.state.richMarkdown.settings.imageHoverCtrl &&
				(!(event.ctrlKey || event.altKey) || cm.state.richMarkdown.isMouseHovering)) return;

		cm.state.richMarkdown.isMouseHovering = true;

		const target = event.target as HTMLElement;
		if (!target.offsetParent) return;

		// This already has the image rendered inline
		if (cm.state.richMarkdown.settings.inlineImages && target.parentNode.childNodes.length <= 3)
			return;

		const img = await getImageData(cm, ClickHandlers.getClickCoord(cm, event));
		if (!img) return;

		// manual zoom
		if (img.style.zoom) {
			let zoom = parseFloat(img.style.zoom);
			if (img.style.zoom.endsWith('%')){
				zoom /= 100
			}
			if (zoom) {
				img.width *= zoom
				img.height *= zoom
				img.style.zoom = '100%';
			}
		}

		img.style.visibility = 'hidden';
		target.offsetParent.appendChild(img);
		img.style.position = 'absolute';
		img.style.zIndex = '1000';
		img.classList.add('rich-markdown-hover-image');
		img.onload = function() {
			if (!cm.state.richMarkdown) return;
			if (!cm.state.richMarkdown.isMouseHovering) {
				img.remove();
				return;
			}

			let im = this as HTMLElement;
			const par = target.offsetParent as HTMLElement;
			const { right, width } = par.getBoundingClientRect();

			let x = 0;
			if (im.clientWidth < width) {
				x = Math.min(event.clientX, right - im.clientWidth);
			}

			const coords = cm.coordsChar({left: x, top: event.clientY}, 'page');

			im.style.visibility = 'visible';
			cm.addWidget(coords, img, false);
		}
	}
}

function clearHoverImages(cm: any) {
	const widgets = cm.getWrapperElement().getElementsByClassName('rich-markdown-hover-image');

	// Removed widgets are simultaneously removed from this array
	// we need to iterate backwards to prevent the array from changing on us
	for (let i = widgets.length -1; i >= 0; i--) {
		widgets[i].remove();
	}
}

function close_widget(cm: any) {
	return function(event: MouseEvent) {
		if (cm.state.richMarkdown)
			cm.state.richMarkdown.isMouseHovering = false;

		clearHoverImages(cm);
	}
}

function update_hover_widgets(cm: any) {
	if (!cm.state.richMarkdown) return;

	const images = cm.getWrapperElement().getElementsByClassName("cm-rm-image");

	for (let image of images) {
			image.onmouseenter = open_widget(cm);
			image.onmouseleave = close_widget(cm);
			if (!cm.state.richMarkdown.settings.imageHoverCtrl) {
				image.onmousemove = open_widget(cm);
			}
	}
}

async function check_lines(cm: any, from: number, to: number) {
	if (!cm.state.richMarkdown) return;

	const path_from_id = cm.state.richMarkdown.path_from_id;

	for (let i = from; i <= to; i++) {
		const line = cm.lineInfo(i);

		if (line.widgets) {
			for (const wid of line.widgets) {
				if (wid.className === 'rich-markdown-resource')
					wid.clear();
			}
		}

		if (!line) continue;
		const state = cm.getStateAfter(i, true);

		// Don't render inline images inside of code blocks
		if (state?.outer && (state?.outer?.code || (state?.outer?.thisLine?.fencedCodeEnd))) {
			continue;
		}

		const match = line.text.match(image_line_regex);
		let img = null;

		if (match) {
			img = await createImage(match[2], match[1], path_from_id);
		}
		else {
			const imgMatch = line.text.match(html_image_line_regex);

			if (imgMatch) {
				img = await createImageFromImg(imgMatch[0], path_from_id)
			}
		}

		if (img) {
			const wid = cm.addLineWidget(i, img, { className: 'rich-markdown-resource' });
		}
	}
}

async function createImageFromImg(imgTag: string, path_from_id: any) {
	const par = new DOMParser().parseFromString(imgTag, "text/html");
	const img = par.body.firstChild as HTMLImageElement;
	img.style.height = img.style.height || 'auto';
	img.style.maxWidth = img.style.maxWidth || '100%';

	// Tags taken from
	// https://github.com/laurent22/joplin/blob/80b16dd17e227e3f538aa221d7b6cc2d81688e72/packages/renderer/htmlUtils.ts
	const disallowedTags = ['script', 'noscript', 'iframe', 'frameset', 'frame', 'object', 'base', 'embed', 'link', 'meta'];
	for (let i = 0; i < img.attributes.length; i++) {
		const name = img.attributes[i].name;
		if (disallowedTags.includes(name) || name.startsWith('on')) {
			img.attributes[i].value = ''
		}
	}

	// Joplin resource paths get added on to the end of the local path for some reason
	if (img.src.length >= 34) {
		const id = img.src.substring(img.src.length - 34);
		if (id.startsWith(':/')) {
			img.src = await path_from_id(id.substring(2));
		}
	}

	return img;
}

async function createImage(path: string, alt: string, path_from_id: any) {
	if (path.startsWith(':/') && path.length == 34) {
		path = await path_from_id(path.substring(2));
	}
	if (path.startsWith('<') && path.endsWith('>')) {
		// <> quotes are not allowed in URLs as per RFC 1738
		// https://www.ietf.org/rfc/rfc1738.txt
		// Page 2 includes a list of unsafe characters
		path = path.substring(1, path.length - 1);
	}

	const img = document.createElement('img');
	img.src = path
	img.alt = alt;
	img.style.maxWidth = '100%';
	img.style.height = 'auto';

	return img;
}

// This function updates the timestamp of each image that is rendered in the editor
// This signals the internal rendering engine to reload the image from disk
// This is a cheaters way of having images respond to on disk changes. It's not very performant
// so it will need to be replaced eventually
export function refreshAllWidgets(cm: any) {
	for (let i = cm.firstLine(); i <= cm.lastLine(); i++) {
		const line = cm.lineInfo(i);

		const timestamp = new Date().getTime();
		let path = '';
		if (line.widgets) {
			for (const wid of line.widgets) {
				if (wid.className === 'rich-markdown-resource') {
					path = wid.node.src.split("?t=")[0];
					const width = wid.node.width;
					const height = wid.node.height;
					wid.node.onload = function() {
						let im = this as HTMLElement;
						if (im.clientWidth != width || im.clientHeight != height) {
							cm.refresh();
						}
					};
					wid.node.src = `${path}?t=${timestamp}`;
				}
			}
		}
	}
}

// Used on cleanup
export function clearAllWidgets(cm: any) {
	clearHoverImages(cm);

	for (let i = cm.firstLine(); i <= cm.lastLine(); i++) {
		const line = cm.lineInfo(i);

		if (line.widgets) {
			for (const wid of line.widgets) {
				if (wid.className === 'rich-markdown-resource')
					wid.clear();
			}
		}
	}

	// Refresh codemirror to make sure everything is sized correctly
	cm.refresh();
}

