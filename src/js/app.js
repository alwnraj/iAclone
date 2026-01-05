import { initEditor, getEditorContent, setEditorContent, getEditorView } from './editor.js';
import { initPreview, updatePreview, togglePreview, syncScroll } from './preview.js';
import { toggleFocusMode } from './focus.js';
import { initToolbar, applyBold, applyItalic, applyLink, applyStrikethrough } from './toolbar.js';
import { initViewOptions } from './viewOptions.js';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// State
let currentFilePath = null;
let hasUnsavedChanges = false;

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Update statistics
function updateStats(content) {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    document.getElementById('word-count').textContent = `${words} Word${words !== 1 ? 's' : ''}`;
}

// File operations
function newFile() {
    // Clear the editor
    setEditorContent('');
    currentFilePath = null;
    hasUnsavedChanges = false;
    updateWindowTitle();
    updateStats('');
    updatePreview('');
    
    // Focus the editor
    const editor = getEditorView();
    if (editor) {
        editor.focus();
    }
}

async function openFile() {
    try {
        const selected = await open({
            multiple: false,
            filters: [{
                name: 'Markdown',
                extensions: ['md', 'markdown', 'txt']
            }]
        });
        
        if (selected) {
            const content = await readTextFile(selected);
            setEditorContent(content);
            currentFilePath = selected;
            hasUnsavedChanges = false;
            updateWindowTitle();
        }
    } catch (error) {
        console.error('Error opening file:', error);
        alert('Failed to open file: ' + error);
    }
}

async function saveFile() {
    try {
        const content = getEditorContent();
        
        if (!currentFilePath) {
            return await saveFileAs();
        }
        
        await writeTextFile(currentFilePath, content);
        hasUnsavedChanges = false;
        updateWindowTitle();
    } catch (error) {
        console.error('Error saving file:', error);
        alert('Failed to save file: ' + error);
    }
}

// Extract first heading as filename suggestion
function getFilenameFromContent() {
    const content = getEditorContent();
    
    // Match the first H1 heading (# Heading)
    const h1Match = content.match(/^#\s+(.+)$/m);
    
    if (h1Match && h1Match[1]) {
        // Sanitize the heading text to make a valid filename
        const heading = h1Match[1].trim();
        const sanitized = heading
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .substring(0, 100); // Limit length
        
        return sanitized || 'Untitled';
    }
    
    return 'Untitled';
}

async function saveFileAs() {
    try {
        const defaultFilename = getFilenameFromContent();
        
        const selected = await save({
            defaultPath: defaultFilename + '.md',
            filters: [{
                name: 'Markdown',
                extensions: ['md', 'markdown']
            }]
        });
        
        if (selected) {
            currentFilePath = selected;
            await saveFile();
        }
    } catch (error) {
        console.error('Error saving file:', error);
        alert('Failed to save file: ' + error);
    }
}

function updateWindowTitle() {
    let filename;
    
    if (currentFilePath) {
        filename = currentFilePath.split('/').pop();
    } else {
        // Use first heading as document name if no file path
        const heading = getFilenameFromContent();
        filename = heading !== 'Untitled' ? heading : 'Untitled';
    }
    
    const title = `${filename}${hasUnsavedChanges ? ' •' : ''} - iA Clone`;
    document.title = title;
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', async (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;
        
        // Cmd/Ctrl + N: New file
        if (modifier && !e.shiftKey && e.key === 'n') {
            e.preventDefault();
            newFile();
        }
        
        // Cmd/Ctrl + O: Open file
        if (modifier && !e.shiftKey && e.key === 'o') {
            e.preventDefault();
            await openFile();
        }
        
        // Cmd/Ctrl + S: Save file
        if (modifier && !e.shiftKey && e.key === 's') {
            e.preventDefault();
            await saveFile();
        }
        
        // Cmd/Ctrl + Shift + S: Save as
        if (modifier && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            await saveFileAs();
        }
        
        // Cmd/Ctrl + P: Toggle preview
        if (modifier && !e.shiftKey && e.key === 'p') {
            e.preventDefault();
            togglePreview();
        }
        
        // Cmd/Ctrl + D: Toggle focus mode
        if (modifier && !e.shiftKey && e.key === 'd') {
            e.preventDefault();
            toggleFocusMode();
        }
        
        // Cmd/Ctrl + B: Bold
        if (modifier && !e.shiftKey && e.key === 'b') {
            e.preventDefault();
            applyBold();
        }
        
        // Cmd/Ctrl + I: Italic
        if (modifier && !e.shiftKey && e.key === 'i') {
            e.preventDefault();
            applyItalic();
        }
        
        // Cmd/Ctrl + K: Link
        if (modifier && !e.shiftKey && e.key === 'k') {
            e.preventDefault();
            applyLink();
        }
        
        // Cmd/Ctrl + Shift + X: Strikethrough
        if (modifier && e.shiftKey && e.key === 'X') {
            e.preventDefault();
            applyStrikethrough();
        }
        
        // Cmd/Ctrl + Shift + T: Toggle theme
        if (modifier && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Initialize app
async function init() {
    // Initialize theme first
    initTheme();
    
    // Initialize preview
    initPreview();
    
    // Initialize toolbar
    initToolbar();
    
    // Initialize view options dropdown
    initViewOptions();
    
    // Auto-save drafts to localStorage
    let autoSaveTimeout;
    const handleEditorChange = (content) => {
        hasUnsavedChanges = true;
        updateWindowTitle();
        updateStats(content);
        updatePreview(content);
        
        // Auto-save to localStorage after 1 second of inactivity
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            if (!currentFilePath) {
                localStorage.setItem('draft-content', content);
            }
        }, 1000);
    };
    
    // Initialize editor
    const editorContainer = document.getElementById('editor');
    const editor = initEditor(editorContainer, handleEditorChange);
    
    // Setup sync scrolling
    syncScroll(editor);
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Theme toggle button
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Load welcome message or last content
    const welcomeMessage = `# Welcome to iA Clone

A minimalist, distraction-free markdown editor.

## Getting Started

Start typing to begin your writing journey. All your favorite markdown features are supported:

- **Bold text** with \`**bold**\` or Cmd/Ctrl + B
- *Italic text* with \`*italic*\` or Cmd/Ctrl + I
- [Links](https://example.com) with Cmd/Ctrl + K
- \`inline code\`

## Keyboard Shortcuts

### File Operations
- **Cmd/Ctrl + N**: New file
- **Cmd/Ctrl + O**: Open file
- **Cmd/Ctrl + S**: Save file
- **Cmd/Ctrl + Shift + S**: Save as

### Formatting
- **Cmd/Ctrl + B**: Bold
- **Cmd/Ctrl + I**: Italic
- **Cmd/Ctrl + K**: Insert link
- **Cmd/Ctrl + Shift + X**: Strikethrough

### View
- **Cmd/Ctrl + P**: Toggle preview
- **Cmd/Ctrl + D**: Toggle focus mode
- **Cmd/Ctrl + Shift + T**: Toggle theme

## Formatting Toolbar

Use the toolbar at the bottom to quickly format your text with headings, lists, blockquotes, and more!

## Focus Mode

Press **Cmd/Ctrl + D** to enter focus mode. Only the current line will be highlighted, helping you concentrate on what you're writing.

---

*Delete this text and start writing!*
`;

    // Check if there's saved content in localStorage
    const savedContent = localStorage.getItem('draft-content');
    if (savedContent) {
        setEditorContent(savedContent);
        updateStats(savedContent);
        updatePreview(savedContent);
    } else {
        setEditorContent(welcomeMessage);
        updateStats(welcomeMessage);
        updatePreview(welcomeMessage);
    }
    
    // Focus editor
    editor.focus();
}

// Start the app
init();

