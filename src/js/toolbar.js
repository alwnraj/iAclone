import { getEditorView } from './editor.js';

let footnoteCounter = 0;

// Initialize toolbar with event listeners
export function initToolbar() {
    const toolbar = document.getElementById('formatting-toolbar');
    if (!toolbar) return;

    // Handle button clicks
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.toolbar-btn');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const level = button.getAttribute('data-level');
        const type = button.getAttribute('data-type');

        if (action) {
            handleFormatAction(action, { level, type });
        }
    });

    // Handle dropdown menus
    const dropdowns = toolbar.querySelectorAll('.toolbar-dropdown');
    dropdowns.forEach(dropdown => {
        const toggleBtn = dropdown.querySelector('.has-dropdown');
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });

        // Handle dropdown menu item clicks
        const menuItems = dropdown.querySelectorAll('.dropdown-menu button');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.remove('active');
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.toolbar-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

// Handle formatting actions
function handleFormatAction(action, options = {}) {
    const editor = getEditorView();
    if (!editor) return;

    switch (action) {
        case 'body':
            convertToBody();
            break;
        case 'heading':
            insertHeading(options.level || 1);
            break;
        case 'list':
            insertList(options.type || 'bullet');
            break;
        case 'blockquote':
            insertBlockquote();
            break;
        case 'bold':
            toggleInlineFormat('**', '**');
            break;
        case 'italic':
            toggleInlineFormat('*', '*');
            break;
        case 'strikethrough':
            toggleInlineFormat('~~', '~~');
            break;
        case 'link':
            insertLink();
            break;
        case 'wikilink':
            insertWikilink();
            break;
        case 'footnote':
            insertFootnote();
            break;
        case 'table':
            insertTable();
            break;
        case 'toc':
            insertTOC();
            break;
    }

    // Refocus editor
    editor.focus();
}

// Convert current line to body text (remove heading/list/blockquote prefixes)
function convertToBody() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.head);
    const lineText = line.text;

    // Remove heading, list, or blockquote prefixes
    const cleaned = lineText.replace(/^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+)/, '');

    if (cleaned !== lineText) {
        editor.dispatch({
            changes: {
                from: line.from,
                to: line.to,
                insert: cleaned
            }
        });
    }
}

// Insert heading prefix
function insertHeading(level) {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.head);
    const lineText = line.text;

    // Remove any existing heading prefix
    const cleaned = lineText.replace(/^#{1,6}\s+/, '');
    const prefix = '#'.repeat(level) + ' ';
    const newText = prefix + cleaned;

    editor.dispatch({
        changes: {
            from: line.from,
            to: line.to,
            insert: newText
        },
        selection: {
            anchor: line.from + newText.length
        }
    });
}

// Insert list prefix
function insertList(type) {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.head);
    const lineText = line.text;

    // Remove any existing list or heading prefix
    const cleaned = lineText.replace(/^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+)/, '');
    const prefix = type === 'bullet' ? '- ' : '1. ';
    const newText = prefix + cleaned;

    editor.dispatch({
        changes: {
            from: line.from,
            to: line.to,
            insert: newText
        },
        selection: {
            anchor: line.from + newText.length
        }
    });
}

// Insert blockquote prefix
function insertBlockquote() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.head);
    const lineText = line.text;

    // Remove any existing prefix
    const cleaned = lineText.replace(/^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+)/, '');
    const newText = '> ' + cleaned;

    editor.dispatch({
        changes: {
            from: line.from,
            to: line.to,
            insert: newText
        },
        selection: {
            anchor: line.from + newText.length
        }
    });
}

// Toggle inline formatting (bold, italic, strikethrough)
function toggleInlineFormat(prefix, suffix) {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.doc.sliceString(selection.from, selection.to);

    if (selectedText) {
        // Check if already formatted
        const beforeText = state.doc.sliceString(
            Math.max(0, selection.from - prefix.length),
            selection.from
        );
        const afterText = state.doc.sliceString(
            selection.to,
            Math.min(state.doc.length, selection.to + suffix.length)
        );

        if (beforeText === prefix && afterText === suffix) {
            // Remove formatting
            editor.dispatch({
                changes: [
                    { from: selection.from - prefix.length, to: selection.from, insert: '' },
                    { from: selection.to - prefix.length, to: selection.to - prefix.length + suffix.length, insert: '' }
                ],
                selection: {
                    anchor: selection.from - prefix.length,
                    head: selection.to - prefix.length
                }
            });
        } else {
            // Add formatting
            const newText = prefix + selectedText + suffix;
            editor.dispatch({
                changes: {
                    from: selection.from,
                    to: selection.to,
                    insert: newText
                },
                selection: {
                    anchor: selection.from + prefix.length,
                    head: selection.to + prefix.length
                }
            });
        }
    } else {
        // No selection, insert format markers and place cursor between them
        editor.dispatch({
            changes: {
                from: selection.from,
                to: selection.to,
                insert: prefix + suffix
            },
            selection: {
                anchor: selection.from + prefix.length
            }
        });
    }
}

// Insert link
function insertLink() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.doc.sliceString(selection.from, selection.to);

    if (selectedText) {
        const newText = `[${selectedText}](url)`;
        editor.dispatch({
            changes: {
                from: selection.from,
                to: selection.to,
                insert: newText
            },
            selection: {
                anchor: selection.from + selectedText.length + 3,
                head: selection.from + selectedText.length + 6
            }
        });
    } else {
        const newText = '[text](url)';
        editor.dispatch({
            changes: {
                from: selection.from,
                to: selection.to,
                insert: newText
            },
            selection: {
                anchor: selection.from + 1,
                head: selection.from + 5
            }
        });
    }
}

// Insert wikilink
function insertWikilink() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.doc.sliceString(selection.from, selection.to);

    if (selectedText) {
        const newText = `[[${selectedText}]]`;
        editor.dispatch({
            changes: {
                from: selection.from,
                to: selection.to,
                insert: newText
            },
            selection: {
                anchor: selection.from,
                head: selection.from + newText.length
            }
        });
    } else {
        const newText = '[[]]';
        editor.dispatch({
            changes: {
                from: selection.from,
                to: selection.to,
                insert: newText
            },
            selection: {
                anchor: selection.from + 2
            }
        });
    }
}

// Insert footnote
function insertFootnote() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;
    
    footnoteCounter++;
    const footnoteRef = `[^${footnoteCounter}]`;
    const footnoteDef = `\n\n[^${footnoteCounter}]: `;

    // Insert reference at cursor
    editor.dispatch({
        changes: [
            {
                from: selection.from,
                to: selection.to,
                insert: footnoteRef
            },
            {
                from: state.doc.length,
                to: state.doc.length,
                insert: footnoteDef
            }
        ],
        selection: {
            anchor: state.doc.length + footnoteDef.length
        }
    });
}

// Insert table template
function insertTable() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;

    const tableTemplate = `| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`;

    editor.dispatch({
        changes: {
            from: selection.from,
            to: selection.to,
            insert: tableTemplate
        },
        selection: {
            anchor: selection.from + 2,
            head: selection.from + 10
        }
    });
}

// Insert table of contents marker
function insertTOC() {
    const editor = getEditorView();
    const state = editor.state;
    const selection = state.selection.main;

    const tocMarker = '[TOC]\n\n';

    editor.dispatch({
        changes: {
            from: selection.from,
            to: selection.to,
            insert: tocMarker
        },
        selection: {
            anchor: selection.from + tocMarker.length
        }
    });
}

// Export formatting functions for keyboard shortcuts
export function applyBold() {
    handleFormatAction('bold');
}

export function applyItalic() {
    handleFormatAction('italic');
}

export function applyLink() {
    handleFormatAction('link');
}

export function applyStrikethrough() {
    handleFormatAction('strikethrough');
}

