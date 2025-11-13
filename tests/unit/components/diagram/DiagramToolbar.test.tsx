/**
 * Unit tests for DiagramToolbar component
 *
 * Tests the composition of zoom, layout, and export controls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagramToolbar } from '@/components/diagram/DiagramToolbar';
import { createRef } from 'react';

describe('DiagramToolbar', () => {
  let mockOnZoomIn: ReturnType<typeof vi.fn>;
  let mockOnZoomOut: ReturnType<typeof vi.fn>;
  let mockOnZoomReset: ReturnType<typeof vi.fn>;
  let mockOnLayoutChange: ReturnType<typeof vi.fn>;
  let mockDiagramRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    mockOnZoomIn = vi.fn();
    mockOnZoomOut = vi.fn();
    mockOnZoomReset = vi.fn();
    mockOnLayoutChange = vi.fn();
    mockDiagramRef = createRef();
  });

  describe('Basic Rendering', () => {
    it('should render all control sections', () => {
      render(
        <DiagramToolbar
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      // Check for zoom controls
      expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();

      // Check for layout controls
      expect(screen.getByLabelText(/top to bottom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/left to right/i)).toBeInTheDocument();

      // Check for export controls
      expect(screen.getByLabelText(/export as png/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export as svg/i)).toBeInTheDocument();
    });

    it('should display zoom level', () => {
      render(
        <DiagramToolbar
          zoom={1.5}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should display keyboard shortcuts hint', () => {
      render(
        <DiagramToolbar
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      expect(screen.getByText('Cmd/Ctrl')).toBeInTheDocument();
      expect(screen.getByText('+/-/0')).toBeInTheDocument();
      expect(screen.getByText(/to zoom/i)).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should use flexbox layout', () => {
      const { container } = render(
        <DiagramToolbar
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      const toolbar = container.firstChild as HTMLElement;
      expect(toolbar).toHaveClass('flex');
    });

    it('should have separators between control groups', () => {
      const { container } = render(
        <DiagramToolbar
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      // Find all dividers
      const dividers = container.querySelectorAll('[aria-hidden="true"]');
      expect(dividers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('should have keyboard navigable controls', async () => {
      render(
        <DiagramToolbar
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      // All buttons should be focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have proper ARIA labels for all controls', () => {
      render(
        <DiagramToolbar
          zoom={1.0}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
          onZoomReset={mockOnZoomReset}
          layout="TD"
          onLayoutChange={mockOnLayoutChange}
          diagramRef={mockDiagramRef}
          mermaidSource="graph TD"
          skillName="Test Skill"
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
