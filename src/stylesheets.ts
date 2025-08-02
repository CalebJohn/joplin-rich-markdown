
// Hack to store created elements so that the can easily be removed (and re-added)
const elements = [
	'focus',
	'stylish',
	'extra_fancy',
	'extra_css_fixes',
];
const idPrefix = "content-script-richMarkdown-link-";

function createElement(name: string, path: string) {
	const element = document.createElement('link');
	element.setAttribute('id', idPrefix + name);
	element.setAttribute('rel', 'stylesheet');
	element.setAttribute('href', path + "/style/" + name + ".css");

	return element;
}

export function refreshStylesheets(cm: any) {
	if (!cm.state.richMarkdown) return;

	cleanup(cm);
	const settings = cm.state.richMarkdown.settings;

	if (settings.focusMode) {
		cm.setOption('styleActiveLine', { nonEmpty: true });
		const element = createElement('focus', settings.cssPath);
		document.head.appendChild(element);
	}
	if (settings.theme == "stylish") {
		const element = createElement('stylish', settings.cssPath);
		document.head.appendChild(element);
	}
	if (settings.extraFancy) {
		cm.setOption('styleActiveLine', { nonEmpty: true });
		const element = createElement('extra_fancy', settings.cssPath);
		document.head.appendChild(element);
	}
	if (settings.extraCSS || settings.extraFancy || settings.theme == "stylish") {
		const element = createElement('extra_css_fixes', settings.cssPath);
		document.head.appendChild(element);
	}
	cm.refresh();
}

function cleanup(cm: any) {
	if (!cm.state.richMarkdown) return;

	for (let element of elements) {
		const el = document.getElementById(idPrefix + element);
		if (el) {
			el.remove();
		}
	}
}
