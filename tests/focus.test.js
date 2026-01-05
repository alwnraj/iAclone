import { describe, it, expect, beforeEach } from 'vitest';
import { 
  toggleFocusMode, 
  isFocusModeActive,
  enableFocusMode,
  disableFocusMode,
  resetFocusMode
} from '../src/js/focus.js';

describe('Focus Mode Module', () => {
  beforeEach(() => {
    // Reset module state and DOM
    resetFocusMode();
    document.body.className = '';
  });

  it('should toggle focus mode on', () => {
    expect(isFocusModeActive()).toBe(false);
    expect(document.body.classList.contains('focus-mode')).toBe(false);
    
    toggleFocusMode();
    
    expect(isFocusModeActive()).toBe(true);
    expect(document.body.classList.contains('focus-mode')).toBe(true);
  });

  it('should toggle focus mode off', () => {
    toggleFocusMode(); // Turn on
    expect(isFocusModeActive()).toBe(true);
    
    toggleFocusMode(); // Turn off
    
    expect(isFocusModeActive()).toBe(false);
    expect(document.body.classList.contains('focus-mode')).toBe(false);
  });

  it('should return current focus mode state', () => {
    expect(isFocusModeActive()).toBe(false);
    
    toggleFocusMode();
    expect(isFocusModeActive()).toBe(true);
    
    toggleFocusMode();
    expect(isFocusModeActive()).toBe(false);
  });

  it('should enable focus mode', () => {
    expect(isFocusModeActive()).toBe(false);
    
    enableFocusMode();
    
    expect(isFocusModeActive()).toBe(true);
    expect(document.body.classList.contains('focus-mode')).toBe(true);
  });

  it('should not duplicate focus mode class when enabling twice', () => {
    enableFocusMode();
    enableFocusMode();
    
    const classes = document.body.className.split(' ');
    const focusModeCount = classes.filter(c => c === 'focus-mode').length;
    
    expect(focusModeCount).toBe(1);
  });

  it('should disable focus mode', () => {
    enableFocusMode();
    expect(isFocusModeActive()).toBe(true);
    
    disableFocusMode();
    
    expect(isFocusModeActive()).toBe(false);
    expect(document.body.classList.contains('focus-mode')).toBe(false);
  });

  it('should handle disabling when already disabled', () => {
    expect(isFocusModeActive()).toBe(false);
    
    disableFocusMode();
    
    expect(isFocusModeActive()).toBe(false);
  });
});

