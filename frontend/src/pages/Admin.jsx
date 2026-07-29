import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { commissionService, disputeService } from '../services/api';
import { ShieldAlert, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import StateBadge from '../components/StateBadge';

export default function Admin() {
  const { address } = useWallet();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDisputes = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const data = await disputeService.getAll();
      setDisputes(data);
    } catch (e) {
      console.error('Failed to load disputes:', e);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const resolveDispute = async (disputeId, resolution) => {
    setActionLoading(disputeId);
    try {
      await disputeService.resolve(disputeId, resolution);
      await fetchDisputes();
    } catch (e) {
      console.error('Failed to resolve dispute:', e);
      alert('Resolution failed. Check console for details.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!address) {
    return (
      <div className="max-w-page mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-accent mb-6 opacity-50" strokeWidth={1.5} />
        <h1 className="text-heading font-medium text-ink mb-3">Admin Access Required</h1>
        <p className="text-graphite max-w-md">
          Connect your admin wallet to access dispute resolutions.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-page mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <ShieldAlert className="w-8 h-8 text-accent" strokeWidth={1.5} />
        <h1 className="text-heading-lg font-medium text-ink tracking-tight">Admin Portal</h1>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface">
          <h3 className="text-heading-sm font-medium text-ink mb-2">No Active Disputes</h3>
          <p className="text-graphite">All commissions are running smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-card bg-surface border border-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-ink">Dispute #{d.id}</h3>
                    <span className="px-2 py-0.5 rounded-pill text-xs font-medium bg-status-expired text-ink">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-sm text-graphite mb-2">{d.reason}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-fog">
                    <span>Commission: #{d.commission_id}</span>
                    <span>Raised by: {d.raised_by_address?.slice(0, 6)}...{d.raised_by_address?.slice(-4)}</span>
                  </div>
                </div>

                {d.status === 'Open' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={actionLoading === d.id}
                      onClick={() => resolveDispute(d.id, 'Refunded')}
                      className="px-4 py-2.5 bg-status-refunded text-ink font-medium text-sm rounded-btn hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {actionLoading === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Refund
                    </button>
                    <button
                      disabled={actionLoading === d.id}
                      onClick={() => resolveDispute(d.id, 'ForceReleased')}
                      className="px-4 py-2.5 bg-status-released text-ink font-medium text-sm rounded-btn hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {actionLoading === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Force Release
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
