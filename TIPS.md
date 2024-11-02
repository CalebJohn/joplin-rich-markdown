# Tips

Note: Most of these have been wrapped up in to the themes (available in the plugin settings). So make sure to check there before spending too much time with custom css.

The below is a collection of [userchrome.css](https://joplinapp.org/help/#custom-css) customizations that might be handy. If you have one of your own that you'd like added here, please make a [PR](https://github.com/CalebJohn/joplin-rich-markdown/pulls) or let me know [on the forum](https://discourse.joplinapp.org/t/plugin-rich-markdown/15053).

## Horizontal Rule 

```css
/* Render horizontal lines (made with \-\-\- or \*\*\*) as an actual line across the editor. */
div.CodeMirror .cm-hr {
  border-top: 1px solid #777;
  display: block;
  line-height: 0px;
}
```

## Subtle Headers

```css
/* Reduce the size and visibility of the header hash tags. */
/* The additional CSS option must be enabled */
div.cm-editor .cm-header > .cm-rm-header-token {
	font-size: 0.9em;
	color: grey;
}
```

```css
/* Additionally, this CSS unindent the "#" characters to align */
/* the header text with the rest of the text */
div.cm-editor .cm-header > .cm-rm-header-token {
	color: #cccccc;
	font-size: 0.9em;
	margin-left: -50px;
	max-width: 50px;
	width: 50px;
	overflow: hidden;
	display: inline-block;
	text-align: right;
	opacity: 0.5;
}
```

Thanks to [uxamanda](https://discourse.joplinapp.org/t/plugin-rich-markdown/15053/105) for the code.

## Subtle Tokens

```css
/* Reduces the intensity of the markdown tokens
div.cm-editor .tok-meta {
	opacity: 0.5;
}

/* This is also available for highlight and strikethrough, but it doesn't look very good */
/*
.cm-rm-highlight .cm-rm-highlight-token,
.cm-strikethrough .cm-rm-strike-token,
*/

```

## Strikeout Checkboxes
```css
/* strikeout and dim a checked checkbox */
div.CodeMirror span.cm-rm-checkboxed {
	text-decoration: line-through;
	opacity: 0.7;
}
```

## Highlight the Active Line
```css
/* Requires the "highlight background of current line option to be enabled */
div.CodeMirror .CodeMirror-activeline.CodeMirror-activeline-background {
  background: grey !important;
}
```

## List Spacing

```css
/* Match list spacing to the viewer */
div.CodeMirror .cm-rm-list-token {
  line-height: 2em;
}
```

## Code Blocks

Code block highlighting is implemented by the main Joplin app as of v2.3.4 and was removed from Rich Markdown  versions 0.8.0 onwards.


## Colour Schemes

Each Joplin theme uses a different CodeMirror colour scheme, it's useful to know what these colour schemes are because they can be used to support customizations that differ across Joplin themes (see [Coloured List Tokens](#coloured-list-tokens) for an example).

```
Light: .cm-s-default
Dark: .cm-s-material-darker
Solarized Light: .cm-s-solarized
Solarized Dark: .cm-s-solarized and .cm-s-solarized.cm-s-dark
Dracula: .cm-s-dracula
Nord: .cm-s-nord
Aritim Dark: .cm-s-monokai
OLED Dark: .cm-s-material-darker
```

## General

The Joplin forum has [a collection](https://discourse.joplinapp.org/t/joplin-customization/11195) of useful CSS snippets for customizations that aren't specific to this plugin.

---

## Warning
#### Checkmark Checkboxes
Much thanks to [ambrt](https://discourse.joplinapp.org/u/ambrt/) for the initial implementation.
```css
/* Requires the additional Css option to be enabled */
div.CodeMirror .cm-rm-checkbox .cm-rm-checkbox-checked {
  display: none;
}
div.CodeMirror .cm-rm-checkbox .cm-rm-checkbox-checked + .cm-taskMarker:before {
    content: "✓";
}
```

## Notes on legacy editor (pre 3.1.1)
Some tokens had the class `.cm-overlay` pre-pended to them. This class is removed in the new editor, any styles that involved can simply have it removed. For example

```diff
- div.CodeMirror .cm-overlay.cm-rm-list-token {
+ div.CodeMirror .cm-rm-list-token {
```
If still using the legacy editor, please view the older [TIPS](https://github.com/CalebJohn/joplin-rich-markdown/blob/7d6bd9c984176a1a0d6fdc5683c34f03669967b5/TIPS.md)
