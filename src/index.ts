import joplin from 'api';
import { ContentScriptType, MenuItemLocation, Path, ToolbarButtonLocation } from 'api/types';

import { getAllSettings, registerAllSettings } from './settings';

// TODO: Waiting for https://github.com/laurent22/joplin/pull/4509
// import prettier = require('prettier/standalone');
// import markdown = require('prettier/parser-markdown');
import path = require('path');

const contentScriptId = 'richMarkdownEditor';

joplin.plugins.register({
	onStart: async function() {
		const resourceDir = await joplin.settings.globalValue('resourceDir');
		registerAllSettings();

		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			contentScriptId,
			'./richMarkdown.js'
		);

		await joplin.contentScripts.onMessage(contentScriptId, async (message:any) => {
			if (message.name === 'getResourcePath') {
				const info = await joplin.data.get(['resources', message.id], {
					fields: ['file_extension'],
				});
				return path.join('file:/', resourceDir,  message.id + '.' + info.file_extension); 
			}
			else if (message.name === 'getSettings') {
				return getAllSettings();
			}
			else if (message.name === 'openNote') {
				try {
					await joplin.commands.execute('openNote', message.id);
				} 
				catch (e) {
					// Note does not exist
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
