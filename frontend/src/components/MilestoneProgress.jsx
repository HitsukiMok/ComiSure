import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  Pending: { label: 'Pending', icon: Clock, bg: 'bg-status-pending', text: 'text-ink' },
  Approved: { label: 'Approved', icon: CheckCircle2, bg: 'bg-status-released', text: 'text-ink' },
  Refunded: { label: 'Refunded', icon: XCircle, bg: 'bg-status-refunded', text: 'text-ink' },
};

function formatUsdc(stroops) {
  const val = Number(stroops) / 10_000_000;
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Displays milestone progress: list with status badges, approve buttons,
 * a progress bar, and released/unreleased USDC amounts.
 *
 * Props:
 *  - milestones: Array<{ label, percentage, status }>
 *  - totalAmount: bigint (stroops)
 *  - releasedTotal: bigint (stroops)
 *  - contractState: string
 *  - isClient: boolean
 *  - onApprove: (index: number) => void
 */
export default function MilestoneProgress({
  milestones = [],
  totalAmount = 0n,
  releasedTotal = 0n,
  contractState,
  isClient = false,
  onApprove,
}) {
  const approvedCount = milestones.filter((m) => m.status === 'Approved').length;
  const total = milestones.length || 1;
  const progressPct = Math.round((approvedCount / total) * 100);
  const unreleased = BigInt(totalAmount) - BigInt(releasedTotal);
  const canApprove =
    isClient && (contractState === 'Funded' || contractState === 'PartiallyReleased');

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">
            {approvedCount}/{total} milestones completed
          </span>
          <span className="text-sm text-fog">{progressPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-fog">Released</span>
          <p className="font-medium text-ink">{formatUsdc(releasedTotal)} USDC</p>
        </div>
        <div>
          <span className="text-fog">Unreleased</span>
          <p className="font-medium text-ink">{formatUsdc(unreleased)} USDC</p>
        </div>
      </div>

      {/* Milestone list */}
      <ul className="space-y-3">
        {milestones.map((m, i) => {
          const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.Pending;
          const Icon = cfg.icon;
          const showApprove = canApprove && m.status === 'Pending';

          return (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-card-sm border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium ${cfg.bg} ${cfg.text}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
                <span className="text-sm text-ink truncate">{m.label}</span>
                <span className="text-xs text-fog">{m.percentage}%</span>
              </div>

              {showApprove && (
                <button
                  onClick={() => onApprove?.(i)}
                  className="px-3 py-1 text-xs font-medium rounded-btn bg-action text-action-text hover:opacity-90 transition-opacity"
                >
                  Approve
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
