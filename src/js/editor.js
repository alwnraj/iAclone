import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

let editorView = null;

export function initEditor(container, onChange) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const state = EditorState.create({
        doc: '',
        extensions: [
            basicSetup,
            markdown(),
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
                if (update.docChanged && onChange) {
                    onChange(update.state.doc.toString());
                }
            }),
            EditorView.theme({
                "&": {
                    backgroundColor: "transparent",
                    height: "100%"
                },
                ".cm-content": {
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--font-size-base)",
                    lineHeight: "var(--line-height)",
                    caretColor: "var(--text-primary)"
                },
                ".cm-cursor": {
                    borderLeftColor: "var(--text-primary)",
                    borderLeftWidth: "2px"
                },
                ".cm-activeLine": {
                    backgroundColor: "transparent"
                },
                ".cm-activeLineGutter": {
                    backgroundColor: "transparent"
                },
                "&.cm-focused .cm-selectionBackground, ::selection": {
                    backgroundColor: "var(--selection-bg)"
                },
                ".cm-gutters": {
                    display: "none"
                }
            })
        ]
    });

    editorView = new EditorView({
        state,
        parent: container
    });

    return editorView;
}

export function getEditorView() {
    return editorView;
}

export function getEditorContent() {
    return editorView ? editorView.state.doc.toString() : '';
}

export function setEditorContent(content) {
    if (editorView) {
        const transaction = editorView.state.update({
            changes: {
                from: 0,
                to: editorView.state.doc.length,
                insert: content
            }
        });
        editorView.dispatch(transaction);
    }
}

export function updateEditorTheme(isDark) {
    // Theme is handled by CSS variables, no need to recreate editor
    // Just force a refresh if needed
    if (editorView) {
        editorView.requestMeasure();
    }
}

