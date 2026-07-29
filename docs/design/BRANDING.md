# ComiSure — Branding Plan

**Version:** 1.0  
**Date:** 2025-07-29  
**Status:** Draft

---

## 1. Brand Essence

**Tagline:** Trustless escrow for digital art commissions.

**One-liner:** ComiSure locks USDC in a smart contract so artists always get paid and clients never get scammed.

**Brand promise:** Every commission is safe. Every payment is instant. No middleman holds your money.

---

## 2. Brand Personality

| Trait | Expression |
|-------|-----------|
| **Trustworthy** | Clean surfaces, precise typography, deliberate restraint. The UI communicates "nothing is hidden" through openness. |
| **Creative** | Soft 3D illustrations, pastel washes, and generous whitespace honor the artistic community it serves. |
| **Approachable** | Light tone, rounded shapes, mid-weight type. No intimidating crypto jargon front and center. |
| **Confident** | Tight tracking, large display type, and a single dark CTA anchor signal professionalism without arrogance. |
| **Modern** | Daylight-studio aesthetic, Soroban-powered, Stellar-fast. The brand looks forward. |

---

## 3. Name Rationale

**Comi** — from "Commission" (hiring an artist for custom work)  
**Sure** — certainty, guarantee, assurance (the escrow promise)

Together: your commission is sure. Short, memorable, works in English and Filipino.

---

## 4. Logo Direction

### 4.1 Primary Mark
A wordmark in Aeonik weight 500, tight -0.02em tracking. "C" and "S" capitalized ("ComiSure") to visually separate the two word roots.

- Color: `#0a0d12` (Ink) on light backgrounds
- Color: `#ffffff` (Paper White) on dark surfaces
- Minimum size: 24px height
- Clear space: 1× the height of the "C" on all sides

### 4.2 Icon Mark
A rounded shield (32px radius) with a checkmark inside. Shield = protection. Checkmark = approval.

- Fill: `#181d27` (Charcoal) with 3px iris-blue gradient border
- Alternative: White on dark backgrounds
- Use: Favicon, app icon, social avatar

### 4.3 Variations

| Variant | Use Case |
|---------|----------|
| Full wordmark | Nav bar, marketing, documentation |
| Icon + wordmark (horizontal) | Email headers, social banners |
| Icon only | Favicon, 32×32, loading states |
| Monochrome (Ink only) | Legal, print, low-contrast |

---

## 5. Color Strategy

### 5.1 Primary Palette

| Role | Color | Hex | Meaning |
|------|-------|-----|---------|
| Canvas | Sky Tint | `#ebf5ff` | The studio — clean, open, airy |
| Surface | Bone White | `#fafdff` | The artwork canvas — content lives here |
| Action | Charcoal | `#181d27` | Commitment — locking funds, approving, deciding |
| Accent | Iris Blue | `#0069e0` | Trust — blockchain, verification, Stellar |

### 5.2 Status Colors (Escrow States)

| State | Color | Hex | Application |
|-------|-------|-----|-------------|
| Pending | Lavender Wash | `#f1e6ff` | Awaiting deposit — gentle, expectant |
| Funded | Powder Blue | `#cce7ff` | Funds locked — secure, calm |
| Released | Mint Wash | `#d3f6e3` | Artist paid — success, growth |
| Refunded | Peach | `#ffd1b8` | Returned to client — warm, resolved |
| Expired | Solar | `#fff2be` | Deadline passed — attention needed |

### 5.3 Color Psychology
The palette is intentionally soft. Art commissions are emotional — an artist's livelihood depends on payment, a client's trust depends on delivery. Hard reds and high-saturation alerts create anxiety. Pastel washes communicate state without stress.

The single dark element (Charcoal buttons) represents the moment of action. These are the only dense weights on the page because they represent irreversible on-chain decisions.

---

## 6. Typography Strategy

### 6.1 Display: Aeonik
All headlines and editorial moments. Weight 500 only — the brand never shouts. Tight tracking (-0.02em) creates sculpted confidence.

### 6.2 UI: Geist
All interface text — buttons, labels, body, inputs, status. Weight 500 standard; 600 only for 10px micro-labels.

### 6.3 Practical Fallback
Use **Geist Sans** (free via Vercel CDN) for both roles initially. Upgrade to Aeonik when budget allows. Fallback chain: Geist → Inter → system sans-serif.

---

## 7. Illustration Style

### 7.1 Subjects for ComiSure
- Shield with checkmark (escrow protection)
- Paint palette / brush (art/creativity)
- USDC coin/token (payments)
- Handshake (trust, transaction)
- Clock with gradient (deadline)
- Lock opening (fund release)
- Envelope with star (delivery)

### 7.2 Rules
- Soft, rounded, clay-like 3D renders in pastel colors
- One iris-blue accent object per scene
- No black outlines — depth via shading only
- Always transparent background — sky canvas shows through
- Float without containers, borders, or shadow plates

---

## 8. Voice and Tone

### 8.1 Brand Voice
ComiSure speaks like a knowledgeable friend who understands art and crypto:
- **Clear** — Short sentences. Active voice. No jargon without context.
- **Warm** — Acknowledges the human side of commissions.
- **Precise** — About money and security, every word is exact.
- **Encouraging** — "Your funds are locked safely" not "Warning: irreversibly committed."

### 8.2 Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Marketing | Confident, aspirational | "Every commission, secured on Stellar." |
| Dashboard | Supportive, informative | "Funds locked. The artist can now begin work." |
| Errors | Calm, instructive | "The deadline hasn't passed yet. You can claim a refund after it expires." |
| Success | Warm, celebratory | "Released! The artist has received 50 USDC." |
| Empty states | Encouraging | "No commissions yet. Create your first escrow." |

### 8.3 Microcopy Rules
- Say "USDC" not "dollars" or "crypto"
- Say "lock" and "release" not "deposit" and "withdraw"
- Address the user as "you"
- Button labels: 2–4 words max
- Wallet addresses: first 6 + last 4 characters

---

## 9. Iconography
- Library: **Lucide React** (already in use)
- Line weight: 1.5px, rounded caps/joins
- Sizes: 16/20/24px
- Color: inherits from text (Ink, Graphite, or Fog)

---

## 10. Motion

| Element | Animation | Duration |
|---------|-----------|----------|
| Cards appearing | Fade up + Y translate | 0.3s |
| State badge change | Color crossfade | 0.3s |
| Countdown tick | Number fade | 0.2s |
| Toasts | Slide up bottom-right | 0.3s |
| Refund button reveal | Fade + scale 0.95→1 | 0.4s |
| 3D illustrations | Gentle float/bob | 3s infinite |
| Page transitions | Opacity + direction | 0.3s |
| Background gradient | Drift + scale blobs | 18s infinite |
| Pipeline orbs | Travel full line width | 6s linear infinite |
| Pipeline nodes | Bounce-in on scroll | Spring (stiffness 300) |
| Hover lift (cards/buttons) | y:-4 to -6, scale 1.02-1.05 | Spring (stiffness 400) |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)`. Respect `prefers-reduced-motion`.

### 10.1 Animated Background Gradient

A fixed-position layer behind all content with two large blurred radial gradient blobs that slowly drift and scale. Creates a subtle living atmosphere without distracting from content.

| Mode | Blob 1 (top-left) | Blob 2 (bottom-right) |
|------|--------------------|-----------------------|
| Light | `rgba(0, 105, 224, 0.3)` (iris blue) | `rgba(71, 157, 255, 0.2)` (sky blue) |
| Dark | `rgba(71, 157, 255, 0.12)` (lighter iris) | `rgba(147, 197, 253, 0.08)` (pale blue) |

- Filter: `blur(120px)` on both blobs
- Opacity: 0.4
- Animation: translate + scale drift, 18s ease-in-out infinite, second blob offset by -9s
- `z-index: -1`, `pointer-events: none`, `position: fixed`
- Disabled under `prefers-reduced-motion`

---

## 11. Deadline Tracker — The Orbit Timer

The Orbit Timer is the signature component for deadline visualization. It shows time remaining on an escrow as a depleting circular ring.

### 11.1 Structure

A circular SVG progress ring that depletes as time passes. The ring starts at 100% (commission creation) and reaches 0% at deadline.

Inside the ring:
- **Days remaining** — Aeonik 48px weight 500
- **Hours / minutes** — Geist 20px weight 500
- **"remaining" sublabel** — Fog color (#93979f), 14px

The ring stroke begins at 12 o'clock position (SVG `transform: rotate(-90deg)`).

### 11.2 Ring Color Progression

| Time Remaining | Color | Hex | Behavior |
|----------------|-------|-----|----------|
| > 50% | Powder Blue | `#cce7ff` | Steady, no pulse |
| 25–50% | Solar | `#fff2be` | Steady, no pulse |
| < 25% | Peach | `#ffd1b8` | Gentle pulse |
| Expired (0%) | Red | — | Fast pulse, red glow |

### 11.3 States

| State | Condition | Ring | Text | Action |
|-------|-----------|------|------|--------|
| Active | > 7 days | Steady blue | "X days remaining" | — |
| Approaching | < 7 days | Solar pulse | "X days remaining" | — |
| Critical | < 24 hours | Peach fast pulse | "X hours remaining" | — |
| Expired | 0 remaining | Empty ring, red glow | "Deadline passed" | "Claim Refund" activates |
| Completed | Released | Full green ring | "Released ✓" | — |

### 11.4 Compact Variant

Use the compact variant in card lists.

- 4px progress bar below the card title (horizontal, not circular)
- Same color progression as the ring
- Text aligned right: "12d left" in Geist 14px, Fog color

### 11.5 Animation

| Property | Technique | Detail |
|----------|-----------|--------|
| Ring depletion | `stroke-dashoffset` transition | Smooth CSS transition |
| Digit change | Odometer-style flip | Vertical slide per digit |
| Pulse (critical) | `@keyframes pulse` | Opacity 1 → 0.6 → 1, 1.5s infinite |
| Pulse (expired) | `@keyframes pulse` | Opacity 1 → 0.4 → 1, 0.8s infinite |
| Ring start position | `rotate(-90deg)` | Stroke begins at 12 o'clock |

Respect `prefers-reduced-motion`: disable pulse, use instant digit swap.

---

## 12. Dark and Light Mode

### 12.1 Toggle Behavior

- Position: Navbar right side
- Icon: Sun / Moon (Lucide)
- Storage: `localStorage` key `comisure-theme`
- Default: follows `prefers-color-scheme`
- Transition: 0.3s on `background-color`, `color`, and `border-color`

### 12.2 Light Mode Tokens

| Role | Token | Value |
|------|-------|-------|
| Canvas | `--color-canvas` | `#ebf5ff` |
| Surface | `--color-surface` | `#fafdff` |
| Elevated | `--color-elevated` | `#ffffff` |
| Text Primary | `--color-text-primary` | `#0a0d12` |
| Text Secondary | `--color-text-secondary` | `#535862` |
| Text Muted | `--color-text-muted` | `#93979f` |
| Border | `--color-border` | `#e5e7eb` |
| Action | `--color-action` | `#181d27` |
| Action Text | `--color-action-text` | `#ffffff` |
| Accent | `--color-accent` | `#0069e0` |

### 12.3 Dark Mode Tokens

| Role | Token | Value |
|------|-------|-------|
| Canvas | `--color-canvas` | `#202021` |
| Surface | `--color-surface` | `#2a2a2b` |
| Elevated | `--color-elevated` | `#333334` |
| Text Primary | `--color-text-primary` | `#f9fafb` |
| Text Secondary | `--color-text-secondary` | `#9ca3af` |
| Text Muted | `--color-text-muted` | `#6b7280` |
| Border | `--color-border` | `#374151` |
| Action | `--color-action` | `#ffffff` |
| Action Text | `--color-action-text` | `#202021` |
| Accent | `--color-accent` | `#479dff` |

### 12.4 Dark Mode Status Colors

| State | Hex | Note |
|-------|-----|------|
| Pending | `#2d1f4e` | Deep purple background |
| Funded | `#1a3a5c` | Deep blue background |
| Released | `#1a3d2a` | Deep green background |
| Refunded | `#4a2a1a` | Deep orange background |
| Expired | `#3d3516` | Deep gold background |

### 12.5 Mode Rules

- Iris blue shifts lighter in dark mode (`#479dff` instead of `#0069e0`).
- 3D illustrations keep their pastel colors in both modes.
- The Orbit Timer ring uses the same colors in both modes.
- Remove box-shadows in dark mode. Create depth via brightness stepping.
- Card borders become visible in dark mode (1px solid `--color-border`).

### 12.6 CSS Custom Properties

```css
:root {
  --color-canvas: #ebf5ff;
  --color-surface: #fafdff;
  --color-elevated: #ffffff;
  --color-text-primary: #0a0d12;
  --color-text-secondary: #535862;
  --color-text-muted: #93979f;
  --color-border: #e5e7eb;
  --color-action: #181d27;
  --color-action-text: #ffffff;
  --color-accent: #0069e0;
}

[data-theme="dark"] {
  --color-canvas: #202021;
  --color-surface: #2a2a2b;
  --color-elevated: #333334;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-border: #374151;
  --color-action: #ffffff;
  --color-action-text: #202021;
  --color-accent: #479dff;
}
```

---

## 13. Landing Page — Architecture Flow

### 13.1 Concept: The Escrow Pipeline

The landing page "How it works" section uses a connected flow diagram — not bento grids.

**Rationale:** Bento grids break the narrative. ComiSure's value is a process (money flows client → contract → artist). A pipeline tells this story in 3 seconds of animation.

Layout:
- Desktop: horizontal connected flow
- Mobile: vertical connected flow

### 13.2 Pipeline Stages

| Step | Label | Icon | Description |
|------|-------|------|-------------|
| 1 | Agree | Handshake | Client and artist set terms |
| 2 | Lock USDC | Shield | Client locks funds in escrow |
| 3 | Create | Paintbrush | Artist delivers the work |
| 4 | Approve | Checkmark | Client approves delivery |
| 5 | Instant Pay | Flying coin | Artist receives USDC instantly |

### 13.3 Node Design

- Size: 120×120px, border-radius 32px
- Background: Bone White (`#fafdff`)
- Illustration: 64×64px 3D render, centered
- Label: Geist 16px weight 500, below illustration
- Step pill: top-left corner, 9999px radius, Geist 12px

### 13.4 Connecting Paths

- Stroke: SVG dashed line, 4px dash / 8px gap
- Color: Iris-blue gradient
- Animation: `stroke-dashoffset` flows in arrow direction
- Trigger: scroll-reveal (Intersection Observer)
- Timing: sequential, 2s per connection, staggered start

### 13.5 "What If?" Safety Branch

Below the main pipeline, a lighter branch shows failure-path safety.

- Heading: "What if something goes wrong?" — Aeonik 32px weight 500
- Paths: 1px Fog-colored dashed strokes (lighter than main)
- Nodes: 80×80px (smaller than main pipeline)
- Branch A: Deadline Expires → Refund
- Branch B: Admin Resolve → Fair outcome
- Timing: fades in after main pipeline completes

### 13.6 Mobile Adaptation

- Stack nodes vertically, full-width cards
- Illustration left, text right (row layout per node)
- Short vertical dashes between nodes
- "What If?" branch becomes an accordion

### 13.7 Animation Sequence

1. First node fades in on scroll.
2. Dashed path animates from node 1 toward node 2 (2s).
3. Node 2 fades in at path arrival.
4. Repeat for nodes 3–5.
5. "What If?" branch fades in 0.5s after node 5 appears.

Respect `prefers-reduced-motion`: show all nodes immediately, no path animation.

---

## 14. UI Label Mapping

| Internal | User-Facing | Why |
|----------|-------------|-----|
| Commission | Commission | Familiar to artists |
| Contract | Escrow | Less technical |
| deposit_funds | Lock Funds | Matches escrow metaphor |
| approve_release | Approve & Release | Clear two-word action |
| client_refund_expired | Claim Refund | Short, actionable |
| EscrowState::Funded | Funds Locked | Feels secure |
| EscrowState::Released | Released to Artist | Shows destination |
| EscrowState::Refunded | Refunded to Client | Shows destination |

---

## 15. Accessibility

| Aspect | Requirement |
|--------|-------------|
| Contrast | WCAG AA minimum (4.5:1). Ink/Sky Tint = 14.2:1. |
| Focus | 2px iris-blue outline on keyboard focus |
| Motion | Disable animations on `prefers-reduced-motion` |
| Screen readers | Descriptive labels, ARIA live regions for state changes |
| Touch | 44×44px minimum tap targets |

---

## 16. Brand Application Checklist

- [ ] Canvas `#ebf5ff`, cards `#fafdff`, elevated `#ffffff`
- [ ] Headings: weight 500, tracking -0.02em
- [ ] Body: weight 500, tracking -0.01em
- [ ] Buttons: `#181d27`, white text, 32px radius
- [ ] No box-shadows on cards — depth via color shift
- [ ] Radius: 16px min, 32px cards, 9999px pills
- [ ] Status uses defined pastel mapping
- [ ] Iris blue for borders/highlights only, never button fills
- [ ] Illustrations float on transparent backgrounds
- [ ] Copy follows voice guidelines
- [ ] Deadline tracker uses the Orbit Timer ring component
- [ ] Dark/light mode toggle is present and persists preference
- [ ] Landing page "How it works" uses pipeline flow, not bento grids
