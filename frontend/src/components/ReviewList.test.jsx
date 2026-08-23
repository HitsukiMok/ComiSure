import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ReviewList from './ReviewList';

describe('ReviewList', () => {
  it('renders "No reviews yet." when reviews array is empty', () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it('renders review items with star ratings, text, and timestamps', () => {
    const reviews = [
      {
        id: '1',
        reviewer_role: 'client',
        star_rating: 4,
        text: 'Loved the artwork!',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        reviewer_role: 'artist',
        star_rating: 5,
        text: 'Great client!',
        created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
    ];
    render(<ReviewList reviews={reviews} />);
    expect(screen.getByText('Loved the artwork!')).toBeInTheDocument();
    expect(screen.getByText('Great client!')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Artist')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    const { container } = render(<ReviewList loading={true} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders "Load more" button when onLoadMore is provided', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const reviews = [
      { id: '1', reviewer_role: 'client', star_rating: 3, text: 'Ok', created_at: new Date().toISOString() },
    ];
    render(<ReviewList reviews={reviews} onLoadMore={onLoadMore} />);
    const btn = screen.getByRole('button', { name: /load more/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('does NOT render "Load more" when onLoadMore is not provided', () => {
    const reviews = [
      { id: '1', reviewer_role: 'client', star_rating: 3, text: 'Ok', created_at: new Date().toISOString() },
    ];
    render(<ReviewList reviews={reviews} />);
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });
});
