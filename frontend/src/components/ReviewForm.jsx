import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating';
import { reviewService } from '../services/api';

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`mt-3 p-3 rounded-card-sm border text-sm ${
        isError
          ? 'bg-status-refunded border-border text-ink'
          : 'bg-status-released border-border text-ink'
      }`}
    >
      <div className="flex justify-between items-start">
        <span>{toast.message}</span>
        <button onClick={onClose} className="ml-2 text-fog hover:text-ink">×</button>
      </div>
    </motion.div>
  );
}

export default function ReviewForm({ commissionId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [ratingError, setRatingError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setRatingError('');

    if (rating === 0) {
      setRatingError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.submit({
        commission_id: commissionId,
        star_rating: rating,
        text: text.trim() || undefined,
      });
      setToast({ type: 'success', message: 'Review submitted!' });
      onSubmitted?.();
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to submit review.';
      setToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <StarRating value={rating} onChange={setRating} readonly={false} size="md" />
        {ratingError && <p className="text-sm text-red-500 mt-1">{ratingError}</p>}
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="Leave a review (optional)"
          maxLength={500}
          disabled={submitting}
          className="w-full rounded-card-sm border border-border bg-surface p-2 text-sm text-ink placeholder:text-fog resize-none focus:outline-none focus:ring-1 focus:ring-accent"
          rows={3}
        />
        <p className="text-xs text-graphite text-right">{text.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-card-sm bg-accent text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>

      <AnimatePresence>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </AnimatePresence>
    </form>
  );
}
