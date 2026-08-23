import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { reviewService } from '../services/api';

export default function ReputationBadge({ walletAddress }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    reviewService
      .getReputation(walletAddress, { signal: controller.signal })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [walletAddress]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 animate-pulse">
        <span className="h-4 w-20 bg-gray-300 rounded" />
        <span className="h-4 w-10 bg-gray-300 rounded" />
      </span>
    );
  }

  if (error) {
    return <span className="text-sm text-gray-400">Reputation unavailable</span>;
  }

  if (data && data.review_count === 0) {
    return <span className="text-sm text-gray-400">No reviews yet</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <StarRating value={data.aggregate_score} readonly size="sm" />
      <span className="text-sm font-medium text-gray-700">{data.aggregate_score}</span>
      <span className="text-sm text-gray-500">({data.review_count} reviews)</span>
    </span>
  );
}
