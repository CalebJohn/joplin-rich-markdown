import joplin from 'api';
import { SettingItemType } from 'api/types';


export async function getAllSettings() {
	return {
		inlineImage: await joplin.settings.value('inlineImage'),
		checkbox: await joplin.settings.value('checkbox'),
		links: await joplin.settings.value('links'),
		imageHover: await joplin.settings.value('imageHover'),
	}
}

export async function registerAllSettings() {
	await joplin.settings.registerSection('settings.calebjohn.richmarkdown', {
		label: 'Rich Markdown',
		iconName: 'fas fa-pencil'
	});

	await joplin.settings.registerSetting('inlineImage', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Render images below their markdown source (only for images on their own line)'
  });

	await joplin.settings.registerSetting('checkbox', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Allow toggling checkboxes with Ctrl+Click'
  });

	await joplin.settings.registerSetting('links', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Allow following note links with Ctrl+Click'
  });

	await joplin.settings.registerSetting('imageHover', {
		value: true,
		type: SettingItemType.Bool,
		section: 'settings.calebjohn.richmarkdown',
		public: true,
		label: 'Show an image popup when hovering over the image source'
  });
}
