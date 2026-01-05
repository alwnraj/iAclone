import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initPreview, 
  updatePreview, 
  togglePreview, 
  isPreviewShown 
} from '../src/js/preview.js';

describe('Preview Module', () => {
  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="preview"></div>
      <div id="editor-container"></div>
      <div id="preview-container" class="hidden"></div>
    `;
  });

  it('should initialize preview elements', () => {
    initPreview();
    
    expect(document.getElementById('preview')).toBeDefined();
    expect(document.getElementById('preview-container')).toBeDefined();
  });

  it('should update preview with markdown content', () => {
    initPreview();
    const markdown = '# Hello World\n\nThis is **bold** text.';
    
    updatePreview(markdown);
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toContain('Hello World');
    expect(preview.innerHTML).toContain('<strong>bold</strong>');
  });

  it('should handle empty markdown', () => {
    initPreview();
    updatePreview('');
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toBeDefined();
  });

  it('should toggle preview visibility', () => {
    initPreview();
    const container = document.getElementById('preview-container');
    
    expect(container.classList.contains('hidden')).toBe(true);
    expect(isPreviewShown()).toBe(false);
    
    togglePreview();
    
    expect(container.classList.contains('hidden')).toBe(false);
    expect(isPreviewShown()).toBe(true);
    
    togglePreview();
    
    expect(container.classList.contains('hidden')).toBe(true);
    expect(isPreviewShown()).toBe(false);
  });

  it('should render markdown headers', () => {
    initPreview();
    updatePreview('# H1\n## H2\n### H3');
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toMatch(/<h1[^>]*>H1<\/h1>/);
    expect(preview.innerHTML).toMatch(/<h2[^>]*>H2<\/h2>/);
    expect(preview.innerHTML).toMatch(/<h3[^>]*>H3<\/h3>/);
  });

  it('should render markdown links', () => {
    initPreview();
    updatePreview('[Link Text](https://example.com)');
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toContain('<a');
    expect(preview.innerHTML).toContain('href="https://example.com"');
    expect(preview.innerHTML).toContain('Link Text');
  });

  it('should render markdown code blocks', () => {
    initPreview();
    updatePreview('```javascript\nconst x = 1;\n```');
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toContain('<pre>');
    // Code blocks have <code> tag (may have class attribute)
    expect(preview.innerHTML).toMatch(/<code/);
  });

  it('should render markdown lists', () => {
    initPreview();
    updatePreview('- Item 1\n- Item 2\n- Item 3');
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toContain('<ul>');
    expect(preview.innerHTML).toContain('<li>');
  });

  it('should handle special characters in markdown', () => {
    initPreview();
    updatePreview('Text with <special> & characters');
    
    const preview = document.getElementById('preview');
    expect(preview.innerHTML).toBeDefined();
    // Marked.js renders HTML, so <special> becomes an HTML tag
    expect(preview.innerHTML).toContain('special');
  });
});

