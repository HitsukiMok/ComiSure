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

// Line connector grows in from the left after node appears
const lineVariant = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: (i) => ({
    opacity: 1,
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 22,
      delay: i * 0.18 + 0.1,
    },
  }),
};

function ConnectorLine({ index }) {
  return (
    <motion.div
      custom={index}
      variants={lineVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="hidden md:block w-12 mx-2 origin-left"
    >
      <div className="h-[2px] w-full rounded-full bg-border relative overflow-visible">
        {/* Glow layer */}
        <div className="absolute inset-0 h-[2px] rounded-full bg-accent/60 blur-[4px]" />
        {/* Solid line */}
        <div className="absolute inset-0 h-[2px] rounded-full bg-accent/80" />
      </div>
    </motion.div>
  );
}

function ConnectorLineVertical({ index }) {
  return (
    <motion.div
      custom={index}
      variants={lineVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="md:hidden w-[2px] h-8 my-2 origin-top mx-auto"
    >
      <div className="w-[2px] h-full rounded-full bg-border relative overflow-visible">
        <div className="absolute inset-0 w-[2px] rounded-full bg-accent/60 blur-[4px]" />
        <div className="absolute inset-0 w-[2px] rounded-full bg-accent/80" />
      </div>
    </motion.div>
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
                <ConnectorLine index={i} />
                <ConnectorLineVertical index={i} />
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

          <span className="text-fog text-lg hidden md:block">—</span>
          <span className="text-fog text-sm md:hidden">—</span>

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
