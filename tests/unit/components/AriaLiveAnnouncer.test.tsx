import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import { AriaLiveAnnouncer } from '../../../src/components/AriaLiveAnnouncer';

describe('AriaLiveAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Accessibility', () => {
    it('should render with role="status"', () => {
      render(<AriaLiveAnnouncer message="Test announcement" />);
      const announcer = screen.getByTestId('aria-live-announcer');
      expect(announcer).toHaveAttribute('role', 'status');
    });

    it('should have aria-live="polite" by default', () => {
      render(<AriaLiveAnnouncer message="Test announcement" />);
      const announcer = screen.getByTestId('aria-live-announcer');
      expect(announcer).toHaveAttribute('aria-live', 'polite');
    });

    it('should accept aria-live="assertive" via politeness prop', () => {
      render(<AriaLiveAnnouncer message="Critical alert" politeness="assertive" />);
      const announcer = screen.getByTestId('aria-live-announcer');
      expect(announcer).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-atomic="true"', () => {
      render(<AriaLiveAnnouncer message="Test announcement" />);
      const announcer = screen.getByTestId('aria-live-announcer');
      expect(announcer).toHaveAttribute('aria-atomic', 'true');
    });

    it('should be visually hidden with sr-only class', () => {
      render(<AriaLiveAnnouncer message="Test announcement" />);
      const announcer = screen.getByTestId('aria-live-announcer');
      expect(announcer).toHaveClass('sr-only');
    });
  });

  describe('Message Announcement', () => {
    it('should announce message after 100ms delay', () => {
      render(<AriaLiveAnnouncer message="Test announcement" />);
      const announcer = screen.getByTestId('aria-live-announcer');

      // Initially empty
      expect(announcer).toHaveTextContent('');

      // Fast-forward 100ms
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Message should now be announced
      expect(announcer).toHaveTextContent('Test announcement');
    });

    it('should update announcement when message prop changes', () => {
      const { rerender } = render(<AriaLiveAnnouncer message="First message" />);
      const announcer = screen.getByTestId('aria-live-announcer');

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(announcer).toHaveTextContent('First message');

      // Update message
      rerender(<AriaLiveAnnouncer message="Second message" />);
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer).toHaveTextContent('Second message');
    });

    it('should clear previous timer when message changes quickly', () => {
      const { rerender } = render(<AriaLiveAnnouncer message="First" />);
      const announcer = screen.getByTestId('aria-live-announcer');

      // Change message before 100ms delay
      act(() => {
        vi.advanceTimersByTime(50);
      });
      rerender(<AriaLiveAnnouncer message="Second" />);

      // Fast-forward remaining time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should only show second message
      expect(announcer).toHaveTextContent('Second');
    });

    it('should handle empty message', () => {
      render(<AriaLiveAnnouncer message="" />);
      const announcer = screen.getByTestId('aria-live-announcer');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer).toHaveTextContent('');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const { unmount } = render(<AriaLiveAnnouncer message="Test" />);

      // Spy on clearTimeout
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should announce search focus correctly', () => {
      render(
        <AriaLiveAnnouncer message="Search field focused. Type to search skills or press Escape to clear." />
      );
      const announcer = screen.getByTestId('aria-live-announcer');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer).toHaveTextContent(
        'Search field focused. Type to search skills or press Escape to clear.'
      );
    });

    it('should announce tab switch correctly', () => {
      render(<AriaLiveAnnouncer message="Switched to Details tab, 2 of 6" />);
      const announcer = screen.getByTestId('aria-live-announcer');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer).toHaveTextContent('Switched to Details tab, 2 of 6');
    });

    it('should handle rapid announcements (debouncing)', () => {
      const { rerender } = render(<AriaLiveAnnouncer message="Tab 1" />);
      const announcer = screen.getByTestId('aria-live-announcer');

      // Rapidly change tabs
      act(() => {
        vi.advanceTimersByTime(30);
      });
      rerender(<AriaLiveAnnouncer message="Tab 2" />);

      act(() => {
        vi.advanceTimersByTime(30);
      });
      rerender(<AriaLiveAnnouncer message="Tab 3" />);

      act(() => {
        vi.advanceTimersByTime(30);
      });
      rerender(<AriaLiveAnnouncer message="Tab 4" />);

      // Wait for final announcement
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer).toHaveTextContent('Tab 4');
    });
  });
});
