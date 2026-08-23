import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('renders 5 stars always', () => {
    const { container } = render(<StarRating value={3} readonly />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(5);
  });

  it('renders correct number of filled stars for integer value', () => {
    const { container } = render(<StarRating value={3} readonly />);
    const paths = container.querySelectorAll('path[fill="#f59e0b"]');
    // 3 filled stars = 3 paths with amber fill
    expect(paths).toHaveLength(3);
  });

  it('renders partial fill clip for fractional value', () => {
    const { container } = render(<StarRating value={3.5} readonly />);
    const clipPaths = container.querySelectorAll('clipPath');
    expect(clipPaths).toHaveLength(1);
    const rect = clipPaths[0].querySelector('rect');
    // 0.5 * 24 = 12
    expect(rect).toHaveAttribute('width', '12');
  });

  it('fires onChange with correct star index when clicked in input mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} readonly={false} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[2]); // 3rd star
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does NOT render buttons in readonly mode', () => {
    render(<StarRating value={4} readonly />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('applies correct size via SVG width attribute', () => {
    const { container } = render(<StarRating value={1} readonly size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
  });

  it('applies lg size', () => {
    const { container } = render(<StarRating value={1} readonly size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
  });
});
