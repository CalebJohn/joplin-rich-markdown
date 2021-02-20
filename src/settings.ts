import joplin from 'api';
import { MenuItemLocation, SettingItemType } from 'api/types';

export interface RichMarkdownSettings {
	inlineImages: boolean;
	imageHover: boolean;
	imageHoverCtrl: boolean;
	checkbox: boolean;
	links: boolean;
	checkboxCtrl: boolean;
	linksCtrl: boolean;
}

export async function getAllSettings() {
	return {
		inlineImages: await joplin.settings.value('inlineImages'),
		imageHover: await joplin.settings.value('imageHover'),
		imageHoverCtrl: await joplin.settings.value('imageHoverCtrl'),
		checkbox: await joplin.settings.value('checkbox'),
		links: await joplin.settings.value('links'),
		checkboxCtrl: await joplin.settings.value('checkboxCtrl'),
		linksCtrl: await joplin.settings.value('linksCtrl'),
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
		label: 'Show an image popup when hovering over the image source with Ctrl pressed'
  });
	await joplin.settings.registerSetting('imageHoverCtrl', {
		value: false,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Enable image popup even when Ctrl is not pressed'
  });

	await joplin.settings.registerSetting('checkbox', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Toggle checkboxes with Ctrl+Click'
  });

	await joplin.settings.registerSetting('links', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Follow note links with Ctrl+Click'
  });


	await joplin.settings.registerSetting('checkboxCtrl', {
		value: true,
		type: SettingItemType.Bool,
		advanced: true,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Require Ctrl when togging checkboxes, it\'s recommended not to change this'
  });
	await joplin.settings.registerSetting('linksCtrl', {
		value: true,
		type: SettingItemType.Bool,
		advanced: true,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Require Ctrl when clicking links, it\'s recommended not to change this',
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
						name: 'richMarkdown.updateSettings',
						args: [settings]
					});
		    },
		});
		await joplin.views.menuItems.create(`richMarkdown${name}`, `richMarkdown.${name}`, MenuItemLocation.View);
}
