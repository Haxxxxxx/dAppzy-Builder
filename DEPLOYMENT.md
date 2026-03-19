# dAppzy-Builder Deployment Guide

> Step-by-step guide for building and deploying the dAppzy-Builder application.
> Last updated: 2026-02-28 (Round 11)

---

## Prerequisites

- **Node.js** 22+ (LTS recommended)
- **npm** 10+ (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Vite** (installed via npm as a devDependency)

---

## 1. Environment Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (e.g., `project-id.firebaseapp.com`) |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID (e.g., `third--space`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID |
| `VITE_CF_BASE_URL` | Cloud Functions base URL for backend API calls |
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint (defaults to devnet if not set) |
| `VITE_HELIUS_API_KEY` | Helius API key for enhanced Solana RPC |
| `VITE_HELIUS_RPC_URL` | Helius RPC URL for SNS reverse lookups |
| `VITE_UD_CLIENT_ID` | Unstoppable Domains OAuth client ID |
| `VITE_UD_REDIRECT_URI` | Unstoppable Domains OAuth redirect URI |
| `VITE_SOLANA_ADMIN_WALLET` | Admin wallet public key for payment processing |
| `VITE_ENCRYPTION_KEY` | Encryption key for sensitive data |

### Optional Variables

| Variable | Description |
|---|---|
| `VITE_GATEWAY_URL` | IPFS gateway URL for reading pinned content |
| `VITE_ETH_RPC_URL` | Ethereum RPC endpoint (defaults to public RPC) |
| `VITE_REVERSE_LOOKUP_URL` | SNS reverse lookup endpoint |
| `VITE_SENTRY_DSN` | Sentry DSN for error monitoring (errors silently ignored if not set) |

---

## 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is required due to peer dependency conflicts in some packages.

---

## 3. Development Server

```bash
npm run dev
# or
npm start
```

Opens at `http://localhost:3000` by default.

In development mode, `@axe-core/react` runs accessibility audits automatically (check browser console).

---

## 4. Build for Production

```bash
npm run build
# or
npx vite build
```

Output directory: `build/`

The build produces:
- **Main chunk** (`index-*.js`) — shared dependencies
- **Lazy chunks** — `BuilderPageLoader-*.js`, `PreviewPage-*.js`, `WalletConnection-*.js`
- **CSS chunks** — per-route stylesheets
- **bundle-stats.html** — bundle analysis report (gitignored)

---

## 5. Preview Production Build

```bash
npm run preview
# or
npx vite preview
```

Serves the `build/` directory locally.

---

## 6. Firebase Setup

### Project Configuration

- **Firebase Project:** `third--space`
- **Hosting targets:** `default` and `builder`
- **Build directory:** `build/`
- **SPA rewrite:** All routes → `/index.html`

### Security Headers (configured in `firebase.json`)

Both hosting targets include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS with subdomains)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation disabled)
- `Content-Security-Policy` (restrictive CSP with allowlisted origins)

### Login to Firebase

```bash
firebase login
```

---

## 7. Deploy

### Full deploy (default target)

```bash
npm run deploy
# equivalent to: vite build && firebase deploy
```

### Deploy to builder target only

```bash
npx vite build && firebase deploy --only hosting:builder
```

### Deploy to test/demo target

```bash
npm run deploy-test
# equivalent to: vite build && firebase deploy --only hosting:3rd-demo
```

### Hosting-only deploy (skip functions/rules)

```bash
firebase deploy --only hosting
```

---

## 8. Post-Deploy Verification

After deployment, verify these critical flows:

- [ ] **Wallet Connection** — Test Phantom, MetaMask, Unstoppable Domains, and Freighter login
- [ ] **Builder Canvas** — Drag elements onto canvas, edit content inline
- [ ] **Element Library** — All 52 element types render correctly
- [ ] **Export to HTML** — Export produces valid HTML with CSP headers
- [ ] **IPFS Upload** — Upload to IPFS via Pinata (if configured)
- [ ] **Preview Page** — Published sites render at `/:customUrl` routes
- [ ] **Subscription/Upgrade** — Payment flow with Solana admin wallet
- [ ] **SNS Domain** — Domain registration and reverse lookup
- [ ] **Responsive Layout** — Test on mobile viewport sizes

---

## 9. Troubleshooting

### Build fails with peer dependency errors
```bash
npm install --legacy-peer-deps
```

### `import.meta.env` variables are undefined
Ensure all env vars start with `VITE_` prefix. Restart the dev server after changing `.env`.

### Bundle too large
Run `npx vite build` and open `bundle-stats.html` for analysis. Consider adding more `React.lazy()` boundaries.

### Firebase deploy permission denied
```bash
firebase login --reauth
firebase use third--space
```
