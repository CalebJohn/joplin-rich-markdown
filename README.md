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


## Known Issues
- Resources aren't watched. Don't edit any opened resource an expect it to be saved, toggle visual mode for that. This will be fixed in the future.
- [Reference Links](https://spec.commonmark.org/0.29/#reference-link) are not supported yet.
- file:// links only work with markdown link syntax ([]() <>)
