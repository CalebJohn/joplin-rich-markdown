import joplin from 'api';
import { MenuItemLocation, SettingItemType } from 'api/types';

export interface RichMarkdownSettings {
	inlineImages: boolean;
	imageHover: boolean;
	imageHoverCtrl: boolean;
	markHighlight: boolean;
	insertHighlight: boolean;
	subHighlight: boolean;
	supHighlight: boolean;
	extraCSS: boolean;
	enforceMono: boolean;
	alignIndent: boolean;
	checkbox: boolean;
	links: boolean;
	clickCtrl: boolean;
}

export async function getAllSettings() {
	return {
		inlineImages: await joplin.settings.value('inlineImages'),
		imageHover: await joplin.settings.value('imageHover'),
		imageHoverCtrl: await joplin.settings.value('imageHoverCtrl'),
		markHighlight: await joplin.settings.globalValue('markdown.plugin.mark'),
		insertHighlight: await joplin.settings.globalValue('markdown.plugin.insert'),
		subHighlight: await joplin.settings.globalValue('markdown.plugin.sub'),
		supHighlight: await joplin.settings.globalValue('markdown.plugin.sup'),
		extraCSS: await joplin.settings.value('extraCSS'),
		enforceMono: await joplin.settings.value('enforceMono'),
		alignIndent: await joplin.settings.value('alignIndent'),
		checkbox: await joplin.settings.value('checkbox'),
		links: await joplin.settings.value('links'),
		clickCtrl: await joplin.settings.value('clickCtrl'),
	}
}

export async function registerAllSettings() {
	await joplin.settings.registerSection('settings.calebjohn.richmarkdown', {
		label: 'Rich Markdown',
		iconName: 'fas fa-rocket'
	});

	await joplin.settings.registerSetting('inlineImages', {
		value: false,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Render images below their markdown source (only for images on their own line)'
  });
	registerToggle('inlineImages',
		'Toggle images in the markdown editor',
		'fas fa-image');

	await joplin.settings.registerSetting('imageHover', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Show an image popup when hovering over the image source with Ctrl (or Opt) pressed'
  });
	await joplin.settings.registerSetting('imageHoverCtrl', {
		value: false,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Enable image popup even when Ctrl (or Opt) is not pressed'
  });

	await joplin.settings.registerSetting('enforceMono', {
		value: false,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Enable all editor fonts',
		description: 'Allows the user to set any available font in Appearance -> Editor Font Family',
  });

	await joplin.settings.registerSetting('alignIndent', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Align wrapped list items to the indent level',
  });

	await joplin.settings.registerSetting('extraCSS', {
		value: false,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Add additional CSS classes for enhanced customization',
		description: 'See https://github.com/CalebJohn/joplin-rich-markdown#extra-css for options',
  });

	await joplin.settings.registerSetting('checkbox', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Toggle checkboxes with Ctrl (or Opt)+Click'
  });

	await joplin.settings.registerSetting('links', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Follow note links with Ctrl (or Opt)+Click'
  });

	await joplin.settings.registerSetting('clickCtrl', {
		value: true,
		type: SettingItemType.Bool,
		advanced: true,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Require Ctrl (or Opt) when clicking on elements (links and checkboxes)',
		description: 'It\'s recommended not to change this',
  });
}

async function registerToggle(name: string, label: string, icon: string) {
		await joplin.commands.register({
		    name: `richMarkdown.${name}`,
		    label: label,
		    iconName: icon,
		    execute: async () => {
					const enabled = await joplin.settings.value(name);
					joplin.settings.setValue(name, !enabled);
					const settings = await getAllSettings();

					await joplin.commands.execute('editor.execCommand', {
						name: 'updateRichMarkdownSettings',
						args: [settings]
					});
		    },
		});
		await joplin.views.menuItems.create(`richMarkdown${name}`, `richMarkdown.${name}`, MenuItemLocation.View);
}
