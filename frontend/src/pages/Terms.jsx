import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-page mx-auto px-6 py-12">
      <Link to="/" className="flex items-center gap-2 text-graphite hover:text-ink mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <article className="prose-custom">
        <h1>Terms of Service</h1>
        <p className="text-sm text-fog">Effective Date: July 29, 2025</p>

        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using the ComiSure platform ("Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
        <p>ComiSure is operated by the ComiSure development team ("we," "us," "our"). The Service is available at our web application and interacts with the Stellar blockchain network.</p>

        <h2>2. Service Description</h2>
        <p>ComiSure is a decentralized escrow platform for freelance digital art commissions. The Service:</p>
        <ul>
          <li>Deploys Soroban smart contracts on the Stellar network to hold USDC funds in escrow.</li>
          <li>Provides a web interface for creating, funding, and managing commission escrows.</li>
          <li>Enables clients to lock USDC until artwork delivery is approved.</li>
          <li>Enables artists to receive guaranteed payment upon client approval.</li>
          <li>Provides admin dispute resolution for contested commissions.</li>
        </ul>

        <h2>3. Eligibility</h2>
        <ul>
          <li>You are at least 18 years old (or the age of majority in your jurisdiction).</li>
          <li>You have the legal capacity to enter into binding agreements.</li>
          <li>You are not located in a jurisdiction where cryptocurrency or blockchain services are prohibited.</li>
          <li>You possess a compatible Stellar wallet (e.g., Freighter, Albedo, xBull).</li>
        </ul>

        <h2>4. Account and Wallet</h2>
        <ul>
          <li><strong>No traditional accounts.</strong> Authentication uses your Stellar wallet address via cryptographic challenge-response.</li>
          <li><strong>You are responsible</strong> for the security of your wallet, private keys, and seed phrases.</li>
          <li><strong>We never have access</strong> to your private keys or seed phrases.</li>
          <li><strong>Lost access</strong> to your wallet means lost access to your funds. We cannot recover funds locked in a smart contract if you lose your wallet credentials.</li>
        </ul>

        <h2>5. Platform Fees</h2>
        <p>ComiSure currently charges no platform fees. 100% of escrowed funds go to the artist or back to the client. Stellar network transaction fees (less than $0.001 per transaction) apply and are paid by the transaction signer.</p>

        <h2>6. Escrow Mechanics</h2>
        <h3>6.1 Fund Locking</h3>
        <p>When a client deposits USDC into a commission smart contract, the funds are locked on the Stellar blockchain. Neither ComiSure nor any third party can access these funds outside the contract's programmed conditions.</p>
        <h3>6.2 Fund Release</h3>
        <p>Funds release to the artist only when the client approves the release on-chain, or when the platform admin force-releases funds after dispute review.</p>
        <h3>6.3 Refunds</h3>
        <p>Funds return to the client only when the platform admin issues a refund after dispute review, or the commission deadline expires and the client claims the refund on-chain.</p>
        <h3>6.4 Irreversibility</h3>
        <p>Released and refunded states are <strong>final and irreversible</strong>. Once funds move on-chain, the transaction cannot be undone.</p>

        <h2>7. Deadlines and Auto-Refund</h2>
        <ul>
          <li>Clients set a deadline (1–90 days) when creating a commission.</li>
          <li>If the artist does not deliver before the deadline, the client may claim a self-refund directly from the smart contract.</li>
          <li>The deadline does not block the client from approving release after expiry.</li>
          <li>Deadlines are immutable once the contract is deployed.</li>
        </ul>

        <h2>8. Disputes</h2>
        <p>Either party may raise a dispute. The admin reviews evidence off-chain and may force-release or refund. Admin decisions are final within the platform. We are not a court, arbitrator, or legal authority.</p>

        <h2>9. Prohibited Uses</h2>
        <ul>
          <li>Money laundering or financing illegal activities.</li>
          <li>Tax evasion or circumventing financial regulations.</li>
          <li>Defrauding other users.</li>
          <li>Exploiting smart contracts for non-commission purposes.</li>
          <li>Impersonating another person or wallet address.</li>
          <li>Interfering with or attacking platform infrastructure.</li>
          <li>Using bots to abuse rate limits or create spam.</li>
        </ul>

        <h2>10. Intellectual Property</h2>
        <p>You retain all rights to artwork and materials you create. The ComiSure name, logo, and code are our intellectual property. We do not claim ownership over artwork exchanged between users.</p>

        <h2>11. Disclaimers</h2>
        <p>The Service is provided "AS IS" without warranties. We are not a financial institution and do not provide financial advice. You accept the risks of smart contracts, irreversible transactions, and potential regulatory changes.</p>
        <p><strong>Testnet Notice:</strong> ComiSure currently operates on the Stellar Testnet. Testnet tokens have no real monetary value.</p>

        <h2>12. Limitation of Liability</h2>
        <p>We are not liable for loss of funds due to smart contract bugs, wallet compromise, user error, or network issues. Our total liability is limited to platform fees paid by you in the prior 12 months (currently $0).</p>

        <h2>13. Modifications</h2>
        <p>We may update these Terms at any time. Material changes will be announced 14 days in advance. Continued use constitutes acceptance.</p>

        <h2>14. Contact</h2>
        <p>For questions about these Terms, contact us through our platform channels.</p>
      </article>
    </div>
  );
}
