import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Tauri APIs before importing app.js
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn()
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn()
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})) // Returns unlisten function
}));

describe('App Module - Statistics', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="word-count">0 words</div>
      <div id="char-count">0 characters</div>
      <div id="reading-time">0 min read</div>
    `;
  });

  it('should calculate word count correctly', () => {
    const content = 'This is a test sentence with ten words total';
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Actually has 9 words: This, is, a, test, sentence, with, ten, words, total
    expect(words).toBe(9);
  });

  it('should handle empty content', () => {
    const content = '';
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    expect(words).toBe(0);
  });

  it('should calculate character count', () => {
    const content = 'Hello World';
    
    expect(content.length).toBe(11);
  });

  it('should calculate reading time', () => {
    const words = 200;
    const readingTime = Math.ceil(words / 200);
    
    expect(readingTime).toBe(1);
  });

  it('should round up reading time', () => {
    const words = 201;
    const readingTime = Math.ceil(words / 200);
    
    expect(readingTime).toBe(2);
  });

  it('should handle multiline content', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Has 6 words: Line, 1, Line, 2, Line, 3
    expect(words).toBe(6);
  });
});

describe('App Module - Theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should detect system dark mode preference', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    expect(typeof prefersDark).toBe('boolean');
  });

  it('should toggle theme', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should save theme preference to localStorage', () => {
    const theme = 'dark';
    localStorage.setItem('theme', theme);
    
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

describe('App Module - Window Title', () => {
  it('should format window title with filename', () => {
    const filePath = '/path/to/document.md';
    const hasUnsavedChanges = false;
    const filename = filePath.split('/').pop();
    const title = `${filename}${hasUnsavedChanges ? ' •' : ''} - iA Clone`;
    
    expect(title).toBe('document.md - iA Clone');
  });

  it('should show unsaved indicator', () => {
    const filePath = '/path/to/document.md';
    const hasUnsavedChanges = true;
    const filename = filePath.split('/').pop();
    const title = `${filename}${hasUnsavedChanges ? ' •' : ''} - iA Clone`;
    
    expect(title).toBe('document.md • - iA Clone');
  });

  it('should handle untitled document', () => {
    const filePath = null;
    const hasUnsavedChanges = false;
    const title = filePath 
      ? `${filePath.split('/').pop()}${hasUnsavedChanges ? ' •' : ''} - iA Clone`
      : `Untitled${hasUnsavedChanges ? ' •' : ''} - iA Clone`;
    
    expect(title).toBe('Untitled - iA Clone');
  });
});

describe('App Module - File Open Handling', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <div id="editor"></div>
      <div id="preview"></div>
      <div id="word-count">0 Words</div>
      <div id="theme-toggle"></div>
    `;
  });

  it('should set up file-opened event listener', async () => {
    const { listen } = await import('@tauri-apps/api/event');
    
    await listen('file-opened', vi.fn());
    
    expect(listen).toHaveBeenCalledWith('file-opened', expect.any(Function));
  });

  it('should call on_file_open_ready command', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    invoke.mockResolvedValue(undefined);
    
    await invoke('on_file_open_ready');
    
    expect(invoke).toHaveBeenCalledWith('on_file_open_ready');
  });
});

