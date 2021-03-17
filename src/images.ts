
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

function open_widget(cm: any, path: string, alt: string) {
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

		const img = await createImage(path, alt, cm.state.richMarkdown.path_from_id);
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
		// cm-rm-image matches all parts of an image, we just want the url
		if (image.innerText.startsWith('(')) {
			let url = image.innerText.replace(/[\(\)]/g, '');
			// Special case for when the "url" is a cm-rm-link
			// This might not be a long term patch
			if (!url && image.nextElementSibling) {
				url = image.nextElementSibling.innerText.replace(/[\(\)]/g, '');
			}

			const altElement = image.previousElementSibling;
			const alt = altElement.innerText.replace(/[\[\]]/g, '');
			const markElement = altElement.previousElementSibling;

			image.onmouseenter = open_widget(cm, url, alt);
			image.onmouseleave = close_widget(cm);
			altElement.onmouseenter = open_widget(cm, url, alt);
			altElement.onmouseleave = close_widget(cm);
			markElement.onmouseenter = open_widget(cm, url, alt);
			markElement.onmouseleave = close_widget(cm);
			if (image.nextElementSibling) {
				image.nextElementSibling.onmouseenter = open_widget(cm, url, alt);
				image.nextElementSibling.onmouseleave = close_widget(cm);
			}
			if (!cm.state.richMarkdown.settings.imageHoverCtrl) {
				image.onmousemove = open_widget(cm, url, alt);
				altElement.onmousemove = open_widget(cm, url, alt);
				markElement.onmousemove = open_widget(cm, url, alt);
				if (image.nextElementSibling)
					image.nextElementSibling.onmousemove = open_widget(cm, url, alt);
			}
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

		if (match) {
			const img = await createImage(match[2], match[1], path_from_id);
			// Joplin doesn't like it when new images are added, particularly when there's
			// already a large number present, the scroll seems to jump to a random position
			// We manually restore the scroll position here, it doesn't prevent jumping
			// But at least puts the user back in the right place
			img.onload = function() { cm.scrollTo(currentScroll.left, currentScroll.top); };
			const wid = cm.addLineWidget(i, img, { className: 'rich-markdown-resource' });
		}
	}
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
