async function checkPort(port: number): Promise<boolean> {
	try {
		const response = await fetch(`http://localhost:${port}/ping`);
		if (response.ok) {
			try {
				return await response.text() === 'JoplinClipperServer';
			} catch (e) {
				return false;
			}
		}
	} catch (e) {
		console.log(`Nothing on port ${port}`);
	}

	return false;
}

export async function getApiPort(): Promise<number> {
	let port = 41184;
	if (await checkPort(port)) return port;

	// This is for the dev environment
	port = 27583;
	if (await checkPort(port)) return port;

	for (port = 41185; port < 41200; port++)
		if (await checkPort(port)) return port;

	console.error("Can't find an open port for the Joplin api, fallback to opener");
	return -1;
}
