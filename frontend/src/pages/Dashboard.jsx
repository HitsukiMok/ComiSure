import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export default function Dashboard() {
  const { address } = useWallet();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      
      {!address ? (
        <div className="glass-panel p-8 text-center text-textmuted">
          <p>Please connect your wallet to view your commissions.</p>
        </div>
      ) : (
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold mb-4">Your Active Commissions</h2>
          <div className="text-sm text-textmuted mb-8">
            Wallet connected: {address}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mock Commission Card */}
            <div className="p-6 rounded-2xl border border-white/5 bg-surface/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Cyberpunk Character Art</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold">Funding Needed</span>
              </div>
              <p className="text-sm text-textmuted mb-4">Amount: 500 USDC</p>
              
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-primary rounded-lg text-sm font-bold w-full hover:bg-primary/80 transition-colors">
                  Deposit Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
