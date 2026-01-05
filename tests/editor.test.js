import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initEditor, 
  getEditorContent, 
  setEditorContent, 
  getEditorView 
} from '../src/js/editor.js';

describe('Editor Module', () => {
  let container;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    container.id = 'editor';
    container.style.width = '100px';
    container.style.height = '100px';
    document.body.appendChild(container);
  });

  it('should initialize editor with empty content', () => {
    const onChange = vi.fn();
    const editor = initEditor(container, onChange);
    
    expect(editor).toBeDefined();
    expect(getEditorContent()).toBe('');
  });

  it('should get editor content', async () => {
    const editor = initEditor(container);
    setEditorContent('Test content');
    
    // Wait for CodeMirror to update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(getEditorContent()).toBe('Test content');
  });

  it('should set editor content', async () => {
    const editor = initEditor(container);
    setEditorContent('Initial content');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(getEditorContent()).toBe('Initial content');
    
    setEditorContent('Updated content');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(getEditorContent()).toBe('Updated content');
  });

  it('should replace existing content when setting new content', async () => {
    const editor = initEditor(container);
    setEditorContent('Old content');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setEditorContent('New content');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(getEditorContent()).toBe('New content');
    expect(getEditorContent()).not.toContain('Old content');
  });

  it('should handle empty content', async () => {
    const editor = initEditor(container);
    setEditorContent('Some content');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setEditorContent('');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(getEditorContent()).toBe('');
  });

  it('should handle multiline content', async () => {
    const editor = initEditor(container);
    const multiline = 'Line 1\nLine 2\nLine 3';
    setEditorContent(multiline);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(getEditorContent()).toBe(multiline);
  });

  it('should return editor view instance', () => {
    const editor = initEditor(container);
    const view = getEditorView();
    
    expect(view).toBeDefined();
    expect(view).toBe(editor);
  });
});

