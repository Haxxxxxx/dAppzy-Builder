# Mobile Builder Integration — Dashboard Contract

This document defines the exact data contract between the ThirdSpaceCMS dashboard and the mobile builder. The dashboard is the source of truth for project creation, configuration, and metadata. The mobile builder must read, respect, and write back data according to this contract.

## URL Parameters — What the Dashboard Sends

When the dashboard opens the mobile builder, it constructs this URL:

```
https://mobile-builder.dappzy.io/?userId={walletAddress}&projectId={projectId}&template={templateId}&returnUrl={dashboardOrigin}#token={firebaseIdToken}
```

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `userId` | Query | Yes | User's wallet address (Firestore doc ID under `users/`) |
| `projectId` | Query | Yes | Project doc ID under `projects/{userId}/ProjectRef/` |
| `template` | Query | On new projects | Template ID from dashboard selection (see below) |
| `returnUrl` | Query | Yes | Dashboard origin URL for "Back to Dashboard" navigation |
| `token` | Hash | Yes | Firebase ID token for auth handoff — extract then clear hash immediately |

### Template IDs for Mobile Projects

When `projectId=new`, the dashboard passes one of these template IDs:

| ID | Name | Description |
|----|------|-------------|
| `blank` | Blank | Empty canvas |
| `wallet` | Wallet Manager | Connect wallet, view tokens, transfer |
| `nft-gallery` | NFT Gallery | Browse and trade NFTs |
| `token-swap` | Token Swap | Simple DEX swap interface |
| `defi-portfolio` | DeFi Portfolio | Holdings, yield, positions |
| `dao-governance` | DAO Governance | Vote on proposals, stake |

The mobile builder should have its own element/component definitions for each template. If the template ID is unrecognized, fall back to a blank project.

## Auth Handoff Protocol

1. Extract token from URL hash: `window.location.hash.split('token=')[1]`
2. Immediately clear the hash: `window.history.replaceState(null, '', window.location.pathname + window.location.search)`
3. Call the `exchangeToken` Cloud Function:
   ```js
   const res = await fetch(`${FUNCTIONS_BASE}/exchangeToken`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ idToken }),
   });
   const { customToken } = await res.json();
   await signInWithCustomToken(auth, customToken);
   ```
4. `userId` from URL params = the wallet address = Firebase Auth UID

### Return to Dashboard

When user clicks "Back to Dashboard":
```js
const idToken = await auth.currentUser?.getIdToken();
const url = new URL(returnUrl);  // from URL params
url.hash = `token=${idToken}`;
window.location.href = url.toString();
```

Validate `returnUrl` against an allowlist before redirecting:
```js
const ALLOWED_HOSTS = ['dashboard.dappzy.io', 'dappzy.io', 'localhost'];
```

## Firestore Data Model

### Project Document Path
```
projects/{userId}/ProjectRef/{projectId}
```

### Fields Written by Dashboard (mobile builder MUST read)

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `'mobile'` | Always `'mobile'` for mobile projects — **do not overwrite** |
| `template` | `string` | Template ID used at creation |
| `userId` | `string` | Owner wallet address |
| `websiteSettings.siteTitle` | `string` | Project name (editable by user in dashboard) |
| `envVars` | `Array<{key: string, value: string}>` | Environment variables set in dashboard |
| `createdAt` | `Timestamp` | Project creation time |
| `lastUpdated` | `Timestamp` | Last modification time |

### Fields the Mobile Builder MUST Write Back

These fields are read by the dashboard to show project status and metadata:

| Field | Type | When to Write | Dashboard Reads It For |
|-------|------|---------------|----------------------|
| `lastUpdated` | `serverTimestamp()` | On every save/auto-save | "Last edited" display, milestones |
| `websiteSettings.siteTitle` | `string` | If user renames in builder | Project card title |
| `websiteSettings.thumbnailUrl` | `string` | On build/preview | Project card thumbnail |

### Fields the Mobile Builder SHOULD Write (for full dashboard integration)

| Field | Type | When to Write | Dashboard Reads It For |
|-------|------|---------------|----------------------|
| `buildStatus` | `'building' \| 'success' \| 'failed'` | On build start/complete/fail | Deployment status card |
| `buildError` | `string \| null` | On build failure | Error display |
| `lastBuiltAt` | `serverTimestamp()` | On successful build | Build history, activity log |
| `buildUrl` | `string` | On successful build | "Preview" button, QR code |
| `appStoreUrl` | `string` | When published to store | "Open in App Store" link |
| `playStoreUrl` | `string` | When published to store | "Open in Play Store" link |
| `bundleId` | `string` | On app config | App identifier display |
| `appVersion` | `string` | On each build | Version display |

### Fields the Mobile Builder MUST NOT Overwrite

These are managed exclusively by the dashboard:

| Field | Reason |
|-------|--------|
| `platform` | Set at creation, never changes |
| `template` | Historical record of which template was used |
| `envVars` | Managed in dashboard EnvVarsEditor |
| `seoSettings` | Web-only, not applicable |
| `customCode` | Web-only, not applicable |
| `analyticsSettings` | Web-only (GA/Plausible), not applicable |
| `ipfsHash` / `ipfsUrl` | Web deployment only |
| `currentSnapshotId` | Web version history only |

### Auto-Save Safety

If the mobile builder auto-saves, use `merge: true` to avoid clobbering dashboard fields:

```js
import { setDoc, serverTimestamp } from 'firebase/firestore';

await setDoc(projectRef, {
  elements: currentElements,       // Mobile builder state
  pages: currentPages,             // If multi-screen
  websiteSettings: {
    siteTitle: currentTitle,
    thumbnailUrl: currentThumbnail,
  },
  lastUpdated: serverTimestamp(),
}, { merge: true });  // CRITICAL — preserves envVars, platform, template, etc.
```

**Never** use `setDoc` without `{ merge: true }` — it will delete all dashboard-managed fields.

## Snapshots / Version History (Optional)

The dashboard supports version history via a `snapshots` subcollection:

```
projects/{userId}/ProjectRef/{projectId}/snapshots/{snapshotId}
```

If the mobile builder wants to support build history, write a snapshot on each build:

```js
await addDoc(snapshotsRef, {
  createdAt: serverTimestamp(),
  createdBy: userId,
  buildUrl: 'https://...',        // Preview URL for this build
  appVersion: '1.0.3',
  buildStatus: 'success',
  buildDuration: 45000,           // ms
});
```

The dashboard will display these in the "Build History" section of the project details page.

## What the Dashboard Shows for Mobile Projects

### Visible sections:
- Project header with 📱 Mobile badge
- Deployment/build status card (reads `buildStatus`, `lastBuiltAt`, `buildError`)
- Environment variables editor
- Performance score (hidden — web only)
- Project backup/export
- Activity log (derived from project data + snapshots)
- Danger zone (rename, delete)

### Hidden sections (web-only):
- IPFS deployment details
- Domain management (SNS, UNS, custom)
- Domain health checks
- SEO editor
- Social preview cards
- Embed code generator
- Custom code editor (CSS/JS/Head)
- Analytics settings (GA/Plausible)
- Deployment diff viewer
- Version history with rollback

### Smart features:
- Smart recommendations skip mobile projects for deploy/SEO/analytics/domain checks
- Deployment stats card counts web only, shows mobile count separately
- Onboarding checklist adapts for mobile-only users
- Milestones trigger on `lastUpdated` for mobile (no IPFS dependency)

## Cloud Functions Available

The mobile builder can use these existing Cloud Functions:

| Function | Method | Auth | Purpose |
|----------|--------|------|---------|
| `exchangeToken` | POST | ID token in body | Exchange ID token for custom token |
| `generateApiKey` | POST | Bearer token | Generate API key for programmatic access |
| `revokeApiKey` | POST | Bearer token | Revoke an API key |
| `sendSupportEmail` | POST | Bearer token | Submit support ticket |

### Not applicable for mobile:
- `uploadToPinata` — IPFS upload (web deployment)
- `rollbackProjectVersion` — IPFS version rollback
- `listPinataMedia` / `deletePinataMedia` — IPFS media management

## Environment Variables

The dashboard lets users set env vars at `project.envVars`:

```json
[
  { "key": "API_URL", "value": "https://api.example.com" },
  { "key": "CHAIN_ID", "value": "mainnet-beta" }
]
```

The mobile builder should:
1. Read `envVars` when loading the project
2. Make them available during the build process (e.g., inject into app config)
3. Never modify them (managed by dashboard only)
4. Auto-save with `merge: true` preserves them automatically

## Notifications & Webhooks

When the mobile builder completes a build, it can trigger the user's configured webhooks. Read `users/{userId}/webhooks` for configured endpoints:

```json
{
  "url": "https://example.com/hook",
  "events": ["deploy-success", "deploy-fail", "quota-warning"],
  "active": true
}
```

If the build event matches a webhook's `events` array and `active` is `true`, POST to the URL:

```json
{
  "event": "deploy-success",
  "timestamp": "2026-03-19T12:00:00Z",
  "project": {
    "id": "abc123",
    "name": "My App",
    "platform": "mobile",
    "appVersion": "1.0.3"
  }
}
```

## Production vs Development

| Environment | Dashboard URL | Mobile Builder URL | Auth |
|-------------|--------------|-------------------|------|
| Production | `https://dashboard.dappzy.io` | `https://mobile-builder.dappzy.io` | Firebase prod project |
| Development | `http://localhost:3000` | `http://localhost:3001` (or your port) | Firebase prod or emulator |

Set `VITE_DASHBOARD_URL` in the mobile builder's `.env` for return navigation.

## Summary Checklist

Before shipping, verify the mobile builder:

- [ ] Extracts token from URL hash and clears it immediately
- [ ] Calls `exchangeToken` CF and signs in with custom token
- [ ] Reads `?template=` and pre-loads matching template on new projects
- [ ] Reads `?returnUrl=` and uses it for "Back to Dashboard" button
- [ ] Loads project from `projects/{userId}/ProjectRef/{projectId}`
- [ ] Reads `envVars` from project doc
- [ ] Uses `setDoc` with `{ merge: true }` for all auto-saves
- [ ] Writes `lastUpdated: serverTimestamp()` on every save
- [ ] Writes `websiteSettings.thumbnailUrl` on build/preview
- [ ] Never overwrites `platform`, `template`, `envVars`, `seoSettings`, `customCode`
- [ ] Validates `returnUrl` against allowlist before redirecting
- [ ] Handles missing/expired token gracefully (show login prompt)
