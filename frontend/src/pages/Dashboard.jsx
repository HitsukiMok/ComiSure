import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import {
  getContractState,
  getContractAmount,
  depositFunds,
  approveRelease,
  approveMilestone,
  friendlyContractError,
} from '../services/contract';
import { commissionService, milestoneService } from '../services/api';
import { ShieldCheck, Loader2, ExternalLink, RefreshCw, Plus, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import StateBadge from '../components/StateBadge';
import OrbitTimer from '../components/OrbitTimer';
import OrbitTimerCompact from '../components/OrbitTimerCompact';
import MilestoneBuilder from '../components/MilestoneBuilder';
import MilestoneProgress from '../components/MilestoneProgress';

// ─── Transaction Toast ────────────────────────────────────────────────────────
function TxToast({ tx, onClose }) {
  if (!tx) return null;
  const isError = tx.type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-card-sm shadow-lg border ${
        isError
          ? 'bg-status-refunded border-border text-ink'
          : 'bg-status-released border-border text-ink'
      }`}
    >
      <div className="font-medium mb-1">{isError ? 'Error' : 'Success'}</div>
      <div className="text-sm text-graphite mb-2">{tx.message}</div>
      {tx.explorerUrl && (
        <a
          href={tx.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs flex items-center gap-1 text-accent hover:underline"
        >
          View on Stellar Expert <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <button onClick={onClose} className="absolute top-2 right-3 text-lg text-fog hover:text-ink">×</button>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { address, authError } = useWallet();
  const [commissions, setCommissions] = useState([]);
  const [loadingCommissions, setLoadingCommissions] = useState(true);

  const [activeView, setActiveView] = useState('list');
  const [selectedCommission, setSelectedCommission] = useState(null);

  const fetchCommissions = useCallback(async () => {
    if (!address) return;
    setLoadingCommissions(true);
    try {
      const clientComms = await commissionService.getAll({ client_address: address });
      const artistComms = await commissionService.getAll({ artist_address: address });
      const all = [...clientComms, ...artistComms];
      const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
      unique.sort((a, b) => b.id - a.id);
      setCommissions(unique);
    } catch (e) {
      console.error("Failed to load commissions:", e);
    } finally {
      setLoadingCommissions(false);
    }
  }, [address]);

  useEffect(() => { fetchCommissions(); }, [fetchCommissions]);

  if (!address) {
    return (
      <div className="max-w-page mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-accent mb-6 opacity-50" strokeWidth={1.5} />
        <h1 className="text-heading font-medium text-ink mb-3">Connect Your Wallet</h1>
        <p className="text-graphite max-w-md">
          Connect your Freighter wallet to interact with the ComiSure Escrow platform.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-page mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-heading-lg font-medium text-ink tracking-tight mb-1">My Commissions</h1>
          <p className="text-sm font-mono text-fog truncate max-w-xs" title={address}>
            {address.slice(0, 10)}...{address.slice(-6)}
          </p>
        </div>
        {activeView === 'list' && (
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Commission
          </button>
        )}
      </div>

      {authError && (
        <div className="mb-6 p-4 rounded-card-sm bg-status-expired border border-border overflow-hidden">
          <p className="text-sm font-medium text-ink mb-1">Authentication Issue</p>
          <p className="text-xs text-graphite break-words">{authError}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeView === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {loadingCommissions ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
            ) : commissions.length === 0 ? (
              <div className="p-12 text-center rounded-card bg-surface">
                <h3 className="text-heading-sm font-medium text-ink mb-2">No Commissions Found</h3>
                <p className="text-graphite mb-6">You don't have any active escrows on the network yet.</p>
                <button
                  onClick={() => setActiveView('create')}
                  className="px-6 py-2.5 bg-action text-action-text font-medium rounded-btn shadow-button"
                >
                  Create Your First Commission
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {commissions.map(c => {
                  const createdAt = c.created_at ? Math.floor(new Date(c.created_at).getTime() / 1000) : 0;
                  const deadlineAt = c.deadline_at ? Math.floor(new Date(c.deadline_at).getTime() / 1000) : 0;
                  return (
                    <div
                      key={c.id}
                      onClick={() => { setSelectedCommission(c); setActiveView('escrow'); }}
                      className="p-6 rounded-card bg-surface border border-border hover:border-accent cursor-pointer transition-colors flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-ink">{c.title}</h3>
                        <span className="text-sm font-medium text-accent">{c.amount_usdc} USDC</span>
                      </div>
                      <p className="text-sm text-graphite mb-3 line-clamp-2 flex-grow">{c.description}</p>
                      <div className="text-xs font-mono text-fog bg-canvas p-2 rounded-card-sm truncate">
                        {c.contract_id || "Deploying..."}
                      </div>
                      {deadlineAt > 0 && (
                        <OrbitTimerCompact
                          deadlineUnix={deadlineAt}
                          createdAtUnix={createdAt}
                          state={c.status}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeView === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CreateCommissionView
              address={address}
              onCancel={() => setActiveView('list')}
              onSuccess={(newComm) => {
                fetchCommissions();
                setSelectedCommission(newComm);
                setActiveView('escrow');
              }}
            />
          </motion.div>
        )}

        {activeView === 'escrow' && selectedCommission && (
          <motion.div key="escrow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <button
              onClick={() => { setActiveView('list'); setSelectedCommission(null); fetchCommissions(); }}
              className="flex items-center gap-2 text-graphite hover:text-ink mb-6 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to list
            </button>
            <ActiveEscrowView commission={selectedCommission} walletAddress={address} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Commission View ───────────────────────────────────────────────────
function CreateCommissionView({ address, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commissionType, setCommissionType] = useState('single');
  const [milestones, setMilestones] = useState([{ label: '', percentage: 0 }, { label: '', percentage: 0 }]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_address: '',
    amount_usdc: '10',
    deadline_days: '14',
  });

  const milestoneTotal = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const milestoneValid = commissionType !== 'milestone' || (
    milestoneTotal === 100 &&
    milestones.length >= 2 &&
    milestones.every(m => m.percentage > 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        client_address: address,
        artist_address: formData.artist_address,
        amount_usdc: parseInt(formData.amount_usdc, 10),
        deadline_days: parseInt(formData.deadline_days, 10),
        commission_type: commissionType,
      };
      if (commissionType === 'milestone') {
        payload.milestones = milestones.map(m => ({ label: m.label, percentage: m.percentage }));
      }
      const newCommission = await commissionService.create(payload);
      onSuccess(newCommission);
    } catch (e) {
      const detail = e?.response?.data?.detail || friendlyContractError(e, { actorLabel: 'The backend deployer' });
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto rounded-card bg-surface">
      <h2 className="text-heading font-medium text-ink mb-2">Create New Escrow</h2>
      <p className="text-sm text-graphite mb-8">
        The backend will deploy and initialize a unique Soroban Smart Contract for this commission. This may take up to 15 seconds.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-card-sm bg-status-refunded border border-border overflow-hidden">
          <p className="text-sm font-medium text-ink mb-1">Deployment failed</p>
          <p className="text-xs text-graphite break-words whitespace-pre-wrap">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs text-accent hover:underline">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Title</label>
          <input
            required type="text"
            className="w-full px-4 py-3 bg-canvas border border-border rounded-input focus:border-accent outline-none text-ink transition-colors"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Cyberpunk Character Portrait"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Description / Requirements</label>
          <textarea
            required rows={3}
            className="w-full px-4 py-3 bg-canvas border border-border rounded-input focus:border-accent outline-none text-ink transition-colors"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide references, style notes, dimensions..."
          />
        </div>
        {/* Commission Type Selector */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Payment Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCommissionType('single')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-btn border transition-colors ${
                commissionType === 'single'
                  ? 'bg-action text-action-text border-action'
                  : 'bg-canvas text-graphite border-border hover:border-accent'
              }`}
            >
              Single Payment
            </button>
            <button
              type="button"
              onClick={() => setCommissionType('milestone')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-btn border transition-colors ${
                commissionType === 'milestone'
                  ? 'bg-action text-action-text border-action'
                  : 'bg-canvas text-graphite border-border hover:border-accent'
              }`}
            >
              Milestone-Based
            </button>
          </div>
        </div>

        {/* Milestone Builder (shown only for milestone type) */}
        {commissionType === 'milestone' && (
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Milestones</label>
            <MilestoneBuilder milestones={milestones} setMilestones={setMilestones} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Artist Stellar Address</label>
          <input
            required type="text"
            className="w-full px-4 py-3 bg-canvas border border-border rounded-input focus:border-accent outline-none font-mono text-sm text-ink transition-colors"
            value={formData.artist_address}
            onChange={e => setFormData({ ...formData, artist_address: e.target.value })}
            placeholder="G..."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Amount (USDC)</label>
            <input
              required type="number" min="1"
              className="w-full px-4 py-3 bg-canvas border border-border rounded-input focus:border-accent outline-none text-ink transition-colors"
              value={formData.amount_usdc}
              onChange={e => setFormData({ ...formData, amount_usdc: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Deadline (Days)</label>
            <input
              required type="number" min="1" max="90"
              className="w-full px-4 py-3 bg-canvas border border-border rounded-input focus:border-accent outline-none text-ink transition-colors"
              value={formData.deadline_days}
              onChange={e => setFormData({ ...formData, deadline_days: e.target.value })}
            />
            <p className="text-xs text-fog mt-1">You can self-refund after this many days.</p>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="button" onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-3 border border-border text-center rounded-btn text-ink hover:bg-canvas transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading || !milestoneValid}
            className="flex-[2] flex gap-2 justify-center items-center px-4 py-3 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Deploying...</> : "Deploy & Initialize"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Active Escrow View ───────────────────────────────────────────────────────
function ActiveEscrowView({ commission, walletAddress }) {
  const [contractState, setContractState] = useState(null);
  const [lockedAmount, setLockedAmount] = useState(0n);
  const [milestones, setMilestones] = useState([]);
  const [releasedTotal, setReleasedTotal] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  const contractId = commission.contract_id;
  const createdAt = commission.created_at ? Math.floor(new Date(commission.created_at).getTime() / 1000) : 0;
  const deadlineAt = commission.deadline_at ? Math.floor(new Date(commission.deadline_at).getTime() / 1000) : 0;
  const isMilestone = commission.commission_type === 'milestone';
  const isClient = commission.client_address === walletAddress;

  const fetchState = useCallback(async () => {
    if (!walletAddress || !contractId) return;
    setFetching(true);
    try {
      const [state, amount] = await Promise.all([
        getContractState(contractId, walletAddress),
        getContractAmount(contractId, walletAddress),
      ]);
      setContractState(state);
      setLockedAmount(amount);

      if (isMilestone) {
        try {
          const msData = await milestoneService.getMilestones(commission.id);
          setMilestones(msData.milestones || msData || []);
          if (msData.released_total != null) setReleasedTotal(BigInt(msData.released_total));
        } catch (e) {
          console.error('Failed to fetch milestones:', e);
        }
      }
    } catch (e) {
      console.error('Failed to fetch contract state:', e);
      setContractState('Unknown');
    } finally {
      setFetching(false);
    }
  }, [walletAddress, contractId, isMilestone, commission.id]);

  useEffect(() => { fetchState(); }, [fetchState]);

  const invoke = async (fn, label) => {
    setLoading(true);
    setToast(null);
    try {
      const result = await fn();
      setToast({ type: 'success', message: `${label} confirmed!`, explorerUrl: result.explorerUrl });
      await fetchState();
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: friendlyContractError(e, { actorLabel: 'The connected wallet' }) });
    } finally {
      setLoading(false);
    }
  };

  const invokeBackendAdmin = async (apiCall, label) => {
    setLoading(true);
    setToast(null);
    try {
      await apiCall();
      setToast({ type: 'success', message: `${label} successful!` });
      await fetchState();
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: friendlyContractError(e, { actorLabel: 'The backend service' }) });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMilestone = async (index) => {
    setLoading(true);
    setToast(null);
    try {
      const result = await approveMilestone(contractId, walletAddress, index);
      await milestoneService.approve(commission.id, index);
      setToast({ type: 'success', message: `Milestone ${index + 1} approved!`, explorerUrl: result.explorerUrl });
      await fetchState();
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: friendlyContractError(e, { actorLabel: 'The client wallet' }) });
    } finally {
      setLoading(false);
    }
  };

  const usdcFormatted = lockedAmount > 0n ? (Number(lockedAmount) / 10_000_000).toFixed(2) : '0.00';
  const displayId = contractId || "PENDING";

  return (
    <>
      <TxToast tx={toast} onClose={() => setToast(null)} />

      {/* Info Panel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-card bg-surface mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-heading font-medium text-ink">{commission.title}</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-fog font-mono">ID</span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${displayId}`}
                target="_blank" rel="noreferrer"
                className="text-sm font-mono text-accent hover:underline flex items-center gap-1"
              >
                {displayId.slice(0, 12)}...{displayId.slice(-6)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={fetchState} disabled={fetching} className="text-xs text-fog hover:text-ink flex items-center gap-1 mb-1">
              <RefreshCw className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {contractState ? <StateBadge state={contractState} /> : <Loader2 className="w-5 h-5 animate-spin text-fog" />}
          </div>
        </div>

        {/* Stats + Orbit Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="p-4 rounded-card-sm border border-border bg-canvas">
            <p className="text-xs text-fog mb-1">Locked Amount</p>
            <p className="text-heading-sm font-medium text-ink">{usdcFormatted} <span className="text-sm text-fog">USDC</span></p>
          </div>
          <div className="p-4 rounded-card-sm border border-border bg-canvas">
            <p className="text-xs text-fog mb-1">Escrow State</p>
            <p className="text-heading-sm font-medium text-ink">{contractState ?? '—'}</p>
          </div>
          {deadlineAt > 0 && (
            <div className="flex justify-center">
              <OrbitTimer
                deadlineUnix={deadlineAt}
                createdAtUnix={createdAt}
                state={contractState}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-card bg-surface">
          <h2 className="text-subheading font-medium text-ink mb-1">Lock Funds</h2>
          <p className="text-sm text-graphite mb-4">Deposit {commission.amount_usdc} USDC into the contract.</p>
          <button
            disabled={loading || contractState !== 'Pending'}
            onClick={() => invoke(() => depositFunds(contractId, walletAddress, commission.amount_usdc), 'Deposit')}
            className="w-full px-4 py-3 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Lock {commission.amount_usdc} USDC
          </button>
        </motion.div>

        {/* Approve Release — single-payment or Milestone Progress */}
        {isMilestone ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-card bg-surface">
            <h2 className="text-subheading font-medium text-ink mb-4">Milestone Progress</h2>
            <MilestoneProgress
              milestones={milestones}
              totalAmount={lockedAmount}
              releasedTotal={releasedTotal}
              contractState={contractState}
              isClient={isClient}
              onApprove={handleApproveMilestone}
            />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-card bg-surface">
            <h2 className="text-subheading font-medium text-ink mb-1">Approve & Release</h2>
            <p className="text-sm text-graphite mb-4">Release locked funds to <strong className="text-ink">{commission.artist_address?.slice(0, 6)}...</strong></p>
            <button
              disabled={loading || contractState !== 'Funded'}
              onClick={() => invoke(() => approveRelease(contractId, walletAddress), 'Approve Release')}
              className="w-full px-4 py-3 bg-status-released text-ink font-medium rounded-btn hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve & Release
            </button>
          </motion.div>
        )}

        {/* Admin Actions */}
        <div className="md:col-span-2 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            disabled={loading || contractState !== 'Funded'}
            onClick={() => invokeBackendAdmin(() => commissionService.adminRefund(commission.id), 'Admin Refund')}
            className="px-4 py-3 border border-border text-graphite bg-canvas font-medium text-sm rounded-btn hover:border-accent disabled:opacity-40 transition-colors"
          >
            <XCircle className="w-4 h-4 inline mr-2" />
            Admin: Refund Client
          </button>
          <button
            disabled={loading || contractState !== 'Funded'}
            onClick={() => invokeBackendAdmin(() => commissionService.adminForceRelease(commission.id), 'Force Release')}
            className="px-4 py-3 border border-border text-graphite bg-canvas font-medium text-sm rounded-btn hover:border-accent disabled:opacity-40 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            Admin: Force-Release to Artist
          </button>
        </div>
      </div>
    </>
  );
}
