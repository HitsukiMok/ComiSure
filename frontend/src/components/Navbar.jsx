import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LegalConsentModal from './LegalConsentModal';

export default function Navbar() {
  const { address, requestConnect, connectWallet, showConsent, closeConsent, disconnectWallet, isConnecting } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-border py-4 px-6 transition-colors duration-300">
        <div className="max-w-page mx-auto flex items-center justify-between">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <img src="/favicon.svg" alt="ComiSure" className="w-8 h-8 object-contain" />
            <span className="text-subheading font-medium tracking-tight text-ink">ComiSure</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-graphite hover:text-ink transition-colors font-medium text-base">
                {link.label}
              </Link>
            ))}

            <ThemeToggle />

            {address ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-canvas border border-border rounded-pill flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-mono text-ink">{shortAddress}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-2 text-sm font-medium text-graphite hover:text-ink hover:bg-canvas rounded-btn transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={requestConnect}
                disabled={isConnecting}
                className="px-5 py-2.5 rounded-btn bg-action text-action-text font-medium text-sm shadow-button hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-graphite hover:text-ink rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-3 border-t border-border mt-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-graphite hover:text-ink transition-colors font-medium text-base py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                {address ? (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-sm font-mono text-ink">{shortAddress}</span>
                    </div>
                    <button
                      onClick={() => { disconnectWallet(); setMobileOpen(false); }}
                      className="text-sm font-medium text-graphite hover:text-ink"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { requestConnect(); setMobileOpen(false); }}
                    disabled={isConnecting}
                    className="w-full px-4 py-3 rounded-btn bg-action text-action-text font-medium text-sm shadow-button hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Legal Consent Modal */}
      <LegalConsentModal
        isOpen={showConsent}
        onAccept={connectWallet}
        onClose={closeConsent}
      />
    </>
  );
}
