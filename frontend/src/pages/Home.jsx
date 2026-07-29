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
  },
  {
    icon: Zap,
    title: '5-Second Settlements',
    desc: 'The Stellar network settles payments within one ledger close. Artists get paid instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Dispute Resolution',
    desc: 'Off-chain admin reviews with on-chain guarantees. Disputes resolve fairly with cryptographic proof.',
  },
  {
    icon: RefreshCw,
    title: 'Deadline Auto-Refund',
    desc: 'Set a deadline on every commission. If the artist ghosts, claim your refund without admin help.',
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
          {/* Subtitle — plain text, no container */}
          <p className="text-base text-graphite font-medium mb-6">
            Dev'ing Tech for Artists
          </p>

          {/* Headline */}
          <h1 className="text-display md:text-hero font-medium text-ink tracking-tight max-w-4xl mx-auto">
            ComiSure
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-lg md:text-xl text-graphite max-w-2xl mx-auto leading-relaxed">
            Locks USDC in a Soroban smart contract so artists always get paid and clients never get scammed.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-action text-action-text font-medium rounded-btn shadow-button text-base"
              >
                Start Commissioning <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface border border-border text-ink font-medium rounded-btn text-base"
              >
                Get a Wallet
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── How It Works — Escrow Pipeline ───────────────────────────── */}
      <section className="max-w-page mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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

      {/* ─── Feature Tiles (Built for Trust) ──────────────────────────── */}
      <section className="bg-surface py-20 -mx-0">
        <div className="max-w-page mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 rounded-card bg-canvas border border-border cursor-default"
              >
                <f.icon className="w-8 h-8 text-accent mb-4" strokeWidth={1.5} />
                <h3 className="text-heading font-medium text-ink tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-base text-graphite leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
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
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="p-6 rounded-card bg-surface border border-border cursor-default"
            >
              <p className="text-heading font-medium text-accent tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-fog">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
