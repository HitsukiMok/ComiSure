import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-surface">
      <div className="max-w-page mx-auto px-6 py-16">
        {/* CTA Block */}
        <div className="text-center mb-16">
          <h2 className="text-heading-lg font-medium text-ink tracking-tight mb-4">
            Ready to commission?
          </h2>
          <p className="text-lg text-graphite mb-8 max-w-lg mx-auto">
            Secure your next artwork with trustless USDC escrow on Stellar.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity"
          >
            Start Commissioning
          </Link>
        </div>

        {/* Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-medium text-ink mb-3">Product</h4>
            <ul className="space-y-2 text-graphite">
              <li><Link to="/dashboard" className="hover:text-ink transition-colors">Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-ink transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-ink mb-3">Resources</h4>
            <ul className="space-y-2 text-graphite">
              <li><a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Stellar Network</a></li>
              <li><a href="https://soroban.stellar.org" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Soroban Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-ink mb-3">Tools</h4>
            <ul className="space-y-2 text-graphite">
              <li><a href="https://stellar.expert" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Stellar Expert</a></li>
              <li><a href="https://freighter.app" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Freighter Wallet</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-ink mb-3">Legal</h4>
            <ul className="space-y-2 text-graphite">
              <li><Link to="/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-fog">© 2025 ComiSure. Built on Stellar.</p>
          <p className="text-xs text-fog">Testnet only — not for real transactions.</p>
        </div>
      </div>
    </footer>
  );
}
