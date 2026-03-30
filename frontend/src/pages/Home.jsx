import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Lock className="w-8 h-8 text-primary" />,
    title: 'Trustless Escrow',
    desc: 'Funds are securely locked on-chain via Soroban smart contracts. No human intermediary can hold your money hostage.'
  },
  {
    icon: <Zap className="w-8 h-8 text-accent" />,
    title: 'Lightning Fast Settlements',
    desc: 'Leveraging the Stellar network, artists receive their USDC within 5 seconds of client approval.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
    title: 'Dispute Resolution',
    desc: 'Off-chain admin reviews with on-chain guarantees limit fraud. Admins can force release or refund based on undeniable cryptographic proofs.'
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-pink-500" />,
    title: 'Streamlined Progress',
    desc: 'A dedicated off-chain dashboard for tracking milestones like sketches and final PSD deliveries.'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-textmain/5 border border-border text-sm font-medium mb-8">
             <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
             Live on Stellar Network (Soroban)
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
             Secure Art Commissions. <br/>
             <span className="gradient-text animate-glow block mt-2">Guaranteed Code.</span>
          </h1>

          <p className="text-lg md:text-xl text-textmuted mb-10 leading-relaxed">
             ComiSure utilizes the power of the <strong>Soroban SDK</strong> to protect freelancers and clients from fraud. Connect your Stellar wallet and commission your next masterpiece with absolute peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/dashboard"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center gap-2"
            >
              Start Commissioning <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="https://stellarwalletskit.dev" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-surface hover:bg-surface/80 border border-border text-textmain rounded-full font-bold text-lg transition-colors flex items-center gap-2"
            >
              Get a Wallet
            </a>
          </div>
        </motion.div>

        {/* How it Works / Process */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-32 w-full"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {['1. Propose', '2. Lock Funds', '3. Deliver', '4. Approve'].map((step, i) => (
               <div key={i} className="glass-panel p-8 text-center relative group">
                 <div className="absolute inset-0 bg-gradient-to-b from-textmain/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                 <div className="text-5xl font-black text-textmain/5 mb-4 group-hover:text-primary/20 transition-colors">0{i+1}</div>
                 <h3 className="text-xl font-bold text-textmain mb-2">{step}</h3>
                 <p className="text-textmuted text-sm">
                   {i === 0 && 'Client & Artist agree on the scope off-chain.'}
                   {i === 1 && 'Client deposits USDC directly into the smart contract.'}
                   {i === 2 && 'Artist uploads the WIPs and final files off-chain.'}
                   {i === 3 && 'Client approves on-chain, instantly transferring funds.'}
                 </p>
               </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
           {features.map((f, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: i * 0.1 }}
               viewport={{ once: true }}
               className="flex items-start gap-6 p-6 rounded-2xl border border-border bg-textmain/5 hover:bg-textmain/10 transition-colors"
             >
                <div className="p-4 rounded-xl bg-surface/50 border border-border">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-textmuted leading-relaxed">{f.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>

      </main>
    </div>
  );
}
