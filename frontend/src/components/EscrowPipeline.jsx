import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Lock, Paintbrush, CheckCircle2, Coins, Clock, ShieldAlert } from 'lucide-react';

const stages = [
  { step: 1, label: 'Agree', desc: 'Client and artist agree on scope', icon: Handshake },
  { step: 2, label: 'Lock USDC', desc: 'Funds lock in an isolated Soroban contract', icon: Lock },
  { step: 3, label: 'Create', desc: 'Artist works with guaranteed payment', icon: Paintbrush },
  { step: 4, label: 'Approve', desc: 'Client reviews and approves delivery', icon: CheckCircle2 },
  { step: 5, label: 'Instant Pay', desc: 'USDC releases to artist in 5 seconds', icon: Coins },
];

const bounceIn = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18,
      delay: i * 0.18,
    },
  }),
};

function PipelineNode({ step, label, desc, icon: Icon, index }) {
  return (
    <motion.div
      custom={index}
      variants={bounceIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="flex flex-col items-center text-center relative z-10 flex-1"
    >
      <div className="relative">
        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-action text-action-text text-xs flex items-center justify-center font-medium z-10">
          {step}
        </span>
        <motion.div
          whileHover={{ y: -4, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-[100px] h-[100px] rounded-card bg-surface flex items-center justify-center border border-border cursor-default"
        >
          <Icon className="w-9 h-9 text-accent" strokeWidth={1.5} />
        </motion.div>
      </div>
      <p className="mt-3 text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 text-xs text-fog max-w-[120px]">{desc}</p>
    </motion.div>
  );
}

function GlowOrb({ className = '' }) {
  return (
    <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_3px_rgba(0,105,224,0.7),0_0_18px_6px_rgba(71,157,255,0.35)] ${className}`} />
  );
}

export default function EscrowPipeline() {
  return (
    <section className="w-full">
      {/* ─── Desktop: continuous line through cards ─── */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Line — inset so it starts/ends at card centers, not container edges */}
          <div className="absolute top-[50px] left-[50px] right-[50px] h-[2px] z-0 overflow-hidden rounded-full">
            {/* Base line */}
            <div className="absolute inset-0 bg-border" />
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-accent/15 blur-[3px]" />
            {/* Orb 1 */}
            <GlowOrb className="animate-travel-full" />
            {/* Orb 2 — offset by half so there's always one visible */}
            <GlowOrb className="animate-travel-full-delayed" />
          </div>

          {/* Nodes */}
          <div className="relative z-10 flex items-start justify-between">
            {stages.map((stage, i) => (
              <PipelineNode key={stage.step} {...stage} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Mobile: vertical continuous line ─── */}
      <div className="md:hidden">
        <div className="relative">
          {/* Line — inset to start/end at card centers */}
          <div className="absolute top-[50px] bottom-[50px] left-1/2 -translate-x-1/2 w-[2px] z-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-border" />
            <div className="absolute inset-0 bg-accent/15 blur-[3px]" />
            <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_3px_rgba(0,105,224,0.7),0_0_18px_6px_rgba(71,157,255,0.35)] animate-travel-full-v" />
            <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_3px_rgba(0,105,224,0.7),0_0_18px_6px_rgba(71,157,255,0.35)] animate-travel-full-v-delayed" />
          </div>

          {/* Nodes */}
          <div className="relative z-10 flex flex-col items-center gap-10">
            {stages.map((stage, i) => (
              <PipelineNode key={stage.step} {...stage} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Safety Branch */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.8 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <h3 className="text-heading-sm font-medium text-ink mb-8">
          What if something goes wrong?
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex flex-col items-center cursor-default"
          >
            <div className="w-[80px] h-[80px] rounded-card-sm bg-status-expired flex items-center justify-center">
              <Clock className="w-7 h-7 text-ink" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-sm font-medium text-ink">Deadline Expires</p>
            <p className="text-xs text-fog">Client can self-refund</p>
          </motion.div>

          <span className="text-fog text-lg hidden md:block">—</span>
          <span className="text-fog text-sm md:hidden">—</span>

          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex flex-col items-center cursor-default"
          >
            <div className="w-[80px] h-[80px] rounded-card-sm bg-status-pending flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-ink" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-sm font-medium text-ink">Admin Resolves</p>
            <p className="text-xs text-fog">Fair resolution with proof</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
