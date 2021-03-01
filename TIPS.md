# Tips

The below is a collection of [userchrome.css](https://joplinapp.org/#custom-css) customizations that might be handy. If you have one of your own that you'd like added here, please make a [PR](https://github.com/CalebJohn/joplin-rich-markdown/pulls) or let me know [on the forum](https://discourse.joplinapp.org/t/plugin-rich-markdown/15053).

## Max Width

```css
/* Limit the max width of editor, and center */
.CodeMirror-sizer {
  margin-right: auto !important;
  margin-left: auto !important;
  max-width: 800px !important;
}
```

## Horizontal Rule 

```css
/* Render horizontal lines (made with \-\-\- or \*\*\*) as an actual line across the editor. */
.cm-hr {
  border-top: 1px solid #777;
  display: block;
  line-height: 0px;
}
```

## Subtle Headers

```css
/* Reduce the size and visibility of the header hash tags. */
/* The additional CSS option must be enabled */
.cm-header.cm-rm-header-token {
	font-size: 0.9em;
	color: grey;
}
```

## Monospace font

```css
/* Change the monospace font used for tabes/checkboxes */
/* All fonts option must be enabled */
.cm-overlay.cm-rm-monospace {
	font-family: monospace !important;
}
```

## Coloured List Tokens

```css
/* Disable list colours for the default (Light) theme */
.cm-s-default span.cm-variable-2, .cm-s-default span.cm-variable-3, .cm-s-default  span.cm-keyword {
	color: #32373F;
}

/* Add list colours back in for just the token component of the list */
.cm-overlay.cm-rm-list-token.cm-variable-2 {
	color: blue;
}
.cm-overlay.cm-rm-list-token.cm-variable-3 {
	color: orange;
}
.cm-overlay.cm-rm-list-token.cm-keyword {
	color: green;
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
