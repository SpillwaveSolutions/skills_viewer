/**
 * Unit tests for usePlatformModifier hook
 *
 * TDD Approach: These tests are written BEFORE the hook implementation.
 * They should FAIL until src/hooks/usePlatformModifier.ts is implemented.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlatformModifier } from '@/hooks/usePlatformModifier';

describe('usePlatformModifier', () => {
  beforeEach(() => {
    // Clean up any global stubs before each test
    vi.unstubAllGlobals();
  });

  describe('macOS Detection', () => {
    it('should detect macOS from MacIntel platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'MacIntel' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(true);
      expect(result.current.platform).toBe('mac');
      expect(result.current.modifierKey).toBe('Cmd');
      expect(result.current.modifierSymbol).toBe('⌘');

      vi.unstubAllGlobals();
    });

    it('should detect macOS from MacPPC platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'MacPPC' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(true);
      expect(result.current.platform).toBe('mac');
      expect(result.current.modifierKey).toBe('Cmd');
      expect(result.current.modifierSymbol).toBe('⌘');

      vi.unstubAllGlobals();
    });

    it('should detect macOS from Mac68K platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Mac68K' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(true);
      expect(result.current.platform).toBe('mac');

      vi.unstubAllGlobals();
    });
  });

  describe('Windows Detection', () => {
    it('should detect Windows from Win32 platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Win32' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(false);
      expect(result.current.platform).toBe('windows');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });

    it('should detect Windows from Win64 platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Win64' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(false);
      expect(result.current.platform).toBe('windows');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });

    it('should detect Windows from Windows platform (case-insensitive)', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Windows' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(false);
      expect(result.current.platform).toBe('windows');

      vi.unstubAllGlobals();
    });
  });

  describe('Linux Detection', () => {
    it('should detect Linux from Linux x86_64 platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Linux x86_64' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(false);
      expect(result.current.platform).toBe('linux');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });

    it('should detect Linux from Linux i686 platform', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Linux i686' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(false);
      expect(result.current.platform).toBe('linux');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });

    it('should default to linux for unknown platforms', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'FreeBSD' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.isMac).toBe(false);
      expect(result.current.platform).toBe('linux');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });
  });

  describe('Modifier Key Mapping', () => {
    it('should map Cmd key for macOS', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'MacIntel' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.modifierKey).toBe('Cmd');
      expect(result.current.modifierSymbol).toBe('⌘');

      vi.unstubAllGlobals();
    });

    it('should map Ctrl key for Windows', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Win32' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });

    it('should map Ctrl key for Linux', () => {
      vi.stubGlobal('navigator', { ...navigator, platform: 'Linux x86_64' });

      const { result } = renderHook(() => usePlatformModifier());

      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.unstubAllGlobals();
    });
  });

  describe('Hook Stability', () => {
    it('should return stable reference across re-renders', () => {
      const { result, rerender } = renderHook(() => usePlatformModifier());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // Platform detection should be stable across re-renders
      expect(secondResult.platform).toBe(firstResult.platform);
      expect(secondResult.isMac).toBe(firstResult.isMac);
      expect(secondResult.modifierKey).toBe(firstResult.modifierKey);
      expect(secondResult.modifierSymbol).toBe(firstResult.modifierSymbol);
    });
  });
});
