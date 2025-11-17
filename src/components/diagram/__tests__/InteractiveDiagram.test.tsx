import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InteractiveDiagram } from '../InteractiveDiagram';
import type { Skill } from '../../../types';

/**
 * Baseline tests for InteractiveDiagram component
 * Feature: 018-diagram-toolbar-redesign
 *
 * Purpose: Verify existing functionality before toolbar extraction
 * These tests ensure we don't break anything during refactoring
 */

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue('<svg></svg>'),
}));

describe('InteractiveDiagram - Baseline Tests', () => {
  const mockSkill: Skill = {
    name: 'test-skill',
    location: '/test/path',
    description: 'Test skill description',
    version: '1.0.0',
    content: 'Test content',
    triggers: [],
    references: [],
    scripts: [],
    metadata: {},
  };

  const mockHandlers = {
    onNavigateToReference: vi.fn(),
    onNavigateToScript: vi.fn(),
  };

  it('should render without crashing', () => {
    render(<InteractiveDiagram skill={mockSkill} {...mockHandlers} />);

    // Verify the component renders
    expect(screen.getByText(/Skill Architecture/i)).toBeInTheDocument();
  });

  it('should render toolbar controls', () => {
    render(<InteractiveDiagram skill={mockSkill} {...mockHandlers} />);

    // Verify layout selector exists
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // Verify zoom controls exist (buttons)
    const zoomOutButtons = screen.getAllByText('−');
    expect(zoomOutButtons.length).toBeGreaterThan(0);

    const zoomInButtons = screen.getAllByText('+');
    expect(zoomInButtons.length).toBeGreaterThan(0);

    // Verify action buttons exist
    expect(screen.getByText(/Fit to View/i)).toBeInTheDocument();
    expect(screen.getByText(/Download SVG/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Mermaid/i)).toBeInTheDocument();
    expect(screen.getByText(/Regenerate/i)).toBeInTheDocument();
  });

  it('should have correct initial state', () => {
    const { container } = render(<InteractiveDiagram skill={mockSkill} {...mockHandlers} />);

    // Check that diagram container exists
    const diagramContainer = container.querySelector('.bg-gray-50');
    expect(diagramContainer).toBeInTheDocument();
  });
});
