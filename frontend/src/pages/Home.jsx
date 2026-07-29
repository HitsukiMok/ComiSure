import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import EscrowPipeline from '../components/EscrowPipeline';
import Footer from '../components/Footer';

const features = [
  {
    icon: Lock,
    title: 'Trustless Escrow',
    desc: 'Funds lock on-chain via Soroban smart contracts. No human intermediary holds your money.',
    bg: 'bg-lavender-wash dark:bg-status-pending',
  },
  {
    icon: Zap,
    title: '5-Second Settlements',
    desc: 'The Stellar network settles payments within one ledger close. Artists get paid instantly.',
    bg: 'bg-powder-blue dark:bg-status-funded',
  },
  {
    icon: ShieldCheck,
    title: 'Dispute Resolution',
    desc: 'Off-chain admin reviews with on-chain guarantees. Disputes resolve fairly with cryptographic proof.',
    bg: 'bg-mint-wash dark:bg-status-released',
  },
  {
    icon: RefreshCw,
    title: 'Deadline Auto-Refund',
    desc: 'Set a deadline on every commission. If the artist ghosts, claim your refund without admin help.',
    bg: 'bg-solar dark:bg-status-expired',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="max-w-page mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-surface border border-border text-sm font-medium text-graphite mb-10">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Live on Stellar Testnet
          </div>

          {/* Headline */}
          <h1 className="text-display md:text-hero font-medium text-ink tracking-tight max-w-4xl mx-auto">
            Secure Art Commissions
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-lg md:text-xl text-graphite max-w-2xl mx-auto leading-relaxed">
            ComiSure locks USDC in a Soroban smart contract so artists always get paid and clients never get scammed.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity text-base"
            >
              Start Commissioning <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface border border-border text-ink font-medium rounded-btn hover:bg-canvas transition-colors text-base"
            >
              Get a Wallet
            </a>
          </div>
        </motion.div>
      </section>

      {/* ─── How It Works — Escrow Pipeline ───────────────────────────── */}
      <section className="max-w-page mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-lg font-medium text-ink tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-lg text-graphite">
            From agreement to payment in five trustless steps.
          </p>
        </motion.div>

        <EscrowPipeline />
      </section>

      {/* ─── Feature Tiles (Pastel Cards) ─────────────────────────────── */}
      <section className="max-w-page mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-lg font-medium text-ink tracking-tight">
            Built for Trust
          </h2>
          <p className="mt-3 text-lg text-graphite">
            Every feature protects both the artist and the client.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`p-10 rounded-card ${f.bg} transition-colors`}
            >
              <f.icon className="w-8 h-8 text-ink mb-4" strokeWidth={1.5} />
              <h3 className="text-heading font-medium text-ink tracking-tight mb-2">
                {f.title}
              </h3>
              <p className="text-base text-graphite leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Stats Strip ──────────────────────────────────────────────── */}
      <section className="max-w-page mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '5s', label: 'Settlement Time' },
            { value: '<$0.001', label: 'Transaction Fee' },
            { value: '100%', label: 'Goes to Artist' },
            { value: '1:1', label: 'USDC Peg to USD' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-card bg-surface border border-border">
              <p className="text-heading font-medium text-accent tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-fog">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
