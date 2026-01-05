import { describe, it, expect, beforeEach } from 'vitest';
import { initEditor, getEditorContent, setEditorContent } from '../src/js/editor.js';
import { initPreview, updatePreview, togglePreview } from '../src/js/preview.js';
import { toggleFocusMode } from '../src/js/focus.js';

describe('Integration Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="editor"></div>
      <div id="preview"></div>
      <div id="editor-container"></div>
      <div id="preview-container" class="hidden"></div>
    `;
  });

  it('should sync editor content to preview', () => {
    const container = document.getElementById('editor');
    const onChange = (content) => {
      updatePreview(content);
    };
    
    initEditor(container, onChange);
    initPreview();
    
    const markdown = '# Test\n\nThis is a test.';
    setEditorContent(markdown);
    
    const preview = document.getElementById('preview');
    // Wait a bit for async updates
    setTimeout(() => {
      expect(preview.innerHTML).toContain('Test');
    }, 100);
  });

  it('should work with focus mode and preview together', () => {
    const container = document.getElementById('editor');
    initEditor(container);
    initPreview();
    
    // Enable preview
    togglePreview();
    expect(document.getElementById('preview-container').classList.contains('hidden')).toBe(false);
    
    // Enable focus mode
    toggleFocusMode();
    expect(document.body.classList.contains('focus-mode')).toBe(true);
    
    // Both should work together
    expect(document.getElementById('preview-container').classList.contains('hidden')).toBe(false);
    expect(document.body.classList.contains('focus-mode')).toBe(true);
  });

  it('should handle markdown rendering correctly', () => {
    initPreview();
    
    const testCases = [
      { input: '# Header', shouldContain: '<h1' },
      { input: '**bold**', shouldContain: '<strong>' },
      { input: '*italic*', shouldContain: '<em>' },
      { input: '[link](url)', shouldContain: '<a' },
      { input: '`code`', shouldContain: '<code>' }
    ];
    
    testCases.forEach(({ input, shouldContain }) => {
      updatePreview(input);
      const preview = document.getElementById('preview');
      expect(preview.innerHTML).toContain(shouldContain);
    });
  });

  it('should handle empty content gracefully', () => {
    const container = document.getElementById('editor');
    initEditor(container);
    initPreview();
    
    setEditorContent('');
    updatePreview('');
    
    expect(getEditorContent()).toBe('');
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toBeDefined();
  });
});

