import type * as CodeMirrorView from '@codemirror/view';
import type * as CodeMirrorState from '@codemirror/state';
import type * as CodeMirrorLanguage from '@codemirror/language';

// Dynamically imports a CodeMirror 6 library. This is done
// to allow the plugin to start in both CodeMirror 5 and CodeMirror 6
// without import failure errors.
export function require_codemirror_view(): typeof CodeMirrorView {
	return require('@codemirror/view');
}

export function require_codemirror_state(): typeof CodeMirrorState {
	return require('@codemirror/state');
}

export function require_codemirror_language(): typeof CodeMirrorLanguage {
	return require('@codemirror/language');
}
