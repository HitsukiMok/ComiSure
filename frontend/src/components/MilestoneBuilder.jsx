import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const MAX_MILESTONES = 10;
const MIN_MILESTONES = 2;

export default function MilestoneBuilder({ milestones, setMilestones }) {
  const total = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const isValid = total === 100 && milestones.length >= MIN_MILESTONES && milestones.every(m => m.percentage > 0);

  function addRow() {
    if (milestones.length >= MAX_MILESTONES) return;
    setMilestones([...milestones, { label: '', percentage: 0 }]);
  }

  function removeRow(index) {
    setMilestones(milestones.filter((_, i) => i !== index));
  }

  function updateRow(index, field, value) {
    const updated = milestones.map((m, i) =>
      i === index ? { ...m, [field]: field === 'percentage' ? Number(value) || 0 : value } : m
    );
    setMilestones(updated);
  }

  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Milestone ${i + 1} label`}
            value={m.label}
            onChange={(e) => updateRow(i, 'label', e.target.value)}
            className="flex-1 rounded-input border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="relative w-24">
            <input
              type="number"
              min="1"
              max="100"
              value={m.percentage || ''}
              onChange={(e) => updateRow(i, 'percentage', e.target.value)}
              className="w-full rounded-input border border-border bg-surface px-3 py-2 pr-7 text-sm text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="%"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fog">%</span>
          </div>
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="p-2 rounded-card-sm text-fog hover:text-status-refunded hover:bg-status-refunded/10 transition-colors"
            aria-label={`Remove milestone ${i + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        disabled={milestones.length >= MAX_MILESTONES}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent hover:text-ink disabled:text-fog disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Milestone
      </button>

      {/* Running total + validation messages */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <span className={`text-sm font-medium ${total === 100 ? 'text-status-released' : 'text-status-refunded'}`}>
          Total: {total}/100%
        </span>
        {milestones.length < MIN_MILESTONES && (
          <span className="text-xs text-status-refunded">At least {MIN_MILESTONES} milestones required</span>
        )}
        {milestones.some(m => m.percentage <= 0) && milestones.length >= MIN_MILESTONES && (
          <span className="text-xs text-status-refunded">Each milestone needs a percentage above 0</span>
        )}
        {total !== 100 && milestones.length >= MIN_MILESTONES && milestones.every(m => m.percentage > 0) && (
          <span className="text-xs text-status-refunded">Percentages must sum to exactly 100</span>
        )}
      </div>
    </div>
  );
}
