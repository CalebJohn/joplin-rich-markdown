# Rich Markdown

A plugin that will finally allow you to ditch the markdown viewer, saving space and making your life easier.

Rich Markdown comes as a collection of multiple features that can be toggled in settings.

![Welcome Notebook Screenshot](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/examples/welcome.png)

(Thanks to [@uxamanda](https://discourse.joplinapp.org/u/uxamanda) for the awesome theme!)

# Features
The Rich Markdown plugin supports a number of optional features. Unless otherwise stated, these features can be toggled under `Tools -> Options -> Rich Markdown -> Add additional CSS classes for enhanced customization`.

## Images on Hover
When hovering over a markdown image tag with Ctrl (or Opt) pressed, a preview of the image will pop up below the mouse cursor.

This is enabled by default.
[Example of an image on hover](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/examples/hover_image.png)

## Images in Editor
Any image that is contained on it's own line of the markdown source will render directly on the line directly below. This works for both internal resources and generic links to images

This is not enabled by default, but can be quick toggled in the View menu.
[Example of images being rendered in markdown editor](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/examples/inline_image.png)

## Checkbox
Checkboxes can be toggled in the markdown source by Ctrl (or Opt) + Clicking or with the  Perform action command in the context menu.

This is enabled by default.

## Links
Links can be followed by Ctrl (or Opt) + Clicking or with the Perform action command in the context menu.

This is enabled by default.

## Highlighting
Text surrounded by == (e.g. ==mark==) will now be highlighted in the editor.

Insert syntax (++insert++), sub (~sub~), and sup (^sup^) syntaxes are also available and enabled in the same way.

This can be enabled under `Tools -> Options -> Markdown -> Enable ==mark== syntax`.

## Align Lists
Lists that get wrapped will have the wrap match the indentation of the list element.
This includes checkboxes and block quotes.

This is enabled by default.

## Extra CSS
Some additional CSS classes have been added to further enable customization through [userchrome.css](https://joplinapp.org/help/#custom-css). Available classes are detailed below.

`.cm-header.cm-rm-header-token`: The grouping of hashtags (#) at the start of a header

`.cm-em.cm-rm-em-token`: The \* or \_ used to begin italics

`.cm-strong.cm-rm-strong-token`: The \*\* or \_\_ used to begin bold

`.cm-rm-highlight`: The highlighted text (including the ==)

`.cm-rm-highlight.cm-rm-highlight-token`: The == used to begin highlighting

`.cm-strikethrough.cm-rm-strike-token`: The \~\~ used to begin a strike through

`.cm-rm-ins.cm-rm-ins-token`: The ++ used to begin the insert syntax

`.cm-rm-sub.cm-rm-sub-token`: The ~ used to begin the sub syntax

`.cm-rm-sup.cm-rm-sup-token`: The ^ used to begin the sup syntax

`pre.cm-rm-hr.CodeMirror-line`: Used to support drawing a horizontal rule [see here](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/TIPS.md#horizontal-rule)

`pre.cm-rm-blockquote.CodeMirror-line`: The line that contains a block quote

If you have a suggestion for something you'd like to be able to customize. Just let me know and I'll see whats possible.

This is disabled by default.

## Image External Edits
If an image is edited, the change will be reflected in the editor within 3s (by default) or immediately after any change to the note. The 3s period can be changed in the settings (under the advanced tab). Setting the value to 0s will prevent the periodic image changes, but image changes will still be picked up when the note is edited.


# Install
The typical way to install plugins is through the built-in Joplin plugin manager.

The plugin manager can be access under Tools -> Options -> Plugins (Joplin -> Preferences -> Plugins).

Once there use the search bar at the top to search for "Rich Markdown". The plugin should appear with a large "Install" button.

[A jpl file is provided in the latest release](https://github.com/CalebJohn/joplin-rich-markdown/releases/latest) for those that want to install manually.

# Feature Requests
Feature Requests are appreciated and encouraged. Not all feature requests will be technically feasible, so please be patient. Feature requests that align with the projects philosophy (below) are more likely to be implemented. 

The aim of this project is to ditch the markdown viewer without trying to turn a markdown document into some kind of unholy WYSIAWYG (what you see is almost what you get). To that end, feature requests that hide markdown or otherwise introduce invisible formatting will be treated skeptically. The intention of this project is not to build the worlds best (most performant, beautiful, etc.) markdown editor, but rather to build something that can make my (and others!) life a little bit nicer.

Please make feature requests (please prepend the title with Feature Request) [on the github page](https://github.com/CalebJohn/joplin-rich-markdown/issues), or on the [rich markdown forum topic](https://discourse.joplinapp.org/t/plugin-rich-markdown/15053).

# Tips

Go to [Tips](https://github.com/CalebJohn/joplin-rich-markdown/blob/main/TIPS.md) to see a collection of CSS styling tips to get the most out of the Rich Markdown plugin.


# Known Issues
- [Reference Links](https://spec.commonmark.org/0.29/#reference-link) are not supported yet.
- file:// links only work with markdown link syntax (\[\]\(\) \<\>)
- When hovering over an image on the bottom line, the image will be cut off
	- This can be fixed by scrolling the editor down enough to display the image
- Links opened on Windows systems will be opened in the background (i.e. the browser won't jump to the front)
- Images with a newline in the title won't be rendered in the editor
  e.g.
  ```
  ![joplin
  is cool](some_image_path)
  ```
