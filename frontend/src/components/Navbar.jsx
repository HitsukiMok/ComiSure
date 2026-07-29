import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Wallet } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { address, connectWallet, disconnectWallet, isConnecting } = useWallet();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-border py-4 px-6 transition-colors duration-300">
      <div className="max-w-page mx-auto flex items-center justify-between">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/favicon.svg"
            alt="ComiSure"
            className="w-8 h-8 object-contain"
          />
          <span className="text-subheading font-medium tracking-tight text-ink">
            ComiSure
          </span>
        </Link>

        {/* Nav Links + Actions */}
        <div className="flex items-center gap-6">
          {/* Ghost nav links */}
          <Link
            to="/dashboard"
            className="text-graphite hover:text-ink transition-colors font-medium text-base hidden sm:inline"
          >
            Dashboard
          </Link>
          <Link
            to="/admin"
            className="text-graphite hover:text-ink transition-colors font-medium text-base hidden sm:inline"
          >
            Admin
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wallet */}
          {address ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-canvas border border-border rounded-pill flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-mono text-ink">{shortAddress}</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-2 text-sm font-medium text-graphite hover:text-ink hover:bg-canvas rounded-btn transition-colors"
                title="Disconnect"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-btn bg-action text-action-text font-medium text-sm shadow-button hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
