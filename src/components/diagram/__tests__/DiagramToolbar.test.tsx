import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DiagramToolbar } from '../DiagramToolbar';
import type { DiagramToolbarProps } from '../DiagramToolbar.types';

/**
 * Unit tests for DiagramToolbar component
 * Feature: 018-diagram-toolbar-redesign
 *
 * Test coverage includes:
 * - Component rendering
 * - User interactions (clicks, selections)
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Disabled states
 * - Tooltips
 */

describe('DiagramToolbar', () => {
  // Default props for testing
  const defaultProps: DiagramToolbarProps = {
    layout: 'TD',
    onLayoutChange: vi.fn(),
    zoom: 1.0,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onResetZoom: vi.fn(),
    onFitToView: vi.fn(),
    svgContent: '<svg></svg>',
    mermaidSource: 'graph TD',
    onDownloadSVG: vi.fn(),
    onDownloadMermaid: vi.fn(),
    isLoading: false,
    onRegenerate: vi.fn(),
    skillName: 'test-skill',
  };

  describe('Component Rendering', () => {
    it('should render toolbar with all controls', () => {
      render(<DiagramToolbar {...defaultProps} />);

      // Verify toolbar container exists
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
  });

  describe('User Story 1 - Layout Selector (T011-T013)', () => {
    it('T011: should render layout selector with current layout value', () => {
      render(<DiagramToolbar {...defaultProps} layout="TD" />);

      const selector = screen.getByRole('combobox', {
        name: /diagram layout direction/i,
      });
      expect(selector).toBeInTheDocument();
      expect(selector).toHaveValue('TD');

      // Verify both options are present
      expect(screen.getByRole('option', { name: /top to bottom/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /left to right/i })).toBeInTheDocument();
    });

    it('T012: should call onLayoutChange when option selected', () => {
      const mockOnLayoutChange = vi.fn();
      render(<DiagramToolbar {...defaultProps} onLayoutChange={mockOnLayoutChange} />);

      const selector = screen.getByRole('combobox', {
        name: /diagram layout direction/i,
      });

      // Simulate user changing layout
      fireEvent.change(selector, { target: { value: 'LR' } });

      expect(mockOnLayoutChange).toHaveBeenCalledWith('LR');
      expect(mockOnLayoutChange).toHaveBeenCalledTimes(1);
    });

    it('T013: should have proper ARIA labels on layout selector', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const selector = screen.getByRole('combobox', {
        name: /diagram layout direction/i,
      });

      // Verify aria-label attribute
      expect(selector).toHaveAttribute('aria-label', 'Diagram layout direction');
    });

    it('T021: should have zero accessibility violations (layout selector)', async () => {
      const { container } = render(<DiagramToolbar {...defaultProps} />);

      // Run axe scan on the toolbar
      const results = await axe(container);

      // Verify zero violations
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('User Story 2 - Zoom Controls (T023-T030)', () => {
    it('T023: should render zoom buttons with correct percentage display', () => {
      render(<DiagramToolbar {...defaultProps} zoom={1.5} />);

      // Verify zoom out button
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();

      // Verify percentage display (150% for zoom=1.5)
      expect(screen.getByText('150%')).toBeInTheDocument();

      // Verify zoom in button
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    });

    it('T024: should call onZoomIn when zoom in button clicked', () => {
      const mockOnZoomIn = vi.fn();
      render(<DiagramToolbar {...defaultProps} onZoomIn={mockOnZoomIn} />);

      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      fireEvent.click(zoomInButton);

      expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
    });

    it('T025: should call onZoomOut when zoom out button clicked', () => {
      const mockOnZoomOut = vi.fn();
      render(<DiagramToolbar {...defaultProps} onZoomOut={mockOnZoomOut} />);

      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      fireEvent.click(zoomOutButton);

      expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
    });

    it('T026: should call onResetZoom when percentage button clicked', () => {
      const mockOnResetZoom = vi.fn();
      render(<DiagramToolbar {...defaultProps} onResetZoom={mockOnResetZoom} zoom={1.5} />);

      // Percentage button should have aria-label for reset zoom
      const percentageButton = screen.getByRole('button', { name: /reset zoom to 100%/i });
      fireEvent.click(percentageButton);

      expect(mockOnResetZoom).toHaveBeenCalledTimes(1);
    });

    it('T027: should disable zoom in button at max zoom (5.0)', () => {
      render(<DiagramToolbar {...defaultProps} zoom={5.0} />);

      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });

      // Button should be disabled
      expect(zoomInButton).toBeDisabled();

      // Should have aria-disabled attribute
      expect(zoomInButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('T028: should disable zoom out button at min zoom (0.1)', () => {
      render(<DiagramToolbar {...defaultProps} zoom={0.1} />);

      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });

      // Button should be disabled
      expect(zoomOutButton).toBeDisabled();

      // Should have aria-disabled attribute
      expect(zoomOutButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('T029: should show correct tooltips based on zoom state', () => {
      const { rerender } = render(<DiagramToolbar {...defaultProps} zoom={1.0} />);

      // At normal zoom, both buttons enabled
      let zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      let zoomOutButton = screen.getByRole('button', { name: /zoom out/i });

      expect(zoomInButton).toHaveAttribute('title', expect.stringContaining('Zoom In'));
      expect(zoomOutButton).toHaveAttribute('title', expect.stringContaining('Zoom Out'));

      // At max zoom, zoom in should have different tooltip
      rerender(<DiagramToolbar {...defaultProps} zoom={5.0} />);
      zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toHaveAttribute('title', expect.stringContaining('Maximum zoom'));

      // At min zoom, zoom out should have different tooltip
      rerender(<DiagramToolbar {...defaultProps} zoom={0.1} />);
      zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toHaveAttribute('title', expect.stringContaining('Minimum zoom'));
    });

    it('T041: should render quickly (<50ms performance requirement)', () => {
      const startTime = performance.now();

      render(<DiagramToolbar {...defaultProps} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Verify component renders in less than 50ms (per spec requirements)
      expect(renderTime).toBeLessThan(50);
    });

    it('T042: should have zero accessibility violations (zoom controls)', async () => {
      const { container } = render(<DiagramToolbar {...defaultProps} />);

      // Run axe scan focusing on zoom controls
      const results = await axe(container);

      // Verify zero violations
      expect(results.violations).toHaveLength(0);
    });
  });
});
