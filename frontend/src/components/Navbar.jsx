import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { Wallet, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { address, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const { theme, toggleTheme } = useTheme();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-surface/80 border-b border-border py-4 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/favicon.svg" alt="ComiSure Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(236,72,153,0.6)] group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-300 transform group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-textmain">Comi<span className="text-accent">Sure</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-textmuted hover:text-textmain transition-colors font-medium text-sm">
            Dashboard
          </Link>
          <Link to="/admin" className="text-textmuted hover:text-textmain transition-colors font-medium text-sm">
            Admin
          </Link>

          <button 
            onClick={(e) => toggleTheme(e)} 
            className="theme-toggle-btn p-2 text-textmuted hover:text-textmain rounded-full transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-icon">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </span>
          </button>
          
          {address ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-surface border border-border rounded-full flex items-center gap-2 shadow-inner transition-colors duration-300">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-sm font-mono text-textmain">{shortAddress}</span>
              </div>
              <button 
                onClick={disconnectWallet}
                className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                title="Disconnect"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(236,72,153,0.3)]"
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
