let isFocusMode = false;

export function initFocusMode() {
    // Focus mode is handled by CSS classes
    // This module just manages the state
}

export function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    
    if (isFocusMode) {
        document.body.classList.add('focus-mode');
    } else {
        document.body.classList.remove('focus-mode');
    }
    
    return isFocusMode;
}

export function isFocusModeActive() {
    return isFocusMode;
}

export function enableFocusMode() {
    if (!isFocusMode) {
        toggleFocusMode();
    }
}

export function disableFocusMode() {
    if (isFocusMode) {
        toggleFocusMode();
    }
}

// Reset function for testing
export function resetFocusMode() {
    isFocusMode = false;
    document.body.classList.remove('focus-mode');
}

