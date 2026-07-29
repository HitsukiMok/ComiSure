import React, { useState, useEffect } from 'react';

function getBarColor(percentage) {
  if (percentage > 50) return 'bg-powder-blue';
  if (percentage > 25) return 'bg-solar';
  if (percentage > 0) return 'bg-peach';
  return 'bg-red-500';
}

function formatDaysLeft(seconds) {
  if (seconds <= 0) return 'Expired';
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days}d left`;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m left`;
}

export default function OrbitTimerCompact({ deadlineUnix, createdAtUnix, state }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Terminal states
  if (state === 'Released' || state === 'Refunded') {
    return null; // No progress bar for completed escrows
  }

  const totalDuration = deadlineUnix - createdAtUnix;
  const remaining = Math.max(0, deadlineUnix - now);
  const percentage = totalDuration > 0 ? (remaining / totalDuration) * 100 : 0;
  const barColor = getBarColor(percentage);
  const label = formatDaysLeft(remaining);

  return (
    <div className="w-full mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-fog uppercase tracking-wide">Deadline</span>
        <span className={`text-xs font-medium ${remaining <= 0 ? 'text-red-500' : 'text-graphite'}`}>
          {label}
        </span>
      </div>
      <div className="w-full h-1 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
