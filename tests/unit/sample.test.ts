/**
 * Sample test file demonstrating Vitest setup
 *
 * This file serves as a reference for developers writing new tests.
 * It demonstrates basic Vitest syntax and patterns.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Sample Test Suite', () => {
  describe('Basic Assertions', () => {
    it('should pass a simple truth assertion', () => {
      expect(true).toBe(true);
    });

    it('should handle equality checks', () => {
      const result = 2 + 2;
      expect(result).toBe(4);
    });

    it('should work with objects', () => {
      const obj = { name: 'test', value: 42 };
      expect(obj).toEqual({ name: 'test', value: 42 });
    });

    it('should work with arrays', () => {
      const arr = [1, 2, 3];
      expect(arr).toHaveLength(3);
      expect(arr).toContain(2);
    });
  });

  describe('Mock Functions', () => {
    it('should create and call a mock function', () => {
      const mockFn = vi.fn();
      mockFn('test');

      expect(mockFn).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should mock function return values', () => {
      const mockFn = vi.fn().mockReturnValue('mocked result');
      const result = mockFn();

      expect(result).toBe('mocked result');
    });
  });

  describe('Setup and Teardown', () => {
    let testValue: number;

    beforeEach(() => {
      testValue = 0;
    });

    afterEach(() => {
      testValue = 0;
    });

    it('should initialize testValue in beforeEach', () => {
      expect(testValue).toBe(0);
      testValue = 100;
      expect(testValue).toBe(100);
    });

    it('should reset testValue between tests', () => {
      // This test runs after the previous one, but testValue is reset
      expect(testValue).toBe(0);
    });
  });

  describe('Async Tests', () => {
    it('should handle promises', async () => {
      const promise = Promise.resolve('success');
      const result = await promise;

      expect(result).toBe('success');
    });

    it('should handle async functions', async () => {
      const asyncFn = async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('done'), 10);
        });
      };

      const result = await asyncFn();
      expect(result).toBe('done');
    });
  });

  describe('Error Handling', () => {
    it('should catch thrown errors', () => {
      const throwError = () => {
        throw new Error('Test error');
      };

      expect(throwError).toThrow('Test error');
    });

    it('should handle rejected promises', async () => {
      const rejectPromise = () => Promise.reject(new Error('Rejected'));

      await expect(rejectPromise()).rejects.toThrow('Rejected');
    });
  });
});
