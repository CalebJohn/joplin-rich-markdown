import joplin from 'api';
import { ContentScriptType, MenuItem, MenuItemLocation, ModelType } from 'api/types';

import { getAllSettings, registerAllSettings } from './settings';

import { mime } from '@joplin/lib/mime-utils';

// TODO: Waiting for https://github.com/laurent22/joplin/pull/4509
// import prettier = require('prettier/standalone');
// import markdown = require('prettier/parser-markdown');
import path = require('path');
import { TextItem, TextItemType } from './clickHandlers';

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
			execute: async (coord:any) => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'toggleCheckbox',
					args: [coord],
				});
		  },
		});

		await joplin.commands.register({
			name: 'editor.richMarkdown.copyPathToClipboard',
			execute: async (path:string) => {
				await joplin.clipboard.writeText(path);
			},
		});

		await joplin.workspace.filterEditorContextMenu(async (object:any) => {
			const textItems:TextItem[] = await joplin.commands.execute('editor.execCommand', {
				name: 'getItemsUnderCursor',
			});

			if (!textItems.length) return object;

			const newItems:MenuItem[] = [];

			for (let textItem of textItems) {
				if (textItem.type === TextItemType.Link) {
					newItems.push({
						label: 'Open link',
						commandName: 'app.richMarkdown.openItem',
						commandArgs: [textItem.url],
					});

					const info = parseResourceUrl(textItem.url);
					const itemId = info ? info.itemId : null;
					const itemType = itemId ? await joplin.data.itemType(itemId) : null;

					if (itemType === ModelType.Resource) {
						newItems.push({
							label: 'Reveal file in folder',
							commandName: 'revealResourceFile',
							commandArgs: [itemId],
						});

						const resourcePath = await joplin.data.resourcePath(itemId);

						newItems.push({
							label: 'Copy path to clipboard',
							commandName: 'editor.richMarkdown.copyPathToClipboard',
							commandArgs: [resourcePath],
						});
					}
				} else if (textItem.type === TextItemType.Checkbox) {
					newItems.push({
						label: 'Toggle checkbox',
						commandName: 'editor.richMarkdown.toggleCheckbox',
						commandArgs: [textItem.coord],
					});
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

		await joplin.contentScripts.onMessage(contentScriptId, async (message:any) => {
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

		await (joplin.workspace as any).onResourceChange(async (event:any) => {
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
