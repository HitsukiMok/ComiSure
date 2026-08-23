import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReputationBadge from './ReputationBadge';

vi.mock('../services/api', () => ({
  reviewService: {
    getReputation: vi.fn(),
  },
}));

import { reviewService } from '../services/api';

describe('ReputationBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton loader while loading', () => {
    reviewService.getReputation.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<ReputationBadge walletAddress="GABCDEFG" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows "No reviews yet" when review_count is 0', async () => {
    reviewService.getReputation.mockResolvedValueOnce({ aggregate_score: null, review_count: 0 });
    render(<ReputationBadge walletAddress="GABCDEFG" />);
    await waitFor(() => expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument());
  });

  it('shows aggregate score and review count when data is loaded', async () => {
    reviewService.getReputation.mockResolvedValueOnce({ aggregate_score: 4.5, review_count: 12 });
    render(<ReputationBadge walletAddress="GABCDEFG" />);
    await waitFor(() => expect(screen.getByText('4.5')).toBeInTheDocument());
    expect(screen.getByText('(12 reviews)')).toBeInTheDocument();
  });

  it('shows "Reputation unavailable" on API error', async () => {
    reviewService.getReputation.mockRejectedValueOnce(new Error('Network error'));
    render(<ReputationBadge walletAddress="GABCDEFG" />);
    await waitFor(() => expect(screen.getByText(/reputation unavailable/i)).toBeInTheDocument());
  });

  it('shows "Reputation unavailable" when walletAddress is missing', async () => {
    render(<ReputationBadge walletAddress="" />);
    await waitFor(() => expect(screen.getByText(/reputation unavailable/i)).toBeInTheDocument());
  });
});
