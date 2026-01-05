import { getEditorView } from './editor.js';
import { enableFocusMode as enableBasicFocusMode, disableFocusMode as disableBasicFocusMode } from './focus.js';

// State management
let state = {
    focusMode: null, // null, 'sentence', 'paragraph', 'typewriter'
    styleCheck: {
        fillers: false,
        cliches: false,
        redundancies: false,
        custom: false
    },
    authors: {
        human: false,
        other: false
    }
};

// Common filler words to highlight
const FILLERS = [
    'very', 'really', 'just', 'quite', 'actually', 'basically', 'literally',
    'honestly', 'simply', 'clearly', 'obviously', 'definitely', 'certainly',
    'perhaps', 'maybe', 'possibly', 'probably', 'somewhat', 'rather',
    'fairly', 'pretty', 'kind of', 'sort of', 'a bit', 'a little'
];

// Common clichés
const CLICHES = [
    'at the end of the day', 'think outside the box', 'low hanging fruit',
    'pushing the envelope', 'par for the course', 'touch base', 'circle back',
    'easier said than done', 'it goes without saying', 'in this day and age',
    'last but not least', 'the bottom line', 'a win-win situation'
];

// Redundant phrases
const REDUNDANCIES = [
    'advance planning', 'basic fundamentals', 'close proximity', 'end result',
    'free gift', 'past history', 'personal opinion', 'unexpected surprise',
    'absolutely essential', 'completely finished', 'true fact', 'future plans'
];

// Initialize view options dropdown
export function initViewOptions() {
    const toggleBtn = document.getElementById('view-options-toggle');
    const dropdown = document.getElementById('view-options-dropdown');
    
    if (!toggleBtn || !dropdown) return;
    
    // Toggle dropdown visibility
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#view-options-container')) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Handle option clicks
    dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.view-option');
        if (!option) return;
        
        const action = option.getAttribute('data-action');
        const mode = option.getAttribute('data-mode');
        const type = option.getAttribute('data-type');
        
        if (action === 'focus-mode') {
            toggleFocusMode(mode, option);
        } else if (action === 'style-check') {
            toggleStyleCheck(type, option);
        } else if (action === 'author') {
            toggleAuthor(type, option);
        }
    });
    
    // Load saved state from localStorage
    loadState();
}

// Toggle focus mode
function toggleFocusMode(mode, element) {
    const editor = getEditorView();
    if (!editor) return;
    
    // Clear all focus mode buttons
    document.querySelectorAll('[data-action="focus-mode"]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // If clicking the same mode, turn it off
    if (state.focusMode === mode) {
        state.focusMode = null;
        disableBasicFocusMode();
        document.body.classList.remove('focus-sentence', 'focus-paragraph', 'focus-typewriter');
    } else {
        // Enable new focus mode
        state.focusMode = mode;
        enableBasicFocusMode();
        element.classList.add('active');
        
        // Remove all focus mode classes
        document.body.classList.remove('focus-sentence', 'focus-paragraph', 'focus-typewriter');
        
        // Add specific focus mode class
        document.body.classList.add(`focus-${mode}`);
        
        // Apply typewriter mode scrolling if needed
        if (mode === 'typewriter') {
            enableTypewriterMode(editor);
        }
    }
    
    saveState();
}

// Toggle style check
function toggleStyleCheck(type, element) {
    state.styleCheck[type] = !state.styleCheck[type];
    element.classList.toggle('active');
    
    // Apply or remove style check highlights
    applyStyleCheck();
    saveState();
}

// Toggle author visibility
function toggleAuthor(type, element) {
    state.authors[type] = !state.authors[type];
    element.classList.toggle('active');
    saveState();
}

// Enable typewriter mode (keep cursor vertically centered)
function enableTypewriterMode(editor) {
    const editorContainer = document.getElementById('editor-container');
    
    const centerCursor = () => {
        const cursor = document.querySelector('.cm-cursor-primary');
        if (cursor) {
            const containerHeight = editorContainer.clientHeight;
            const cursorTop = cursor.offsetTop;
            const scrollTop = cursorTop - containerHeight / 2;
            editorContainer.scrollTop = scrollTop;
        }
    };
    
    // Center on initial load
    setTimeout(centerCursor, 100);
    
    // Center on cursor movement
    editor.dom.addEventListener('click', centerCursor);
    editor.dom.addEventListener('keydown', () => {
        setTimeout(centerCursor, 10);
    });
}

// Apply style check highlights
function applyStyleCheck() {
    const editor = getEditorView();
    if (!editor) return;
    
    // Remove existing highlights
    document.querySelectorAll('.style-highlight').forEach(el => el.classList.remove('style-highlight'));
    
    // Get all active style checks
    const activeChecks = Object.entries(state.styleCheck)
        .filter(([_, enabled]) => enabled)
        .map(([type, _]) => type);
    
    if (activeChecks.length === 0) return;
    
    // For now, we'll add a simple implementation
    // A more sophisticated version would use CodeMirror decorations
    const content = editor.state.doc.toString().toLowerCase();
    
    // Build patterns to check
    let patterns = [];
    if (activeChecks.includes('fillers')) {
        patterns = patterns.concat(FILLERS);
    }
    if (activeChecks.includes('cliches')) {
        patterns = patterns.concat(CLICHES);
    }
    if (activeChecks.includes('redundancies')) {
        patterns = patterns.concat(REDUNDANCIES);
    }
    
    // Log detected issues (could be expanded to visual highlights)
    patterns.forEach(pattern => {
        if (content.includes(pattern)) {
            console.log(`Style check: Found "${pattern}"`);
        }
    });
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('view-options-state', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('view-options-state');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            state = { ...state, ...loaded };
            
            // Restore UI state
            if (state.focusMode) {
                const modeBtn = document.querySelector(`[data-action="focus-mode"][data-mode="${state.focusMode}"]`);
                if (modeBtn) {
                    modeBtn.classList.add('active');
                    enableBasicFocusMode();
                    document.body.classList.add(`focus-${state.focusMode}`);
                }
            }
            
            // Restore style check state
            Object.entries(state.styleCheck).forEach(([type, enabled]) => {
                if (enabled) {
                    const btn = document.querySelector(`[data-action="style-check"][data-type="${type}"]`);
                    if (btn) btn.classList.add('active');
                }
            });
            
            // Restore author state
            Object.entries(state.authors).forEach(([type, enabled]) => {
                if (enabled) {
                    const btn = document.querySelector(`[data-action="author"][data-type="${type}"]`);
                    if (btn) btn.classList.add('active');
                }
            });
        } catch (e) {
            console.error('Failed to load view options state:', e);
        }
    }
}

// Export state getter
export function getViewOptionsState() {
    return state;
}

