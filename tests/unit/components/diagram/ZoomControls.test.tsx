/**
 * Unit tests for ZoomControls component
 *
 * Tests zoom in/out/reset functionality and keyboard shortcuts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZoomControls } from '@/components/diagram/ZoomControls';

describe('ZoomControls', () => {
  let mockOnZoomIn: ReturnType<typeof vi.fn>;
  let mockOnZoomOut: ReturnType<typeof vi.fn>;
  let mockOnZoomReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnZoomIn = vi.fn();
    mockOnZoomOut = vi.fn();
    mockOnZoomReset = vi.fn();
  });

  describe('Basic Rendering', () => {
    it('should render zoom buttons', () => {
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom to fit/i)).toBeInTheDocument();
    });

    it('should display zoom level percentage', () => {
      render(
        <ZoomControls
          zoom={1.5}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should round zoom level to nearest integer', () => {
      render(
        <ZoomControls
          zoom={1.234}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      expect(screen.getByText('123%')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onZoomIn when zoom in button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      const zoomInButton = screen.getByLabelText(/zoom in/i);
      await user.click(zoomInButton);

      expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
    });

    it('should call onZoomOut when zoom out button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      const zoomOutButton = screen.getByLabelText(/zoom out/i);
      await user.click(zoomOutButton);

      expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
    });

    it('should call onZoomReset when reset button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={2.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      const resetButton = screen.getByLabelText(/zoom to fit/i);
      await user.click(resetButton);

      expect(mockOnZoomReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should zoom in on Cmd/Ctrl + Plus', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      // Simulate Cmd/Ctrl + Plus
      await user.keyboard('{Meta>}+{/Meta}');

      expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
    });

    it('should zoom in on Cmd/Ctrl + Equals', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      // Simulate Cmd/Ctrl + =
      await user.keyboard('{Meta>}={/Meta}');

      expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
    });

    it('should zoom out on Cmd/Ctrl + Minus', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      // Simulate Cmd/Ctrl + -
      await user.keyboard('{Meta>}-{/Meta}');

      expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
    });

    it('should reset zoom on Cmd/Ctrl + 0', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={2.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      // Simulate Cmd/Ctrl + 0
      await user.keyboard('{Meta>}0{/Meta}');

      expect(mockOnZoomReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      expect(screen.getByLabelText(/zoom in.*cmd.*ctrl/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom out.*cmd.*ctrl/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom to fit.*cmd.*ctrl/i)).toBeInTheDocument();
    });

    it('should have role status for zoom level', () => {
      render(
        <ZoomControls
          zoom={1.5}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      const zoomStatus = screen.getByRole('status');
      expect(zoomStatus).toHaveAccessibleName(/current zoom level.*150 percent/i);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
        />
      );

      // Tab through buttons
      await user.tab();
      expect(screen.getByLabelText(/zoom out/i)).toHaveFocus();

      await user.tab();
      // Skip zoom level display (not focusable)

      await user.tab();
      expect(screen.getByLabelText(/zoom in/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/zoom to fit/i)).toHaveFocus();
    });
  });

  describe('Custom Class Name', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ZoomControls
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          className="custom-class"
        />
      );

      const zoomControls = container.firstChild as HTMLElement;
      expect(zoomControls).toHaveClass('custom-class');
    });
  });
});
