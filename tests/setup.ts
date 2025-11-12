/**
 * Vitest global setup file
 *
 * This file is automatically loaded before running tests (configured in vitest.config.ts).
 * It provides custom matchers and utilities from @testing-library/jest-dom.
 */

import '@testing-library/jest-dom';

// Mock matchMedia for tests that use window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock navigator.platform for platform detection tests
Object.defineProperty(navigator, 'platform', {
  writable: true,
  value: 'MacIntel', // Default to Mac for tests, can be overridden in individual tests
});
