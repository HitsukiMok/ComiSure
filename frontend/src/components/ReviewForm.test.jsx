import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReviewForm from './ReviewForm';

vi.mock('../services/api', () => ({
  reviewService: {
    submit: vi.fn(),
  },
}));

import { reviewService } from '../services/api';

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders star rating selector and textarea', () => {
    render(<ReviewForm commissionId="c1" />);
    expect(screen.getByRole('radiogroup', { name: /star rating/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/leave a review/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting without selecting a rating', async () => {
    const user = userEvent.setup();
    render(<ReviewForm commissionId="c1" />);
    await user.click(screen.getByRole('button', { name: /submit review/i }));
    expect(screen.getByText(/please select a star rating/i)).toBeInTheDocument();
  });

  it('submits correctly with star rating and text', async () => {
    const user = userEvent.setup();
    reviewService.submit.mockResolvedValueOnce({});
    const onSubmitted = vi.fn();
    render(<ReviewForm commissionId="c1" onSubmitted={onSubmitted} />);

    // Select 4 stars
    const stars = screen.getByRole('radiogroup').querySelectorAll('button');
    await user.click(stars[3]);

    // Type review text
    await user.type(screen.getByPlaceholderText(/leave a review/i), 'Great work!');

    // Submit
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(reviewService.submit).toHaveBeenCalledWith({
        commission_id: 'c1',
        star_rating: 4,
        text: 'Great work!',
      });
    });
    await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
    expect(screen.getByText(/review submitted/i)).toBeInTheDocument();
  });

  it('disables submit button during submission', async () => {
    const user = userEvent.setup();
    let resolveSubmit;
    reviewService.submit.mockReturnValueOnce(new Promise((r) => { resolveSubmit = r; }));
    render(<ReviewForm commissionId="c1" />);

    const stars = screen.getByRole('radiogroup').querySelectorAll('button');
    await user.click(stars[0]);
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    resolveSubmit({});
    await waitFor(() => expect(screen.getByRole('button', { name: /submit review/i })).not.toBeDisabled());
  });

  it('shows error toast when submission fails', async () => {
    const user = userEvent.setup();
    reviewService.submit.mockRejectedValueOnce({
      response: { data: { detail: 'Already reviewed' } },
    });
    render(<ReviewForm commissionId="c1" />);

    const stars = screen.getByRole('radiogroup').querySelectorAll('button');
    await user.click(stars[0]);
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => expect(screen.getByText(/already reviewed/i)).toBeInTheDocument());
  });
});
