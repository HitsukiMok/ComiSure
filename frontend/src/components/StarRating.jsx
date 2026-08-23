import React from 'react';
import { motion } from 'framer-motion';

const SIZES = { sm: 16, md: 24, lg: 32 };

function Star({ filled, fraction, size, onClick, interactive }) {
  const id = React.useId();
  const px = SIZES[size] || SIZES.md;

  const star = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {fraction > 0 && fraction < 1 && (
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="0" y="0" width={24 * fraction} height="24" />
          </clipPath>
        </defs>
      )}
      {/* Empty star (gray outline always drawn as base) */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={filled ? '#f59e0b' : 'none'}
      />
      {/* Partial fill overlay */}
      {fraction > 0 && fraction < 1 && (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="#f59e0b"
          clipPath={`url(#clip-${id})`}
        />
      )}
    </svg>
  );

  if (!interactive) return star;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer bg-transparent border-none p-0 leading-none"
    >
      {star}
    </motion.button>
  );
}

export default function StarRating({ value = 0, onChange, readonly = true, size = 'md' }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starIndex = i + 1;
    const filled = value >= starIndex;
    const fraction = !filled && value > i ? value - i : filled ? 1 : 0;
    return { filled, fraction };
  });

  const label = `Rating: ${Math.round(value * 10) / 10} out of 5 stars`;

  if (readonly) {
    return (
      <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
        {stars.map((s, i) => (
          <Star key={i} filled={s.filled} fraction={s.fraction} size={size} interactive={false} />
        ))}
      </span>
    );
  }

  return (
    <span role="radiogroup" aria-label="Star rating" className="inline-flex items-center gap-0.5">
      {stars.map((s, i) => (
        <Star
          key={i}
          filled={s.filled}
          fraction={s.fraction}
          size={size}
          interactive={true}
          onClick={() => onChange?.(i + 1)}
        />
      ))}
    </span>
  );
}
