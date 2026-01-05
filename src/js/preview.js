import { marked } from 'marked';

let previewElement = null;
let editorContainer = null;
let previewContainer = null;
let isPreviewVisible = false;

export function initPreview() {
    previewElement = document.getElementById('preview');
    editorContainer = document.getElementById('editor-container');
    previewContainer = document.getElementById('preview-container');
    
    // Configure marked for better rendering
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

export function updatePreview(content) {
    if (previewElement) {
        const html = marked.parse(content);
        previewElement.innerHTML = html;
    }
}

export function togglePreview() {
    isPreviewVisible = !isPreviewVisible;
    
    if (isPreviewVisible) {
        previewContainer.classList.remove('hidden');
    } else {
        previewContainer.classList.add('hidden');
    }
    
    return isPreviewVisible;
}

export function isPreviewShown() {
    return isPreviewVisible;
}

// Synchronized scrolling between editor and preview
export function syncScroll(editorView) {
    if (!isPreviewVisible || !editorView) return;
    
    const editorScroller = editorView.scrollDOM;
    const previewScroller = previewContainer;
    
    editorScroller.addEventListener('scroll', () => {
        const scrollPercentage = editorScroller.scrollTop / (editorScroller.scrollHeight - editorScroller.clientHeight);
        previewScroller.scrollTop = scrollPercentage * (previewScroller.scrollHeight - previewScroller.clientHeight);
    });
}

