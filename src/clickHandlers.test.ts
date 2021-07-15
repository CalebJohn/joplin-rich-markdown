import * as ClickHandlers from './clickHandlers';
import * as Overlay from './overlay';

const test_text = `
soemthing
this is a notes

this note has [many](https://calebjohn.ca) links
it also contains other links like <joplinapp.org> this
but it doesn't forget plain old https://joplinapp.org links
and all the rest!
`

test("getMatchAt works for markdown links", () => {
	let match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 45);
	expect(match[0]).toBe("[many](https://calebjohn.ca)");
	expect(match[1]).toBe("https://calebjohn.ca");
	expect(match[2]).toBeUndefined();
	expect(match[3]).toBeUndefined();

	match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 115)
	expect(match[0]).toBe("<joplinapp.org>");
	expect(match[1]).toBeUndefined();
	expect(match[2]).toBe("joplinapp.org");
	expect(match[3]).toBeUndefined();

	match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 165)
	expect(match[0]).toBe("https://joplinapp.org");
	expect(match[1]).toBeUndefined();
	expect(match[2]).toBeUndefined();
	expect(match[3]).toBe("https://joplinapp.org");
	
});

test("getMatchAt works on the boundary of a match (but not over)", () => {
	let match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 42);
	expect(match).not.toBeNull();
	match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 41);
	expect(match).toBeNull();
	match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 70);
	expect(match).not.toBeNull();
	match = ClickHandlers.getMatchAt(test_text, Overlay.link_regex, 71);
	expect(match).toBeNull();
});
