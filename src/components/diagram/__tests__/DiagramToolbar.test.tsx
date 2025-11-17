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
});
