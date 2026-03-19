// ── Key Constants ──────────────────────────────────────────
export const STORAGE_KEYS = {
  // Session (sessionStorage)
  USER_ACCOUNT: 'userAccount',
  IS_LOGGED_IN: 'isLoggedIn',
  // Subscription (localStorage)
  SUBSCRIPTION_STATUS: 'subscriptionStatus',
  SUBSCRIPTION_END_DATE: 'subscriptionEndDate',
  // UI (localStorage)
  COLOR_SWATCHES: 'dappzy_saved_colors',
};

// ── Auth ───────────────────────────────────────────────────
export const authStorage = {
  getUserAccount: () => sessionStorage.getItem(STORAGE_KEYS.USER_ACCOUNT),
  setUserAccount: (value) => sessionStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, value),
  setLoggedIn: (value) => sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, value),
  clear: () => {
    sessionStorage.removeItem(STORAGE_KEYS.USER_ACCOUNT);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  },
};

// ── Subscription ───────────────────────────────────────────
export const subscriptionStorage = {
  getStatus: () => localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS),
  setStatus: (status) => localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, status),
  getEndDate: () => localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_END_DATE),
  setEndDate: (date) => {
    if (date) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_END_DATE, date);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_END_DATE);
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_END_DATE);
  },
};

// ── Project ────────────────────────────────────────────────
// Project data lives in Firestore only. This module provides an
// in-memory cache for website settings (so existing component reads
// still work) and a helper to wipe legacy localStorage keys.
let _websiteSettings = {};
let _legacyCleaned = false;

export const projectStorage = {
  getWebsiteSettings: () => _websiteSettings,
  setWebsiteSettings: (settings) => { _websiteSettings = settings || {}; },
  clearLegacyCache: () => {
    if (_legacyCleaned) return;
    _legacyCleaned = true;
    _websiteSettings = {};
    // Wipe all legacy localStorage keys from previous versions
    localStorage.removeItem('editableElements');
    localStorage.removeItem('elementsVersion');
    localStorage.removeItem('websiteSettings');
    const chunkCount = parseInt(localStorage.getItem('editableElements_chunks') || '0');
    for (let i = 0; i < chunkCount; i++) {
      localStorage.removeItem(`editableElements_chunk_${i}`);
    }
    localStorage.removeItem('editableElements_chunks');
    Object.keys(localStorage)
      .filter(k => k.startsWith('image-'))
      .forEach(k => localStorage.removeItem(k));
  },
};

// ── UI Preferences ─────────────────────────────────────────
export const uiStorage = {
  getColorSwatches: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOR_SWATCHES) || '[]');
    } catch {
      return [];
    }
  },
  setColorSwatches: (swatches) => {
    localStorage.setItem(STORAGE_KEYS.COLOR_SWATCHES, JSON.stringify(swatches));
  },
};
