import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Wallet } from 'lucide-react';

export default function Navbar() {
  const { address, connectWallet, disconnectWallet, isConnecting } = useWallet();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-surface/80 border-b border-white/5 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/favicon.svg" alt="ComiSure Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(109,40,217,0.6)] group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-300 transform group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-white">Comi<span className="text-accent">Sure</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-textmuted hover:text-white transition-colors font-medium text-sm">
            Dashboard
          </Link>
          <Link to="/admin" className="text-textmuted hover:text-white transition-colors font-medium text-sm">
            Admin
          </Link>
          
          {address ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-surface border border-white/10 rounded-full flex items-center gap-2 shadow-inner">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-sm font-mono text-textmain">{shortAddress}</span>
              </div>
              <button 
                onClick={disconnectWallet}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition-colors"
                title="Disconnect"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-full bg-white text-surface font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.3)]"
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
