import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-page mx-auto px-6 py-12">
      <Link to="/" className="flex items-center gap-2 text-graphite hover:text-ink mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <article className="prose-custom">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-fog">Effective Date: July 29, 2026</p>

        <h2>1. Introduction</h2>
        <p>This Privacy Policy explains how ComiSure ("we," "us," "our") collects, uses, and protects information when you use our escrow platform for digital art commissions.</p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Stellar wallet address</strong> — for authentication and on-chain interactions.</li>
          <li><strong>Commission title and description</strong> — displayed in your dashboard.</li>
          <li><strong>Artist wallet address</strong> — for contract deployment and payment routing.</li>
          <li><strong>Dispute reason and proof URL</strong> — for dispute resolution.</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>IP address</strong> — for rate limiting only (not persisted).</li>
          <li><strong>Request timestamps</strong> — for rate limiting only (not persisted).</li>
        </ul>

        <h3>2.3 Information We Do NOT Collect</h3>
        <ul>
          <li>Private keys or seed phrases</li>
          <li>Email addresses or real names</li>
          <li>Location data, browsing history, or tracking cookies</li>
          <li>Payment card or bank information</li>
        </ul>

        <h2>3. Blockchain Data</h2>
        <p>All Stellar blockchain transactions are public. Your wallet address, transaction amounts, and contract state changes are permanently visible on the public ledger. We do not control blockchain data — it cannot be deleted or modified.</p>

        <h2>4. How We Use Your Information</h2>
        <ul>
          <li>Deploy and initialize escrow smart contracts.</li>
          <li>Display commission status in your dashboard.</li>
          <li>Authenticate your identity via wallet signature.</li>
          <li>Enforce rate limits and prevent abuse.</li>
          <li>Resolve disputes when raised.</li>
        </ul>
        <p>We do NOT sell your data, target advertisements, or track you across websites.</p>

        <h2>5. Data Sharing</h2>
        <ul>
          <li><strong>Other commission participants</strong> — wallet address and commission details (required for escrow).</li>
          <li><strong>Stellar blockchain</strong> — on-chain data is public.</li>
          <li><strong>Hosting providers</strong> (Render, Supabase, Vercel) — encrypted database records for infrastructure.</li>
          <li><strong>Law enforcement</strong> — only as required by valid legal process.</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>Commission, user, and dispute records are retained indefinitely for reference. Rate limit data expires automatically after 1–60 minutes. On-chain data cannot be deleted.</p>
        <p>To request deletion of off-chain records, contact us through our platform channels.</p>

        <h2>7. Data Security</h2>
        <ul>
          <li>AES-256-GCM encryption for sensitive keys at rest.</li>
          <li>HTTPS/TLS for all API communication.</li>
          <li>Memory zeroing of decrypted keys after use.</li>
          <li>Challenge-response authentication with Stellar wallet signatures.</li>
          <li>Rate limiting and input validation against injection/XSS.</li>
        </ul>

        <h2>8. Cookies and Tracking</h2>
        <p>We use <strong>localStorage</strong> for theme preference and authentication tokens only. We do NOT use third-party analytics, advertising cookies, cross-site tracking, or fingerprinting.</p>

        <h2>9. Third-Party Services</h2>
        <ul>
          <li>Stellar Network — blockchain transactions</li>
          <li>Freighter Wallet — wallet connection</li>
          <li>Supabase — database hosting</li>
          <li>Render — backend hosting</li>
          <li>Vercel — frontend hosting</li>
        </ul>

        <h2>10. Children's Privacy</h2>
        <p>ComiSure is not intended for users under 18. We do not knowingly collect information from children.</p>

        <h2>11. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your off-chain data. Contact us through our platform channels. We respond within 30 days.</p>

        <h2>12. Changes</h2>
        <p>We may update this policy at any time. The "Last Updated" date reflects the most recent revision. Continued use constitutes acceptance.</p>

        <h2>13. Contact</h2>
        <p>For privacy questions or data requests, contact us through our platform channels.</p>
      </article>
    </div>
  );
}
