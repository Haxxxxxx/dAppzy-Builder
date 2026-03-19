# dAppzy-Builder — Audit Status & Task Backlog

> Cross-repo audit performed from ThirdSpaceCMS on 2026-03-10.
> Last updated: 2026-03-10 (after CMS tasks 77-90 completed, CMS at task 97).
> This file tracks the Builder's cleanup/optimization status for the next agent session.

## Codebase Stats
- **214 JS files, 47 CSS files, ~39K lines**
- **React 18 + Vite 6, react-dnd** (antd + @ant-design/icons + react-datepicker removed)
- **6 React Context providers** (Wallet, Editable, AutoSave, Web3, Subscription, Toast)
- **Firebase 12.10.0** (shared project with CMS)
- **Build size:** ~5.4 MB total

## Integration with CMS (ThirdSpaceCMS)
- **Same Firebase project** — shared Firestore, Auth, Storage, Cloud Functions
- **Auth flow:** wallet → nonce → sign → verify → customToken (same flow in both repos)
- **Project path:** `projects/{userId}/ProjectRef/{projectId}` (shared)
- **URL handoff:** CMS redirects to `builder.dappzy.io/?userId=X&projectId=Y`
- **Auth handoff (NEW — CMS task 78):** CMS now passes Firebase ID token via URL hash (`#token=<idToken>`). Builder does NOT yet consume this — still re-authenticates wallet on each visit. Builder should read `window.location.hash`, extract the token, and call `signInWithCustomToken()` to skip wallet re-auth.
- **Shared constants (NEW — CMS task 77):** CMS created `src/constants/firestore.js` with `COLLECTIONS`, `SUBCOLLECTIONS`, `FIELDS`, `PROJECT_DEFAULTS`. Builder should mirror this pattern instead of hardcoding strings.
- **Cloud Functions:** CMS has modular files with V1/V2 comments (task 79). Builder has monolithic `functions/index.js` (823 lines).

## Priority Issues (Highest → Lowest)

### P0 — Critical Refactoring
- [ ] **ContentList.js (1,326 lines)** — Canvas rendering + drag-drop orchestration. Extract: element renderer, drag handlers, selection logic into separate hooks/components
- [ ] **BuilderPageCore.js (986 lines)** — Main layout + AI integration. Extract: AI panel logic, canvas setup, toolbar wiring into hooks
- [ ] **functions/index.js (823 lines)** — Monolithic Cloud Functions. Split into modular files like CMS does (generateNonce.js, verifyPhantom.js, etc.)

### P1 — Architecture & Integration
- [ ] **Consume CMS auth handoff** — Read `#token=<idToken>` from URL hash, use `signInWithCustomToken()` to skip wallet re-auth. See CMS task 78 for pattern.
- [ ] **Create shared `src/constants/firestore.js`** — Extract COLLECTIONS, SUBCOLLECTIONS, FIELDS, PROJECT_DEFAULTS from hardcoded strings across 6+ files (BuilderPageLoader, WalletConnection, SubscriptionContext, PreviewPage). Mirror CMS task 77 pattern.
- [ ] **EditableContext.js (687 lines)** — State + undo/redo. Extract undo/redo into `useUndoRedo` hook, element CRUD into `useElementOperations` hook
- [ ] **UnifiedDropZone.js (753 lines)** — Complex drop logic. Extract drop validation, element creation, position calculation into utilities
- [ ] **DraggableContentSections.js (717 lines)** — Section templates. Extract section configs to constants
- [ ] **SectionConfiguration.js (581 lines)** — Preset configs. Move to constants/JSON file
- [ ] **Check `vite-plugin-node-polyfills`** — CMS had it unused (saved 324KB). Builder likely same situation

### P2 — Code Quality
- [ ] **UpgradePopup.js (578 lines)** — Upgrade modal. Split into sub-components (pricing card, feature list, payment flow)
- [ ] **BuilderPageLoader.js (567 lines)** — Project loading. Extract project list, creation, loading into hooks
- [ ] **Duplicate auth functions** — Builder's functions/index.js duplicates CMS auth logic. Consider shared package or single deployment
- [ ] **sns/utils.js (575 lines)** — SNS deployment. Extract domain validation, deployment steps into separate files

### P3 — Performance & UX
- [ ] **No virtual scrolling** on element tree/layers panel — large projects will lag
- [ ] **ContentList re-renders** on every element change — add memoization
- [ ] **EditableContext** recreates entire element array on change — optimize immutable updates
- [ ] **Bundle analysis** — run visualizer, check for tree-shaking opportunities
- [ ] **localStorage quota** — 5-10MB limit with chunking. Monitor and add quota warning

### P4 — Polish
- [ ] **CSS variables** — hardcoded colors throughout, should use design tokens
- [ ] **TypeScript migration** — incremental, start with contexts and hooks
- [ ] **Test coverage** — vitest configured but minimal tests
- [ ] **Accessibility** — @axe-core/react installed but check coverage

## Recent Improvements (Builder-side)
- ✅ Lazy-load SideBar registries, NewElementPanel, EditorPanel
- ✅ Merged HeadingSettings.css + FormSettings.css → SettingsPanel.css
- ✅ Removed dead `@solana/wallet-adapter-wallets` dependency
- ✅ Deleted empty CandyMachineSettings.css
- ✅ Removed `antd`, `@ant-design/icons`, `react-datepicker` dependencies (saved 678KB vendor chunk)
- ✅ Replaced `react-datepicker` with native `<input type="datetime-local">` in CandyMachineSettings
- ✅ Replaced antd with native HTML in DeFiSectionSettings
- ✅ Added SettingsForm.css for native dark-theme form elements

## Security Status
- ✅ Nonce-based wallet auth (replay prevention)
- ✅ DOMPurify for HTML sanitization
- ✅ SSRF prevention in ipfsUtils
- ✅ Firestore rules: default deny, owner-only access
- ✅ Rate limiting on Cloud Functions
- ✅ No hardcoded keys in source
- ⚠️ localStorage subscription cache (client-readable, verify server-side)

## Shared Resources (CMS ↔ Builder)
| Resource | CMS Location | Builder Location |
|----------|-------------|-----------------|
| Firebase config | `src/firebaseConfig.js` | `src/firebaseConfig.js` |
| Firestore constants | `src/constants/firestore.js` (COLLECTIONS, FIELDS, etc.) | Hardcoded strings in 6+ files |
| Collections | `src/constants/collections.js` (re-exports from firestore.js) | Hardcoded strings |
| Wallet types | `src/constants/walletTypes.js` | Hardcoded in functions |
| Auth functions | `functions/` (modular, 12 files, V1/V2 comments) | `functions/index.js` (1 file, 823 lines) |
| Auth handoff | Sends `#token=<idToken>` in redirect URL | Not yet consumed |
| Project schema | `src/constants/firestore.js` (PROJECT_DEFAULTS) | `BuilderPageLoader.js` |

## Notes for Next Agent
- CMS cleanup is at task 97. Builder cleanup should start fresh.
- **Priority:** Consume the CMS auth handoff (P1) and create shared constants (P1) before tackling large file splits.
- Both repos share the same Firebase project — changes to Firestore rules or Cloud Functions affect both.
- Builder's `functions/index.js` should be split to match CMS's modular pattern.
- Consider a shared `@dappzy/constants` package for collection names, wallet types, URLs.
- CMS now has barrel exports for constants, hooks, and utils — Builder should adopt the same pattern.
