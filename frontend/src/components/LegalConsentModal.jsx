import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function LegalConsentModal({ isOpen, onAccept, onClose }) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface border border-border rounded-card w-full max-w-lg max-h-[80vh] flex flex-col shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-heading-sm font-medium text-ink">Terms & Privacy</h2>
                <button onClick={onClose} className="p-2 text-fog hover:text-ink rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-graphite leading-relaxed">
                {/* Terms of Service Summary */}
                <section>
                  <h3 className="text-base font-medium text-ink mb-3">Terms of Service</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>ComiSure deploys escrow smart contracts on the Stellar network to hold USDC.</li>
                    <li>You must be 18+ and own a compatible Stellar wallet.</li>
                    <li>You are responsible for your wallet security. We cannot recover lost funds.</li>
                    <li>Escrow releases are <strong>final and irreversible</strong> once executed on-chain.</li>
                    <li>Deadlines are immutable. After expiry, clients can self-refund.</li>
                    <li>Disputes are resolved by platform admin — decisions are final.</li>
                    <li>No platform fees. Stellar network fees (&lt;$0.001) apply.</li>
                    <li>The Service is provided "AS IS" without warranties.</li>
                    <li>Currently operating on <strong>Stellar Testnet</strong> (no real monetary value).</li>
                  </ul>
                  <Link to="/terms" target="_blank" className="inline-block mt-2 text-accent hover:underline text-xs">
                    Read full Terms of Service →
                  </Link>
                </section>

                <hr className="border-border" />

                {/* Privacy Policy Summary */}
                <section>
                  <h3 className="text-base font-medium text-ink mb-3">Privacy Policy</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>We collect only your wallet address and commission metadata.</li>
                    <li>We do NOT collect emails, names, or tracking data.</li>
                    <li>Blockchain transactions are public and permanent.</li>
                    <li>IP addresses are used for rate limiting only (not stored).</li>
                    <li>We do not sell data or use third-party analytics.</li>
                    <li>Data security: AES-256 encryption, HTTPS, rate limiting.</li>
                  </ul>
                  <Link to="/privacy" target="_blank" className="inline-block mt-2 text-accent hover:underline text-xs">
                    Read full Privacy Policy →
                  </Link>
                </section>
              </div>

              {/* Footer with checkbox + button */}
              <div className="p-6 border-t border-border space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-border accent-accent cursor-pointer"
                  />
                  <span className="text-sm text-graphite">
                    I have read and agree to the <strong className="text-ink">Terms of Service</strong> and <strong className="text-ink">Privacy Policy</strong>.
                  </span>
                </label>

                <button
                  disabled={!accepted}
                  onClick={() => { onAccept(); setAccepted(false); }}
                  className="w-full px-4 py-3 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Accept & Connect Wallet
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
