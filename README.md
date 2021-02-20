# Rich Markdown

A plugin that will finally allow you to ditch the markdown viewer, saving space and making your life easier.

Rich Markdown comes as a collection of multiple features that can be toggled in settings.

# Features

## Images on Hover
When hovering over a markdown image tag with Ctrl pressed, a preview of the image will pop up below the mouse cursor.
This is enabled by default.
![Example of an image on hover](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/examples/hover_image.png)

## Images in Editor
Any image that is contained on it's own line of the markdown source will render directly on the line directly below. This works for both internal resources and generic links to images
This is not enabled by default, but can be quick toggled in the View menu.
![Example of images being rendered in markdown editor](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/examples/inline_image.png)

## Checkbox
Checkboxes can be toggled in the markdown source by Ctrl+Clicking between the square brackets.
This is enabled by default.

## Links
Links can be followed by Ctrl+Clicking.
This is enabled by default.

# Feature Requests
Feature Requests are appreciated and encouraged. Not all feature requests will be technically feasible, so please be patient. Feature requests that align with the projects philosophy (below) are more likely to be implemented. 

The aim of this project is to ditch the markdown viewer without trying to turn a markdown document into some kind of unholy WYSIAWYG (what you see is almost what you get). To that end, feature requests that hide markdown or otherwise introduce invisible formatting will not be accepted. The intention of this project is not to build the worlds best (most performant, beautiful, etc.) markdown editor, but rather to build something that can make my (and others!) life a little bit nicer.

Please make feature requests (please prepend the title with Feature Request), or on the [rich markdown forum topic](https://discourse.joplinapp.org/t/plugin-rich-markdown/15053).

# Tips
I don't like reading/writing notes at a full width, but find the viewer a bit distracting at times. I add the below CSS to my [userchrome.css](https://joplinapp.org/#custom-css) file in order to get a semi-distraction free writing experience when only the editor is toggled.
```css
.CodeMirror-sizer {
	margin-right: auto !important;
	margin-left: auto !important;
	max-width: 800px !important;
}
```

Adding the following to [userchrome.css](https://joplinapp.org/#custom-css) renders horizontal lines (made with \-\-\- or \*\*\*) as an actual line across the editor.
```css
.cm-hr {
  border-top: 1px solid #777;
  display: block;
	line-height: 0px;
}
```


# Known Issues
- Resources aren't watched. Don't edit any opened resource an expect it to be saved, toggle visual mode for that. This will be fixed in the future.
- [Reference Links](https://spec.commonmark.org/0.29/#reference-link) are not supported yet.
- file:// links only work with markdown link syntax (\[\]\(\) \<\>)
- When hovering over an image on the bottom line, the image will be cut off
	- This can be fixed by scrolling the editor down enough to display the image
