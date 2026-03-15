# Manual Test Plan: Issue #63

## Scope
This document describes manual validation for:
- Internal links in markdown editor where the link label contains checkbox tokens like [ ] or [x].
- Regression safety for normal markdown links.

Issue reference: https://github.com/CalebJohn/joplin-rich-markdown/issues/63

## Build Artifact
Expected plugin package:
- publish/plugin.calebjohn.rich-markdown.jpl

## Prerequisites
- Joplin Desktop installed.
- Rich Markdown plugin built from this branch.
- Ctrl+Click (or Cmd+Click on macOS) link behavior enabled in plugin settings.

## Install Local Plugin Build
1. Open Joplin.
2. Go to Tools -> Options -> Plugins.
3. Select gear icon -> Install from file.
4. Choose publish/plugin.calebjohn.rich-markdown.jpl.
5. Restart Joplin.

## Test Data Setup
Create two notes:

### Note A (target note)
Use this content:

```markdown
# Target Note

## [ ] Open task heading
Some text under open task heading.

## [x] Done task heading
Some text under done task heading.

## Plain heading
Some text under plain heading.
```

### Note B (source note)
Replace NOTE_A_ID with the actual note ID of Note A.
Use this content:

```markdown
# Source Note

[Link to open task heading](:/NOTE_A_ID#open-task-heading)
[Link to done task heading](:/NOTE_A_ID#done-task-heading)
[Link to plain heading](:/NOTE_A_ID#plain-heading)

[Target > [ ] Open task heading](:/NOTE_A_ID#open-task-heading)
[Target > [x] Done task heading](:/NOTE_A_ID#done-task-heading)
```

## How To Get A Valid NOTE_A_ID
Use one of these methods (recommended first):

1. In Note A, open note properties and copy the note ID.
2. Or in Note A, use "Copy Markdown link" (if available), then extract the ID from a link like `[:/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx]`.

Important:
- `NOTE_A_ID` is a placeholder and must be replaced.
- If `NOTE_A_ID` is left as text, links will not open.

## Verify Click Behavior Before Anchor Tests
1. In Note B, add a baseline link with no anchor:

```markdown
[Open target note only](:/NOTE_A_ID)
```

2. Ctrl+Click the link (Cmd+Click on macOS).

Expected:
- Note A opens.

If it does not open, do not continue to anchor tests yet. Check:
- Correct `NOTE_A_ID` was used.
- Rich Markdown link feature is enabled.
- Ctrl/Cmd modifier requirement is satisfied by current settings.

## About Anchor Text Values
Anchor fragments such as `#open-task-heading` depend on Joplin's heading slug generation.

Use this approach:
1. First confirm `(:/NOTE_A_ID)` works.
2. Then append anchors and verify section targeting.
3. If note opens but section is not exact, this may be Joplin/editor anchor positioning behavior rather than link detection.

## Manual Test Cases

### TC1: Baseline internal links still work
1. In Note B editor, Ctrl+Click (Cmd+Click on macOS) on:
   - [Link to open task heading](...)
   - [Link to done task heading](...)
   - [Link to plain heading](...)
2. Verify each link opens Note A and navigates to the intended section as far as Joplin anchor behavior allows.

Expected:
- Links are recognized and opened.
- No unexpected checkbox toggle happens while clicking links.

### TC2: Checkbox token in link label with [ ]
1. In Note B editor, Ctrl+Click (Cmd+Click on macOS) on:
   - [Target > [ ] Open task heading](...)

Expected:
- Link is recognized as a link.
- Joplin opens Note A and navigates to open-task-heading.
- No false checkbox action triggers from the [ ] token in label.

### TC3: Checkbox token in link label with [x]
1. In Note B editor, Ctrl+Click (Cmd+Click on macOS) on:
   - [Target > [x] Done task heading](...)

Expected:
- Link is recognized as a link.
- Joplin opens Note A and navigates to done-task-heading.
- No false checkbox action triggers from the [x] token in label.

### TC4: Context menu sanity check
1. Right-click each of the two links with checkbox tokens in label.
2. Confirm link-related menu actions are available (for example, Open link / Copy link).

Expected:
- Treated as link context, not checkbox context.

## Pass/Fail Criteria
Pass if all are true:
- TC1 passes (no regression on normal internal links).
- TC2 and TC3 pass (issue #63 fixed).
- TC4 passes (link context remains correct).

Fail if any are true:
- Link with [ ] or [x] in label does not open.
- Clicking the link triggers checkbox behavior instead of link navigation.
- Normal internal link behavior regresses.

## Notes
- Anchor scroll precision can still be affected by Joplin editor limitations; this test focuses on whether the link is detected and followed.
- If a case fails, capture:
  - OS
  - Joplin version
  - Plugin version
  - Exact markdown snippet
  - Whether Ctrl/Cmd modifier was pressed
