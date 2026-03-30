import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ShieldAlert } from 'lucide-react';

export default function Admin() {
  const { address } = useWallet();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-10 h-10 text-red-500" />
        <h1 className="text-4xl font-bold">Admin Portal</h1>
      </div>
      
      {!address ? (
        <div className="glass-panel p-8 text-center text-red-400">
           Please connect your admin wallet to access dispute resolutions.
        </div>
      ) : (
        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold mb-6">Active Disputes</h2>
           <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
             <div className="flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-lg">Dispute #12</h3>
                   <p className="text-sm text-textmuted">Artist ghosted after initial sketch.</p>
                 </div>
                 <div className="flex gap-2">
                   <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm">
                     Issue Refund 
                   </button>
                 </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
