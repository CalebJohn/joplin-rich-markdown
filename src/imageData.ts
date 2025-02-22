import joplin from 'api';

export async function imageToDataURL(filePath:string, mimeType:string) {
	const fs = joplin.require('fs-extra');
	const fileBuffer = await fs.readFile(filePath);
	const base64String = fileBuffer.toString('base64');
	return `data:${mimeType};base64,${base64String}`;
}
