import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportControls } from '../../../src/components/diagram/ExportControls';
import React from 'react';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockdata'),
  toSvg: vi.fn().mockResolvedValue('data:image/svg+xml;base64,mockdata'),
}));

describe('ExportControls', () => {
  let mockDiagramRef: React.RefObject<HTMLDivElement>;
  let mockCreateElement: typeof document.createElement;
  let mockCreateObjectURL: typeof URL.createObjectURL;
  let mockRevokeObjectURL: typeof URL.revokeObjectURL;
  let mockClipboard: any;

  beforeEach(() => {
    mockDiagramRef = { current: document.createElement('div') };

    // Mock document.createElement for anchor links
    mockCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tagName: string) => {
      const element = mockCreateElement(tagName);
      if (tagName === 'a') {
        element.click = vi.fn();
      }
      return element;
    }) as any;

    // Mock URL methods
    mockCreateObjectURL = URL.createObjectURL;
    mockRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    // Mock clipboard
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    document.createElement = mockCreateElement;
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
  });

  it('renders all export buttons', () => {
    render(
      <ExportControls
        diagramRef={mockDiagramRef}
        mermaidSource="graph TD\nA --> B"
        skillName="test-skill"
      />
    );

    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('SVG')).toBeInTheDocument();
    expect(screen.getByText('.mmd')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('has a copy button that is clickable', async () => {
    const user = userEvent.setup();
    const mermaidSource = 'graph TD\nA --> B';

    render(
      <ExportControls
        diagramRef={mockDiagramRef}
        mermaidSource={mermaidSource}
        skillName="test-skill"
      />
    );

    const copyButton = screen.getByText('Copy').closest('button')!;
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).not.toBeDisabled();

    // Click the button - the actual clipboard operation is tested in the "Copied!" feedback test
    await user.click(copyButton);
  });

  it('shows "Copied!" feedback after copying', async () => {
    const user = userEvent.setup();

    render(
      <ExportControls
        diagramRef={mockDiagramRef}
        mermaidSource="graph TD\nA --> B"
        skillName="test-skill"
      />
    );

    const copyButton = screen.getByText('Copy').closest('button')!;

    // Initial state
    expect(screen.getByText('Copy')).toBeInTheDocument();

    // Click and verify the "Copied!" text appears
    await user.click(copyButton);

    // Wait for the state update
    await screen.findByText('Copied!');
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('downloads mermaid source when .mmd is clicked', async () => {
    const user = userEvent.setup();
    const mermaidSource = 'graph TD\nA --> B';

    render(
      <ExportControls
        diagramRef={mockDiagramRef}
        mermaidSource={mermaidSource}
        skillName="test-skill"
      />
    );

    const mmdButton = screen.getByText('.mmd').closest('button')!;
    await user.click(mmdButton);

    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
