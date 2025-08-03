import * as Overlay from './overlay';


describe('link regex', () => {
	test('valid urls', () => {
		expect('[many](https://calebjohn.ca)').toMatch(Overlay.link_regex);
		expect('<joplinapp.org>').toMatch(Overlay.link_regex);
		expect('https://joplinapp.org').toMatch(Overlay.link_regex);
		expect('https://joplinapp.org/www(x=y)').toMatch(Overlay.link_regex);
		expect('[even this](https://joplinapp.org/www(x=y))').toMatch(Overlay.link_regex);
		expect('[even this](https://joplinapp.org/www(x=y)skmfnsm)').toMatch(Overlay.link_regex);
		expect('[](test)').toMatch(Overlay.link_regex);
		expect('[ev]()').toMatch(Overlay.link_regex);
		expect('[](www.google.ca "soe")').toMatch(Overlay.link_regex);
	});

	test('match groups', () => {
		let str = '[many](https://calebjohn.ca)';
		Overlay.link_regex.lastIndex = 0;
		let match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBe('https://calebjohn.ca');
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBeUndefined();

		str = '<joplinapp.org>';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBeUndefined();
		expect(match[2]).toBe('joplinapp.org');
		expect(match[3]).toBeUndefined();

		str = 'https://joplinapp.org';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBeUndefined();
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBe('https://joplinapp.org');

		str = 'https://joplinapp.org/www(x=y)';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBeUndefined();
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBe('https://joplinapp.org/www(x=y)');

		str = '[even this](https://joplinapp.org/www(x=y))';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBe('https://joplinapp.org/www(x=y)');
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBeUndefined();

		str = '[even this](https://joplinapp.org/www(x=y)skmfnsm)';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBe('https://joplinapp.org/www(x=y)skmfnsm');
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBeUndefined();

		// It's too difficult to support nested parens using regexes
		// let's hope we never face such a cursed url
		str = '[even this](https://joplinapp.org/www(x(=)y)skmfnsm)';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe('[even this](https://joplinapp.org/www(x(=)y)');
		expect(match[1]).toBe('https://joplinapp.org/www(x(=)y');
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBeUndefined();

		str = '[](test)';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBe('test');
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBeUndefined();

		str = '[](www.google.ca "soe")';
		Overlay.link_regex.lastIndex = 0;
		match = Overlay.link_regex.exec(str);
		expect(match[0]).toBe(str);
		expect(match[1]).toBe('www.google.ca "soe"');
		expect(match[2]).toBeUndefined();
		expect(match[3]).toBeUndefined();

	});
});

describe('highlight regex', () => {
	test('valid highlight', () => {
		expect('==highlight==').toMatch(Overlay.highlight_regex);
		expect('==high light==').toMatch(Overlay.highlight_regex);
		expect('==highlight=me==').toMatch(Overlay.highlight_regex);
		expect('==highlight=me=please==').toMatch(Overlay.highlight_regex);
	});
	test('invalid highlight', () => {
		expect('\\==lowlight==').not.toMatch(Overlay.highlight_regex);
		expect('==lowlight\\==').not.toMatch(Overlay.highlight_regex);
		expect('== lowlight==').not.toMatch(Overlay.highlight_regex);
		expect('==lowlight ==').not.toMatch(Overlay.highlight_regex);
		expect('=lowlight=').not.toMatch(Overlay.highlight_regex);
		expect('lowlight== lowlight==').not.toMatch(Overlay.highlight_regex);
	});
});

describe('html full image regex', () => {
	test('valid html matches', () => {
		expect('<img src=":/8be52e7f659b4cd29f1fe962e9e42b1d" alt="" width="547" height="420" class="jop-noMdConv">').toMatch(Overlay.html_full_image_regex);

		expect('<img    class="fit-picture" src="/shared-assets/images/examples/grapefruit-slice.jpg" alt="Grapefruit slice atop a pile of other slices" />').toMatch(Overlay.html_full_image_regex);

		expect('<img src="image-file.png" alt="My image file description" attributionsrc="https://a.example/register-source https://b.example/register-source" />').toMatch(Overlay.html_full_image_regex);

		expect('<img alt="A Penguin on a beach." src="penguin.jpg" />').toMatch(Overlay.html_full_image_regex);

		expect('<a href="https://developer.mozilla.org"><img   src="/shared-assets/images/examples/favicon144.png"  alt="Visit the MDN site" /></a>').toMatch(Overlay.html_full_image_regex);

		expect('<img src="/shared-assets/images/examples/favicon72.png" alt="MDN" srcset="/shared-assets/images/examples/favicon144.png 2x" />').toMatch(Overlay.html_full_image_regex);
	});

	test('invalid html matches', () => {
		expect('<imgsrc=":/8be52e7f659b4cd29f1fe962e9e42b1d" alt="" width="547" height="420" class="jop-noMdConv">').not.toMatch(Overlay.html_full_image_regex);

		expect('<img >').not.toMatch(Overlay.html_full_image_regex);

		expect('<img    class="fit-picture" alt="Grapefruit slice atop a pile of other slices" />').not.toMatch(Overlay.html_full_image_regex);

		expect('<img alt="A Penguin on a beach." src="penguin.jpg" /').not.toMatch(Overlay.html_full_image_regex);

		expect('<img alt="MDN" srcset="/shared-assets/images/examples/favicon144.png 2x" />').not.toMatch(Overlay.html_full_image_regex);
	});
});
