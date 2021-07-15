import joplin from 'api';
import { ContentScriptType, MenuItemLocation, Path, ToolbarButtonLocation } from 'api/types';

import { getAllSettings, registerAllSettings } from './settings';

// TODO: Waiting for https://github.com/laurent22/joplin/pull/4509
// import prettier = require('prettier/standalone');
// import markdown = require('prettier/parser-markdown');
import path = require('path');
import opener = require('opener');

const contentScriptId = 'richMarkdownEditor';

async function getResourcePath(resourceDir: string, id: string) {
	const info = await joplin.data.get(['resources', id], {
		fields: ['file_extension'],
	});

	return path.join('file:/', resourceDir, id + '.' + info.file_extension); 
}

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
		await joplin.views.menuItems.create('clickAtCursorContext', 'editor.richMarkdown.clickAtCursor', MenuItemLocation.EditorContextMenu, { accelerator: 'Ctrl+Enter' });

		const resourceDir = await joplin.settings.globalValue('resourceDir');
		await registerAllSettings();

		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			contentScriptId,
			'./richMarkdown.js'
		);

		await joplin.contentScripts.onMessage(contentScriptId, async (message:any) => {
			if (message.name === 'getResourcePath') {
				return await getResourcePath(resourceDir, message.id);
			}
			else if (message.name === 'getSettings') {
				return await getAllSettings();
			}
			else if (message.name === 'followLink') {
				if (message.url.startsWith(':/')) {
					try {
						await joplin.commands.execute('openNote', message.url.slice(2, 34));
					} catch (e) {
						const resource = await getResourcePath(resourceDir, message.url.slice(2));
						opener(resource);
					}
				}
				else {
					let url = message.url;

					if (!url.match(/^(http|https|file)/))
						url = 'http://' + url;
					opener(url);
				}
			}

			return "Error: " + message + " is not a valid message";
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
