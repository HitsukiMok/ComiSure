import React from 'react';
import StarRating from './StarRating';

function relativeTime(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function truncateAddress(addr) {
  if (!addr || addr.length < 12) return addr || '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function RoleBadge({ role }) {
  const isClient = role === 'client';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium ${
        isClient ? 'bg-status-funded text-ink' : 'bg-status-released text-ink'
      }`}
    >
      {isClient ? 'Client' : 'Artist'}
    </span>
  );
}

function ReviewItem({ review }) {
  const hasRole = review.reviewer_role === 'client' || review.reviewer_role === 'artist';

  return (
    <li className="flex flex-col gap-1 p-4 rounded-xl bg-surface border border-fog/20">
      <div className="flex items-center gap-2 flex-wrap">
        {hasRole ? (
          <RoleBadge role={review.reviewer_role} />
        ) : (
          <span className="text-xs text-fog font-mono">{truncateAddress(review.reviewer_address)}</span>
        )}
        <StarRating value={review.star_rating} readonly size="sm" />
        <span className="ml-auto text-xs text-fog">{relativeTime(review.created_at)}</span>
      </div>
      {review.text && <p className="text-sm text-ink mt-1">{review.text}</p>}
    </li>
  );
}

export default function ReviewList({ reviews = [], loading = false, onLoadMore }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse" aria-busy="true" aria-label="Loading reviews">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-surface border border-fog/20" />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return <p className="text-sm text-fog text-center py-6">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3 list-none p-0 m-0">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </ul>
      {onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="self-center px-4 py-2 text-sm font-medium text-ink bg-surface border border-fog/30 rounded-pill hover:bg-fog/10 transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}
