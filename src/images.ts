import * as ClickHandlers from './clickHandlers.ts';
import * as Overlay from './overlay.ts';

const image_line_regex = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const image_inline_regex = /!\[([^\]]*)\]\(([^)]+)\)/;
const image_url_regex = /\(([^)]+)\)/;


export function onSourceChanged(cm: any, from: number, to: number) {
	if (!cm.state.richMarkdown) return;

	if (cm.state.richMarkdown.settings.inlineImages)
		check_lines(cm, from, to);
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

	// This should probably be a percentage?
	// We'll need to restore scroll after the images load
	const currentScroll = cm.getScrollInfo();
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

		const match = line.text.match(image_line_regex);
		let img = null;

		if (match) {
			img = await createImage(match[2], match[1], path_from_id);
		}
		else {
			const imgMatch = line.text.match(Overlay.html_image_regex);

			if (imgMatch) {
				img = await createImageFromImg(imgMatch[0], path_from_id)
			}
		}

		if (img) {
			// Joplin doesn't like it when new images are added, particularly when there's
			// already a large number present, the scroll seems to jump to a random position
			// We manually restore the scroll position here, it doesn't prevent jumping
			// But at least puts the user back in the right place
			img.onload = function() { cm.scrollTo(currentScroll.left, currentScroll.top); };
			const wid = cm.addLineWidget(i, img, { className: 'rich-markdown-resource' });
		}
	}
}

async function createImageFromImg(imgTag: string, path_from_id: any) {
	const par = new DOMParser().parseFromString(imgTag, "text/xml");
	const attrs = par.documentElement.attributes;
	const img = await createImage(attrs['src'].value,
													attrs['alt'].value,
													path_from_id);
	img.width = attrs['width'].value;
	// We currently ignore the height value to align with how Joplin renders images
	// img.height = attrs['height'].value;
	// img.style.height = ''; // style is set to auto in createImage; clear it
	return img;
}

async function createImage(path: string, alt: string, path_from_id: any) {
	if (path.startsWith(':/') && path.length == 34) {
		path = await path_from_id(path.substring(2));
	}

	const img = document.createElement('img');
	img.src = path;
	img.alt = alt;
	img.style.maxWidth = '100%';
	img.style.height = 'auto';

	return img;
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
