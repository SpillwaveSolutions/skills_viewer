import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutSelector } from '../../../src/components/diagram/LayoutSelector';

describe('LayoutSelector', () => {
  it('renders layout selector with current layout highlighted', () => {
    const mockOnLayoutChange = vi.fn();

    render(<LayoutSelector currentLayout="TD" onLayoutChange={mockOnLayoutChange} />);

    const topDownButton = screen.getByText('Top-Down').closest('button')!;
    const leftRightButton = screen.getByText('Left-Right').closest('button')!;

    expect(topDownButton).toHaveAttribute('aria-pressed', 'true');
    expect(leftRightButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onLayoutChange when Top-Down is clicked', async () => {
    const user = userEvent.setup();
    const mockOnLayoutChange = vi.fn();

    render(<LayoutSelector currentLayout="LR" onLayoutChange={mockOnLayoutChange} />);

    const topDownButton = screen.getByText('Top-Down').closest('button')!;
    await user.click(topDownButton);

    expect(mockOnLayoutChange).toHaveBeenCalledWith('TD');
  });

  it('calls onLayoutChange when Left-Right is clicked', async () => {
    const user = userEvent.setup();
    const mockOnLayoutChange = vi.fn();

    render(<LayoutSelector currentLayout="TD" onLayoutChange={mockOnLayoutChange} />);

    const leftRightButton = screen.getByText('Left-Right').closest('button')!;
    await user.click(leftRightButton);

    expect(mockOnLayoutChange).toHaveBeenCalledWith('LR');
  });

  it('highlights LR layout when selected', () => {
    const mockOnLayoutChange = vi.fn();

    render(<LayoutSelector currentLayout="LR" onLayoutChange={mockOnLayoutChange} />);

    const topDownButton = screen.getByText('Top-Down').closest('button')!;
    const leftRightButton = screen.getByText('Left-Right').closest('button')!;

    expect(topDownButton).toHaveAttribute('aria-pressed', 'false');
    expect(leftRightButton).toHaveAttribute('aria-pressed', 'true');
  });
});
