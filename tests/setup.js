// Test setup file
import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  // Reset DOM
  document.body.innerHTML = '';
  document.body.className = '';
});

// Mock Tauri APIs for testing
if (typeof window !== 'undefined') {
  window.__TAURI__ = {
    invoke: vi.fn(),
    tauri: {
      invoke: vi.fn()
    }
  };
}

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}));

// Mock @tauri-apps/api/event
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})), // Returns unlisten function
  emit: vi.fn()
}));

// Mock localStorage with actual storage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Reset localStorage before each test
afterEach(() => {
  localStorageMock.clear();
});

