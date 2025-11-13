/**
 * Unit tests for LayoutSelector component
 *
 * Tests diagram layout switching (top-to-bottom vs left-to-right)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutSelector } from '@/components/diagram/LayoutSelector';

describe('LayoutSelector', () => {
  let mockOnLayoutChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnLayoutChange = vi.fn();
  });

  describe('Basic Rendering', () => {
    it('should render both layout buttons', () => {
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      expect(screen.getByLabelText(/top to bottom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/left to right/i)).toBeInTheDocument();
    });

    it('should display "Layout:" label', () => {
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      expect(screen.getByText('Layout:')).toBeInTheDocument();
    });
  });

  describe('Layout Selection', () => {
    it('should highlight TD button when TD layout is active', () => {
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      const tdButton = screen.getByLabelText(/top to bottom/i);
      expect(tdButton).toHaveClass('bg-indigo-100');
      expect(tdButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should highlight LR button when LR layout is active', () => {
      render(<LayoutSelector layout="LR" onLayoutChange={mockOnLayoutChange} />);

      const lrButton = screen.getByLabelText(/left to right/i);
      expect(lrButton).toHaveClass('bg-indigo-100');
      expect(lrButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should call onLayoutChange with TD when TD button clicked', async () => {
      const user = userEvent.setup();
      render(<LayoutSelector layout="LR" onLayoutChange={mockOnLayoutChange} />);

      const tdButton = screen.getByLabelText(/top to bottom/i);
      await user.click(tdButton);

      expect(mockOnLayoutChange).toHaveBeenCalledWith('TD');
    });

    it('should call onLayoutChange with LR when LR button clicked', async () => {
      const user = userEvent.setup();
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      const lrButton = screen.getByLabelText(/left to right/i);
      await user.click(lrButton);

      expect(mockOnLayoutChange).toHaveBeenCalledWith('LR');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      expect(screen.getByLabelText('Top to bottom layout')).toBeInTheDocument();
      expect(screen.getByLabelText('Left to right layout')).toBeInTheDocument();
    });

    it('should indicate pressed state with aria-pressed', () => {
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      const tdButton = screen.getByLabelText(/top to bottom/i);
      const lrButton = screen.getByLabelText(/left to right/i);

      expect(tdButton).toHaveAttribute('aria-pressed', 'true');
      expect(lrButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      // Tab to first button
      await user.tab();
      expect(screen.getByLabelText(/top to bottom/i)).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(screen.getByLabelText(/left to right/i)).toHaveFocus();
    });

    it('should be activatable with keyboard', async () => {
      const user = userEvent.setup();
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      const lrButton = screen.getByLabelText(/left to right/i);
      lrButton.focus();

      // Press Enter
      await user.keyboard('{Enter}');

      expect(mockOnLayoutChange).toHaveBeenCalledWith('LR');
    });
  });

  describe('Custom Class Name', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} className="custom-class" />
      );

      const layoutSelector = container.firstChild as HTMLElement;
      expect(layoutSelector).toHaveClass('custom-class');
    });
  });

  describe('Visual Feedback', () => {
    it('should show different styling for active button', () => {
      render(<LayoutSelector layout="TD" onLayoutChange={mockOnLayoutChange} />);

      const tdButton = screen.getByLabelText(/top to bottom/i);
      const lrButton = screen.getByLabelText(/left to right/i);

      // Active button has indigo background
      expect(tdButton).toHaveClass('bg-indigo-100');
      // Inactive button has white background
      expect(lrButton).toHaveClass('bg-white');
    });
  });
});
