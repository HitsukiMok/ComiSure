import React from 'react';
import { Clock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const STATE_CONFIG = {
  Pending: {
    label: 'Pending Deposit',
    bg: 'bg-status-pending',
    text: 'text-ink',
    icon: Clock,
  },
  Funded: {
    label: 'Funds Locked',
    bg: 'bg-status-funded',
    text: 'text-ink',
    icon: ShieldCheck,
  },
  Released: {
    label: 'Released to Artist',
    bg: 'bg-status-released',
    text: 'text-ink',
    icon: CheckCircle2,
  },
  Refunded: {
    label: 'Refunded to Client',
    bg: 'bg-status-refunded',
    text: 'text-ink',
    icon: XCircle,
  },
  Expired: {
    label: 'Deadline Expired',
    bg: 'bg-status-expired',
    text: 'text-ink',
    icon: AlertTriangle,
  },
  Unknown: {
    label: 'Unknown',
    bg: 'bg-surface',
    text: 'text-fog',
    icon: Clock,
  },
};

export default function StateBadge({ state }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.Unknown;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-medium ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="w-4 h-4" />
      {cfg.label}
    </span>
  );
}
