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

// Bounce ease-out spring for nodes entering viewport
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

// Arrow connector fades in after its preceding node
const arrowVariant = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: (i) => ({
    opacity: 1,
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      delay: i * 0.18 + 0.1,
    },
  }),
};

function ConnectorArrow({ index }) {
  return (
    <motion.svg
      custom={index}
      variants={arrowVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-14 h-4 mx-1 hidden md:block flex-shrink-0 origin-left"
      viewBox="0 0 56 16"
    >
      <defs>
        <linearGradient id={`irisGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="11.43%" stopColor="#479dff" />
          <stop offset="78.2%" stopColor="#0069e0" />
        </linearGradient>
      </defs>
      <path
        d="M0 8 H46"
        fill="none"
        stroke={`url(#irisGrad-${index})`}
        strokeWidth="2"
        strokeDasharray="6 4"
        className="animate-dash-flow"
      />
      <polygon points="44,4 54,8 44,12" fill="#0069e0" />
    </motion.svg>
  );
}

function ConnectorVertical({ index }) {
  return (
    <motion.svg
      custom={index}
      variants={arrowVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-4 h-10 my-1 md:hidden origin-top"
      viewBox="0 0 16 40"
    >
      <path
        d="M8 0 V30"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeDasharray="6 4"
        className="animate-dash-flow"
      />
      <polygon points="4,28 8,38 12,28" fill="var(--color-accent)" />
    </motion.svg>
  );
}

function PipelineNode({ step, label, desc, icon: Icon, index }) {
  return (
    <motion.div
      custom={index}
      variants={bounceIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="flex flex-col items-center text-center"
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
                <ConnectorArrow index={i} />
                <ConnectorVertical index={i} />
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Safety Branch — "What if something goes wrong?" */}
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
          {/* Deadline Expires */}
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

          <span className="text-fog text-lg hidden md:block">or</span>
          <span className="text-fog text-sm md:hidden">or</span>

          {/* Admin Resolves */}
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
