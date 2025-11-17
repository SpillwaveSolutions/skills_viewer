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

  describe('User Story 3 - Fit to View Button (T044-T047)', () => {
    it('T044: should render Fit to View button with correct styling', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const fitButton = screen.getByRole('button', { name: /fit diagram to viewport/i });

      // Verify button exists
      expect(fitButton).toBeInTheDocument();

      // Verify has blue secondary styling
      expect(fitButton).toHaveClass('bg-blue-600');
      expect(fitButton).toHaveClass('text-white');
      expect(fitButton).toHaveClass('rounded-md');
    });

    it('T045: should call onFitToView when button clicked', () => {
      const mockOnFitToView = vi.fn();
      render(<DiagramToolbar {...defaultProps} onFitToView={mockOnFitToView} />);

      const fitButton = screen.getByRole('button', { name: /fit diagram to viewport/i });
      fireEvent.click(fitButton);

      expect(mockOnFitToView).toHaveBeenCalledTimes(1);
    });

    it('T046: should have proper ARIA label', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const fitButton = screen.getByRole('button', { name: /fit diagram to viewport/i });

      // Verify aria-label
      expect(fitButton).toHaveAttribute('aria-label', 'Fit diagram to viewport');
    });

    it('T055: should have zero accessibility violations (Fit to View)', async () => {
      const { container } = render(<DiagramToolbar {...defaultProps} />);

      // Run axe scan
      const results = await axe(container);

      // Verify zero violations
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('User Story 4 - Export Button Colors (T057-T063)', () => {
    it('T057: should render Download SVG button with correct indigo styling', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const svgButton = screen.getByRole('button', { name: /download diagram as svg file/i });

      // Verify button exists
      expect(svgButton).toBeInTheDocument();

      // Verify indigo tertiary styling
      expect(svgButton).toHaveClass('bg-indigo-600');
      expect(svgButton).toHaveClass('text-white');
      expect(svgButton).toHaveClass('rounded-md');
      expect(svgButton).toHaveClass('hover:bg-indigo-700');
    });

    it('T058: should render Download Mermaid button with correct gray styling', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const mermaidButton = screen.getByRole('button', { name: /download mermaid source code/i });

      // Verify button exists
      expect(mermaidButton).toBeInTheDocument();

      // Verify gray tertiary styling
      expect(mermaidButton).toHaveClass('bg-gray-600');
      expect(mermaidButton).toHaveClass('text-white');
      expect(mermaidButton).toHaveClass('rounded-md');
      expect(mermaidButton).toHaveClass('hover:bg-gray-700');
    });

    it('T059: should call onDownloadSVG when Download SVG button clicked', () => {
      const mockOnDownloadSVG = vi.fn();
      render(<DiagramToolbar {...defaultProps} onDownloadSVG={mockOnDownloadSVG} />);

      const svgButton = screen.getByRole('button', { name: /download diagram as svg file/i });
      fireEvent.click(svgButton);

      expect(mockOnDownloadSVG).toHaveBeenCalledTimes(1);
    });

    it('T060: should call onDownloadMermaid when Download Mermaid button clicked', () => {
      const mockOnDownloadMermaid = vi.fn();
      render(<DiagramToolbar {...defaultProps} onDownloadMermaid={mockOnDownloadMermaid} />);

      const mermaidButton = screen.getByRole('button', { name: /download mermaid source code/i });
      fireEvent.click(mermaidButton);

      expect(mockOnDownloadMermaid).toHaveBeenCalledTimes(1);
    });

    it('T061: should disable export buttons when content not ready', () => {
      render(<DiagramToolbar {...defaultProps} svgContent="" mermaidSource="" />);

      const svgButton = screen.getByRole('button', { name: /download diagram as svg file/i });
      const mermaidButton = screen.getByRole('button', { name: /download mermaid source code/i });

      // Both buttons should be disabled when content empty
      expect(svgButton).toBeDisabled();
      expect(mermaidButton).toBeDisabled();

      // Verify disabled styling
      expect(svgButton).toHaveClass('disabled:bg-gray-300');
      expect(mermaidButton).toHaveClass('disabled:bg-gray-300');
    });

    it('T062: should have proper ARIA labels and tooltips on export buttons', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const svgButton = screen.getByRole('button', { name: /download diagram as svg file/i });
      const mermaidButton = screen.getByRole('button', { name: /download mermaid source code/i });

      // Verify ARIA labels
      expect(svgButton).toHaveAttribute('aria-label', 'Download diagram as SVG file');
      expect(mermaidButton).toHaveAttribute('aria-label', 'Download Mermaid source code');

      // Verify tooltips (T070)
      expect(svgButton).toHaveAttribute(
        'title',
        'Download as scalable vector graphic (SVG) - editable in design tools'
      );
      expect(mermaidButton).toHaveAttribute(
        'title',
        'Download Mermaid source (.mmd) - editable diagram markup'
      );
    });

    it('T072: should have zero accessibility violations (export buttons)', async () => {
      const { container } = render(<DiagramToolbar {...defaultProps} />);

      // Run axe scan on entire toolbar
      const results = await axe(container);

      // Verify zero violations
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('User Story 5 - Regenerate Purple Accent (T074-T079)', () => {
    it('T074: should render Regenerate button with purple accent styling', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const regenerateButton = screen.getByRole('button', { name: /force regenerate diagram/i });

      // Verify button exists
      expect(regenerateButton).toBeInTheDocument();

      // Verify purple primary action styling
      expect(regenerateButton).toHaveClass('bg-purple-600');
      expect(regenerateButton).toHaveClass('text-white');
      expect(regenerateButton).toHaveClass('rounded-md');
      expect(regenerateButton).toHaveClass('hover:bg-purple-700');
    });

    it('T075: should call onRegenerate when Regenerate button clicked', () => {
      const mockOnRegenerate = vi.fn();
      render(<DiagramToolbar {...defaultProps} onRegenerate={mockOnRegenerate} />);

      const regenerateButton = screen.getByRole('button', { name: /force regenerate diagram/i });
      fireEvent.click(regenerateButton);

      expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
    });

    it('T076: should show loading state when isLoading=true', () => {
      render(<DiagramToolbar {...defaultProps} isLoading={true} />);

      // Should display "Rendering..." text instead of "🔄 Regenerate"
      expect(screen.getByText('Rendering...')).toBeInTheDocument();
      expect(screen.queryByText('🔄 Regenerate')).not.toBeInTheDocument();
    });

    it('T077: should disable Regenerate button during loading', () => {
      render(<DiagramToolbar {...defaultProps} isLoading={true} />);

      const regenerateButton = screen.getByRole('button', { name: /force regenerate diagram/i });

      // Button should be disabled
      expect(regenerateButton).toBeDisabled();

      // Verify disabled styling
      expect(regenerateButton).toHaveClass('disabled:bg-gray-300');
    });

    it('T078: should have proper ARIA label for cache-busting', () => {
      render(<DiagramToolbar {...defaultProps} />);

      const regenerateButton = screen.getByRole('button', { name: /force regenerate diagram/i });

      // Verify enhanced ARIA label explaining cache bypass
      expect(regenerateButton).toHaveAttribute(
        'aria-label',
        'Force regenerate diagram bypassing cache'
      );

      // Verify tooltip
      expect(regenerateButton).toHaveAttribute(
        'title',
        'Regenerate diagram from source (bypasses cache)'
      );
    });

    it('T088: should have zero accessibility violations (Regenerate button)', async () => {
      const { container } = render(<DiagramToolbar {...defaultProps} />);

      // Run axe scan on entire toolbar
      const results = await axe(container);

      // Verify zero violations
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('Responsive Layout (T090-T092)', () => {
    it('T090: should render toolbar in single row on ≥800px viewports', () => {
      // Set viewport to desktop size
      global.innerWidth = 1024;

      render(<DiagramToolbar {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');

      // Verify flex layout is used (allows single-row rendering)
      expect(toolbar).toHaveClass('flex');
      expect(toolbar).toHaveClass('gap-2');

      // Verify all buttons are visible
      expect(screen.getByRole('combobox', { name: /diagram layout/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /fit diagram/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /download.*svg/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /download.*mermaid/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /force regenerate/i })).toBeVisible();
    });

    it('T091: should hide export buttons on <768px viewports (md: breakpoint)', () => {
      // Set viewport to mobile size
      global.innerWidth = 640;

      render(<DiagramToolbar {...defaultProps} />);

      const svgButton = screen.getByRole('button', { name: /download.*svg/i });
      const mermaidButton = screen.getByRole('button', { name: /download.*mermaid/i });

      // Verify export buttons have responsive hiding classes
      expect(svgButton).toHaveClass('hidden');
      expect(svgButton).toHaveClass('md:block');
      expect(mermaidButton).toHaveClass('hidden');
      expect(mermaidButton).toHaveClass('md:block');
    });

    it('T100: should have zero accessibility violations on multiple viewport sizes', async () => {
      // Test desktop viewport (1024px)
      global.innerWidth = 1024;
      const { container: desktopContainer } = render(<DiagramToolbar {...defaultProps} />);
      let results = await axe(desktopContainer);
      expect(results.violations).toHaveLength(0);

      // Test tablet viewport (768px - md: breakpoint)
      global.innerWidth = 768;
      const { container: tabletContainer } = render(<DiagramToolbar {...defaultProps} />);
      results = await axe(tabletContainer);
      expect(results.violations).toHaveLength(0);

      // Test mobile viewport (640px)
      global.innerWidth = 640;
      const { container: mobileContainer } = render(<DiagramToolbar {...defaultProps} />);
      results = await axe(mobileContainer);
      expect(results.violations).toHaveLength(0);
    });
  });
});
