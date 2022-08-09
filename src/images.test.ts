import * as ImageHandlers from './images';

const test_text = `
![space-fish.png](:/40530199c558430d8ea01363748d9657){width=100%}
![おはいよ](https://www.inmoth.ca/images/envelope.png)
![red.png](file:///home/joplinuser/Pictures/red.png)
![](:/40530199c558430d8ea)
![おはいよ](https://www.inmoth.ca/images/envelope.png "title"){width=78px}
![name](https://url.com "title" this is all bad)
some paragr ![i1.png](:/d9e191134dad42dda2d94ab3e98d3517) something![](:/f190a79a355e4bbb86990cb3b55bedb6)som

[space-fish.png](:/40530199c558430d8ea01363748d9657)
[おはいよ](https://www.inmoth.ca/images/envelope.png)
[red.png](file:///home/joplinuser/Pictures/red.png)
some paragr [i1.png](:/d9e191134dad42dda2d94ab3e98d3517) something! [](:/f190a79a355e4bbb86990cb3b55bedb6)som
<img>
<p src=":/5d1ac6e676094f4f908c1d0a65694eff" alt="69f775caf86ae2a8e86c3416fee6060d.png" width="163" height="161" class="jop-noMdConv" style="zoom: 50%;">
<img src=":/5d1ac6e676094f4f908c1d0a65694eff" alt="69f775caf86ae2a8e86c3416fee6060d.png" width="135" height="135" class="jop-noMdConv" style="zoom: 0.5;"><img src=":/5d1ac6e676094f4f908c1d0a65694eff" alt="69f775caf86ae2a8e86c3416fee6060d.png" width="135" height="135" class="jop-noMdConv" style="transform: scale(0.5);">
something in a paragraphs <img src=":/5d1ac6e676094f4f908c1d0a65694eff" alt="69f775caf86ae2a8e86c3416fee6060d.png" width="163" height="161" class="jop-noMdConv" style="zoom: 50%;"> which is supported by an image
`
const test_html = `<img src=":/5d1ac6e676094f4f908c1d0a65694eff" alt="69f775caf86ae2a8e86c3416fee6060d.png" width="163" height="161" class="jop-noMdConv" style="zoom: 50%;">
<img src="https://raw.githubusercontent.com/laurent22/joplin/dev/Assets/LinuxIcons/256x256.png" alt="Joplin Icon" width="331" height="331" class="jop-noMdConv">
<img src="test" onerror="alert('123')"/>`


const line_cases = [
	[1, "space-fish.png", ":/40530199c558430d8ea01363748d9657", null, "100%", "%"],
	[2, "おはいよ", "https://www.inmoth.ca/images/envelope.png", null, undefined, undefined],
	[3, "red.png", "file:///home/joplinuser/Pictures/red.png", null, undefined, undefined],
	[4, "", ":/40530199c558430d8ea", null, undefined, undefined],
	[5, "おはいよ", "https://www.inmoth.ca/images/envelope.png", " \"title\"", "78px", "px"],
	// The current regex correctly grabs the title, but it doesn't guard against extra bits
	[6, "name", "https://url.com", " \"title\" this is all bad", undefined, undefined],
]

describe("Test image line regex matches images that own a line", () => {
	const lines = test_text.split("\n");

	test.each(line_cases)(
		"Line %p matches ![%p](%p)",
		(line, name, url, title, width, unit) => {
			let match = ImageHandlers.image_line_regex.exec(lines[line]);
			expect(match).not.toBeNull();
			const widthString = width ? `{width=${match[4]}}` : '';
			expect(match[0]).toBe(`![${name}](${url}${title ? title : ''})${widthString}`);
			expect(match[1]).toBe(name);
			expect(match[2]).toBe(url);
			// match[3] is the full match of the {width=?} I won't bother checking it
			expect(match[4]).toBe(width);
			expect(match[5]).toBe(unit);
		}
	);
});

describe("Test image line regex does not match anything else", () => {
	const lines = test_text.split("\n").concat(test_html.split("\n"));
	const cases = Array.from({length: lines.length - line_cases.length}, (_, i) => i+line_cases.length+1)
	test.each(cases)(
		"Line %p is not a line image",
		(line: number) => {
			let match = ImageHandlers.image_line_regex.exec(lines[line]);
			expect(match).toBeNull();
		}
	);
});

describe("Test image inline regex matches all images", () => {
	const cases = [
		["space-fish.png", ":/40530199c558430d8ea01363748d9657", null, "100%", "%"],
		["おはいよ", "https://www.inmoth.ca/images/envelope.png", null, undefined, undefined],
		["red.png", "file:///home/joplinuser/Pictures/red.png", null, undefined	, undefined],
		["", ":/40530199c558430d8ea", null, undefined, undefined],
		["おはいよ", "https://www.inmoth.ca/images/envelope.png", " \"title\"", "78px", "px"],
		// The current regex correctly grabs the title, but it doesn't guard against extra bits
		["name", "https://url.com", " \"title\" this is all bad", undefined, undefined],
		["i1.png", ":/d9e191134dad42dda2d94ab3e98d3517", null, undefined, undefined],
		["", ":/f190a79a355e4bbb86990cb3b55bedb6", null, undefined, undefined],
	];

	test.each(cases)(
		"Matches from ![%p](%p)",
		(name, url, title, width, unit) => {
			let match = ImageHandlers.image_inline_regex.exec(test_text);
			expect(match).not.toBeNull();
			const widthString = width ? `{width=${match[4]}}` : '';
			expect(match[0]).toBe(`![${name}](${url}${title ? title : ''})${widthString}`);
			expect(match[1]).toBe(name);
			expect(match[2]).toBe(url);
			expect(match[4]).toBe(width);
			expect(match[5]).toBe(unit);
		}
	);

	test("There are no more matches", () => {
		let match = ImageHandlers.image_inline_regex.exec(test_text);
		expect(match).toBeNull();
	});
});

describe("Test image html line regex only matches html images that own a line", () => {
	const text_lines = test_text.split("\n")
	test.each(text_lines)(
		"%p is not an html image on it's own line",
		(line: string) => {
			let match = ImageHandlers.html_image_line_regex.exec(line);
			expect(match).toBeNull();
		}
	);

	const html_lines = test_html.split("\n")
	test.each(html_lines)(
		"%p is an html image on it's own line",
		(line: string) => {
			let match = ImageHandlers.html_image_line_regex.exec(line);
			expect(match).not.toBeNull();
			expect(match[0]).toBe(line);
			// This is less important because the entire tag is used to generate an image
			// So the rest of the match statement is ignored
			// In the future this might be changed
			// expect(match[1]).toBe('');
		}
	);
});

