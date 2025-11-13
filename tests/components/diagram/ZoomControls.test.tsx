import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZoomControls } from '../../../src/components/diagram/ZoomControls';

describe('ZoomControls', () => {
  it('renders zoom controls with correct zoom level', () => {
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockZoomToFit = vi.fn();

    render(
      <ZoomControls
        zoomLevel={1.5}
        onZoomIn={mockZoomIn}
        onZoomOut={mockZoomOut}
        onZoomToFit={mockZoomToFit}
      />
    );

    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('calls onZoomIn when zoom in button is clicked', async () => {
    const user = userEvent.setup();
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockZoomToFit = vi.fn();

    render(
      <ZoomControls
        zoomLevel={1.0}
        onZoomIn={mockZoomIn}
        onZoomOut={mockZoomOut}
        onZoomToFit={mockZoomToFit}
      />
    );

    const zoomInButton = screen.getByLabelText('Zoom in');
    await user.click(zoomInButton);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
  });

  it('calls onZoomOut when zoom out button is clicked', async () => {
    const user = userEvent.setup();
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockZoomToFit = vi.fn();

    render(
      <ZoomControls
        zoomLevel={1.0}
        onZoomIn={mockZoomIn}
        onZoomOut={mockZoomOut}
        onZoomToFit={mockZoomToFit}
      />
    );

    const zoomOutButton = screen.getByLabelText('Zoom out');
    await user.click(zoomOutButton);

    expect(mockZoomOut).toHaveBeenCalledTimes(1);
  });

  it('calls onZoomToFit when fit to screen button is clicked', async () => {
    const user = userEvent.setup();
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockZoomToFit = vi.fn();

    render(
      <ZoomControls
        zoomLevel={1.0}
        onZoomIn={mockZoomIn}
        onZoomOut={mockZoomOut}
        onZoomToFit={mockZoomToFit}
      />
    );

    const fitButton = screen.getByLabelText('Zoom to fit');
    await user.click(fitButton);

    expect(mockZoomToFit).toHaveBeenCalledTimes(1);
  });
});
