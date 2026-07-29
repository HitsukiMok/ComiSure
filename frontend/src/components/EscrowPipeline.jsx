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

function ConnectorArrow() {
  return (
    <svg className="w-12 h-4 mx-1 hidden md:block flex-shrink-0" viewBox="0 0 48 16">
      <defs>
        <linearGradient id="irisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="11.43%" stopColor="#479dff" />
          <stop offset="78.2%" stopColor="#0069e0" />
        </linearGradient>
      </defs>
      <path
        d="M0 8 H40"
        fill="none"
        stroke="url(#irisGrad)"
        strokeWidth="2"
        strokeDasharray="6 4"
        className="animate-dash-flow"
      />
      <polygon points="38,4 46,8 38,12" fill="#0069e0" />
    </svg>
  );
}

function ConnectorVertical() {
  return (
    <svg className="w-4 h-8 my-1 md:hidden" viewBox="0 0 16 32">
      <path
        d="M8 0 V24"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeDasharray="6 4"
        className="animate-dash-flow"
      />
      <polygon points="4,22 8,30 12,22" fill="var(--color-accent)" />
    </svg>
  );
}

function PipelineNode({ step, label, desc, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative">
        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-action text-action-text text-xs flex items-center justify-center font-medium z-10">
          {step}
        </span>
        <div className="w-[100px] h-[100px] rounded-card bg-surface flex items-center justify-center border border-border">
          <Icon className="w-9 h-9 text-accent" strokeWidth={1.5} />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 text-xs text-fog max-w-[120px]">{desc}</p>
    </motion.div>
  );
}

export default function EscrowPipeline() {
  return (
    <section className="w-full">
      {/* Main Pipeline */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-0">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.step}>
            <PipelineNode {...stage} index={i} />
            {i < stages.length - 1 && (
              <>
                <ConnectorArrow />
                <ConnectorVertical />
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Safety Branch — "What if something goes wrong?" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <h3 className="text-heading-sm font-medium text-ink mb-8">
          What if something goes wrong?
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Deadline Expires */}
          <div className="flex flex-col items-center">
            <div className="w-[80px] h-[80px] rounded-card-sm bg-status-expired flex items-center justify-center">
              <Clock className="w-7 h-7 text-ink" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-sm font-medium text-ink">Deadline Expires</p>
            <p className="text-xs text-fog">Client can self-refund</p>
          </div>

          <span className="text-fog text-lg hidden md:block">or</span>
          <span className="text-fog text-sm md:hidden">or</span>

          {/* Admin Resolves */}
          <div className="flex flex-col items-center">
            <div className="w-[80px] h-[80px] rounded-card-sm bg-status-pending flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-ink" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-sm font-medium text-ink">Admin Resolves</p>
            <p className="text-xs text-fog">Fair resolution with proof</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
