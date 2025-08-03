import joplin from 'api';
import { ContentScriptType, MenuItem, MenuItemLocation, ModelType } from 'api/types';
import { getAllSettings, registerAllSettings } from './settings';

// TODO: Waiting for https://github.com/laurent22/joplin/pull/4509
// import prettier = require('prettier/standalone');
// import markdown = require('prettier/parser-markdown');
import { TextItem, TextItemType } from './clickHandlers';
import { isSupportedImageMimeType, isSupportedOcrMimeType } from './images';
import { imageToDataURL } from './imageData';

const fs = joplin.require('fs-extra');
const { parseResourceUrl } = require('@joplin/lib/urlUtils');

const contentScriptId = 'richMarkdownEditor';

joplin.plugins.register({
	onStart: async function() {
		// There is a bug (race condition?) where the perform action command
		// doesn't always work when first opening the app. Opening the keyboard
		// shortcuts will properly bind it and make it work.
		// Placing the command before registering settings also seems to fix it
		await joplin.commands.register({
			name: 'editor.richMarkdown.clickAtCursor',
			label: 'Perform action',
			iconName: 'fas fa-link',
			execute: async () => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'clickUnderCursor',
				});
			},
		});
		await joplin.views.menuItems.create('richMarkdownClickAtCursor', 'editor.richMarkdown.clickAtCursor', MenuItemLocation.Note, { accelerator: 'Ctrl+Enter' });

		// TODO: See about getting this same behaviour into the openItem function
		await joplin.commands.register({
			name: 'app.richMarkdown.openItem',
			execute: async (url: string) => {
				// From RFC 1738 Page 1 a url is <scheme>:<scheme specific part>
				// the below regex implements matching for the scheme (with support for uppercase)
				// urls without a scheme will be assumed http
				if (!url.startsWith(':/') && !url.match(/^(?:[a-zA-Z0-9\+\.\-])+:/)) {
					url = 'http://' + url;
				}
				await joplin.commands.execute('openItem', url);
			},
		});

		await joplin.commands.register({
			name: 'editor.richMarkdown.toggleCheckbox',
			execute: async (coord: any) => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'toggleCheckbox',
					args: [coord],
				});
			},
		});
		await joplin.commands.register({
			name: 'editor.richMarkdown.checkCheckbox',
			execute: async (coord: any) => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'checkCheckbox',
					args: [coord],
				});
			},
		});
		await joplin.commands.register({
			name: 'editor.richMarkdown.uncheckCheckbox',
			execute: async (coord: any) => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'uncheckCheckbox',
					args: [coord],
				});
			},
		});

		await joplin.commands.register({
			name: 'editor.richMarkdown.copyImage',
			execute: async (itemId: string) => {
				const resource = await joplin.data.get(['resources', itemId], { fields: ['mime'] });
				const resourcePath = await joplin.data.resourcePath(itemId);
				const dataUrl = await imageToDataURL(resourcePath, resource.mime);
				await joplin.clipboard.writeImage(dataUrl);
			},
		});

		await joplin.commands.register({
			name: 'editor.richMarkdown.viewOcrText',
			execute: async (itemId: string) => {
				const resource = await joplin.data.get(['resources', itemId], { fields: ['id', 'mime', 'ocr_text', 'ocr_status'] });
				if (resource.ocr_status === 2) { // ResourceOcrStatus.Done
					const tempFilePath = `${await joplin.plugins.dataDir()}/${resource.id}_ocr.txt`;
					await fs.writeFile(tempFilePath, resource.ocr_text, 'utf8');
					const fileUrl = `file://${tempFilePath.replace(/\\/g, '/')}`;
					await joplin.commands.execute('openItem', fileUrl);
				} else {
					console.info(`OCR of resource ${itemId} is not ready yet ${resource.ocr_status}`);
				}
			},
		});

		await joplin.commands.register({
			name: 'editor.richMarkdown.copyPathToClipboard',
			execute: async (path: string) => {
				await joplin.clipboard.writeText(path);
			},
		});

		await joplin.workspace.filterEditorContextMenu(async (object: any) => {
			const textItems: TextItem[] = await joplin.commands.execute('editor.execCommand', {
				name: 'getItemsUnderCursor',
			});
			const selection = await joplin.commands.execute('selectedText');

			if (!textItems.length) return object;

			const newItems: MenuItem[] = [];

			for (let textItem of textItems) {
				if (textItem.type === TextItemType.Link || textItem.type === TextItemType.Image) {
					newItems.push({
						label: 'Open link',
						commandName: 'app.richMarkdown.openItem',
						commandArgs: [textItem.url],
					});

					const info = parseResourceUrl(textItem.url);
					const itemId = info ? info.itemId : null;
					const itemType = itemId ? await joplin.data.itemType(itemId) : null;
					let urlToCopy = textItem.url;
					let urlType = 'link';

					if (itemType === ModelType.Resource) {
						const resource = await joplin.data.get(['resources', itemId], { fields: ['mime'] });
						
						newItems.push({
							label: 'Reveal file in folder',
							commandName: 'revealResourceFile',
							commandArgs: [itemId],
						});

						if (isSupportedOcrMimeType(resource.mime)) {
							newItems.push({
								label: 'View OCR text',
								commandName: 'editor.richMarkdown.viewOcrText',
								commandArgs: [itemId],
							});
						}

						if (isSupportedImageMimeType(resource.mime)) {
							newItems.push({
								label: 'Copy image',
								commandName: 'editor.richMarkdown.copyImage',
								commandArgs: [itemId],
							});
						}

						urlToCopy = await joplin.data.resourcePath(itemId);
						urlType = 'path';
					}

					newItems.push({
						label: `Copy ${urlType} to clipboard`,
						commandName: 'editor.richMarkdown.copyPathToClipboard',
						commandArgs: [urlToCopy],
					});
				} else if (textItem.type === TextItemType.Checkbox) {
					const newlineRegex = /[\r\n]/;
					if (newlineRegex.test(selection)) {
						newItems.push({
							label: 'Toggle all',
							commandName: 'editor.richMarkdown.toggleCheckbox',
							commandArgs: [textItem.coord],
						});
						newItems.push({
							label: 'Uncheck all',
							commandName: 'editor.richMarkdown.uncheckCheckbox',
							commandArgs: [textItem.coord],
						});
						newItems.push({
							label: 'Check all',
							commandName: 'editor.richMarkdown.checkCheckbox',
							commandArgs: [textItem.coord],
						});
					} else {
						newItems.push({
							label: 'Toggle checkbox',
							commandName: 'editor.richMarkdown.toggleCheckbox',
							commandArgs: [textItem.coord],
						});
					}
				}
			}

			if (newItems.length) {
				newItems.splice(0, 0, {
					type: 'separator',
				});

				object.items = object.items.concat(newItems);
			}

			return object;
		});

		await registerAllSettings();

		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			contentScriptId,
			'./richMarkdown.js'
		);

		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {
			if (message.name === 'getResourcePath') {
				return await joplin.data.resourcePath(message.id);
			}
			else if (message.name === 'getSettings') {
				return await getAllSettings();
			}
			else if (message.name === 'followLink') {
				await joplin.commands.execute('app.richMarkdown.openItem', message.url);
			}

			return "Error: " + message + " is not a valid message";
		});

		await (joplin.workspace as any).onResourceChange(async (event: any) => {
			await joplin.commands.execute('editor.execCommand', {
				name: 'refreshResource',
				args: [event.id],
			});
		});

		// TODO: Waiting for https://github.com/laurent22/joplin/pull/4509
		// await joplin.commands.register({
		//     name: 'editor.richMarkdown.prettifySelection',
		//     label: 'Prettify Selection',
		//     iconName: 'fas fa-rocket',
		//     execute: async () => {
		// 			const text =  await joplin.commands.execute('selectedText');
		// 			const formatted = prettier.format(text, { parser: 'markdown', plugins: [markdown] });

		// 			await joplin.commands.execute('replaceSelection', formatted);
		//     },
		// });
		// await joplin.views.menuItems.create('prettifySelectionContext', 'editor.richMarkdown.prettifySelection', MenuItemLocation.EditorContextMenu);
		// await joplin.views.menuItems.create('prettifySelectionEdit', 'editor.richMarkdown.prettifySelection', MenuItemLocation.Edit);
		// await joplin.views.toolbarButtons.create('prettifySelectionToolbar', 'editor.richMarkdown.prettifySelection', ToolbarButtonLocation.EditorToolbar);
	},
});
