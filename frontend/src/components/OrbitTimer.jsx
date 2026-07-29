import React, { useState, useEffect } from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

function getRingColor(percentage) {
  if (percentage > 50) return '#cce7ff'; // Powder Blue
  if (percentage > 25) return '#fff2be'; // Solar
  if (percentage > 0) return '#ffd1b8';  // Peach
  return '#ef4444';                      // Red (expired)
}

function formatTimeLeft(seconds) {
  if (seconds <= 0) return { text: 'Expired', sub: '' };
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return { text: `${days}d ${hours}h`, sub: 'remaining' };
  if (hours > 0) return { text: `${hours}h ${mins}m`, sub: 'remaining' };
  return { text: `${mins}m`, sub: 'remaining' };
}

export default function OrbitTimer({ deadlineUnix, createdAtUnix, state }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Terminal states
  if (state === 'Released') {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="#d3f6e3"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={0}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-ink">Released ✓</p>
      </div>
    );
  }

  if (state === 'Refunded') {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" strokeWidth="8" />
        </svg>
        <p className="mt-2 text-sm font-medium text-ink">Refunded</p>
      </div>
    );
  }

  // Calculate percentage
  const totalDuration = deadlineUnix - createdAtUnix;
  const remaining = Math.max(0, deadlineUnix - now);
  const percentage = totalDuration > 0 ? (remaining / totalDuration) * 100 : 0;
  const offset = CIRCUMFERENCE * (1 - percentage / 100);
  const ringColor = getRingColor(percentage);
  const { text, sub } = formatTimeLeft(remaining);
  const isExpired = remaining <= 0;
  const isCritical = remaining > 0 && remaining < 86400;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          {/* Background ring */}
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          {/* Progress ring */}
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            className={`transition-all duration-1000 ease-out ${isExpired ? 'orbit-pulse' : isCritical ? 'orbit-pulse-fast' : ''}`}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-heading-sm font-medium tracking-tight ${isExpired ? 'text-red-500' : 'text-ink'}`}>
            {text}
          </span>
          {sub && <span className="text-xs text-fog">{sub}</span>}
        </div>
      </div>
    </div>
  );
}
