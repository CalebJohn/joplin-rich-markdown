# Tips

The below is a collection of [userchrome.css](https://joplinapp.org/help/#custom-css) customizations that might be handy. If you have one of your own that you'd like added here, please make a [PR](https://github.com/CalebJohn/joplin-rich-markdown/pulls) or let me know [on the forum](https://discourse.joplinapp.org/t/plugin-rich-markdown/15053).

## Horizontal Rule 

```css
/* Render horizontal lines (made with \-\-\- or \*\*\*) as an actual line across the editor. */
div.CodeMirror .cm-hr {
  border-top: 1px solid #777;
  display: block;
  line-height: 0px;
}

/* If using the Enforce CSS option, then use the below CSS */
div.CodeMirror pre.cm-rm-hr.CodeMirror-line  {
  border-top: 1px solid #777;
	line-height: 0px;
}
```

## Subtle Headers

```css
/* Reduce the size and visibility of the header hash tags. */
/* The additional CSS option must be enabled */
div.CodeMirror .cm-header.cm-rm-header-token {
	font-size: 0.9em;
	color: grey;
}
```

```css
/* Additionally, this CSS unindent the "#" characters to align */
/* the header text with the rest of the text */
div.CodeMirror .cm-header.cm-rm-header-token {
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
/* Reduces the intensity of the italics (emph) and bold (strong) markdown tokens */
div.CodeMirror .cm-em.cm-rm-em-token,
div.CodeMirror .cm-strong.cm-rm-strong-token {
	opacity: 0.5;
}

/* This is also available for highlight and strikethrough, but it doesn't look very good */
/*
.cm-rm-highlight.cm-rm-highlight-token,
.cm-strikethrough.cm-rm-strike-token,
*/

```

## Quotes
```css

/* Add a vertical bar to the left side of quote blocks so they match the viewer */
pre.cm-rm-blockquote.CodeMirror-line {
  border-left: 4px solid var(--joplin-code-border-color);
  opacity: 0.7;
}

pre.cm-rm-blockquote span.cm-quote + span.cm-quote {
  opacity: 1;
}

/* WARNING: the below code will hide the > from quotes, use at your own risk */
/*
pre.cm-rm-blockquote span.cm-quote.cm-rm-list-token {
  opacity: 0;
}
*/
```

## Monospace Font

```css
/* Changes the monospace font used for tabes/checkboxes */
/* All fonts option must be enabled */
div.CodeMirror .cm-overlay.cm-rm-monospace {
	font-family: monospace !important;
}
```

## Strikeout Checkboxes
```css
/* strikeout and dim the text of a checked checkbox */
div.CodeMirror span.cm-rm-checkbox.cm-property + span.cm-rm-checkbox ~ span.cm-rm-checkbox {
	text-decoration: line-through;
	opacity: 0.7;
}
/* Uncomment the below sections to include the checkbox itself  */
/*
span.cm-rm-checkbox.cm-property + span.cm-rm-checkbox {
	text-decoration: line-through;
	opacity: 0.7;
}
span.cm-rm-checkbox.cm-property {
	text-decoration: line-through;
	opacity: 0.7;
}
*/
```

## Highlight the Active Line
```css
/* Requires the "highlight background of current line option to be enabled */
div.CodeMirror .CodeMirror-activeline .CodeMirror-activeline-background.CodeMirror-linebackground {
  background: grey !important;
}
```

## Coloured List Tokens

```css
/* Disable list colours for the default (Light) theme */
div.CodeMirror .cm-s-default span.cm-variable-2, .cm-s-default span.cm-variable-3, .cm-s-default  span.cm-keyword {
	color: #32373F;
}

/* Add list colours back in for just the token component of the list */
div.CodeMirror .cm-overlay.cm-rm-list-token.cm-variable-2 {
	color: blue;
}
div.CodeMirror .cm-overlay.cm-rm-list-token.cm-variable-3 {
	color: orange;
}
div.CodeMirror .cm-overlay.cm-rm-list-token.cm-keyword {
	color: green;
}
```

## List Spacing

```css
/* Match list spacing to the viewer */
div.CodeMirror .cm-overlay.cm-rm-list-token {
  line-height: 2em;
}
```

## Code Blocks

```css
/* Add a background color to code blocks */
div.CodeMirror .cm-rm-code-block {
  background-color: lightgrey;
}
```

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
The below configurations are not recommended and are provided for advanced users only.

#### Hide Tokens and URLs on Other Lines
```css
/* Requires the additional Css and the highlight current line options to be enabled */
div.CodeMirror .cm-string.cm-url, .cm-header.cm-rm-header-token, .cm-em.cm-rm-em-token, .cm-strong.cm-rm-strong-token, .cm-rm-highlight.cm-rm-highlight-token, .cm-strikethrough.cm-rm-strike-token, .cm-rm-ins.cm-rm-ins-token, .cm-rm-sub.cm-rm-sub-token, .cm-rm-sup.cm-rm-sup-token {
	display: none;
}

div.CodeMirror .CodeMirror-activeline .cm-string.cm-url, .CodeMirror-activeline .cm-header.cm-rm-header-token, .CodeMirror-activeline .cm-em.cm-rm-em-token, .CodeMirror-activeline .cm-strong.cm-rm-strong-token, .CodeMirror-activeline .cm-rm-highlight.cm-rm-highlight-token, .CodeMirror-activeline .cm-strikethrough.cm-rm-strike-token, .CodeMirror-activeline .cm-rm-ins.cm-rm-ins-token, .CodeMirror-activeline .cm-rm-sub.cm-rm-sub-token, .CodeMirror-activeline .cm-rm-sup.cm-rm-sup-token {
	display: inherit;
}

/* Optional: You might also want to disable the highlight background */
.CodeMirror .CodeMirror-activeline
.CodeMirror-activeline-background:not(.cm-jn-code-block):not(.cm-jn-code-block-background),
.cm-s-solarized.cm-s-light div.CodeMirror-activeline-background,
.cm-s-solarized.cm-s-dark div.CodeMirror-activeline-background {
  background: inherit;
}
```

#### Focus Mode
Dims everything outside of the current line.
```css
div.CodeMirror .CodeMirror-line {
  opacity: 0.4;
}

div.CodeMirror .CodeMirror-activeline .CodeMirror-line{
  opacity: 1.0;
}
```

#### Checkmark Checkboxes
Much thanks to [ambrt](https://discourse.joplinapp.org/u/ambrt/) for the initial implementation.
```css
/* Requires the additional Css option to be enabled */
div.CodeMirror .cm-property.cm-rm-checkbox.cm-rm-checkbox-check {
  display: none;
}
div.CodeMirror .cm-property.cm-rm-checkbox.cm-rm-checkbox-check + .cm-property:before {
    content: "✓";
}
```
