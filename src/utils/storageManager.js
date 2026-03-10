// ── Key Constants ──────────────────────────────────────────
export const STORAGE_KEYS = {
  // Session (sessionStorage)
  USER_ACCOUNT: 'userAccount',
  IS_LOGGED_IN: 'isLoggedIn',
  // Subscription (localStorage)
  SUBSCRIPTION_STATUS: 'subscriptionStatus',
  SUBSCRIPTION_END_DATE: 'subscriptionEndDate',
  // Project data (localStorage)
  ELEMENTS: 'editableElements',
  ELEMENTS_VERSION: 'elementsVersion',
  ELEMENTS_CHUNKS: 'editableElements_chunks',
  WEBSITE_SETTINGS: 'websiteSettings',
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
export const projectStorage = {
  getWebsiteSettings: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS) || '{}');
    } catch {
      return {};
    }
  },
  setWebsiteSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(settings));
  },
  getElementsVersion: () => localStorage.getItem(STORAGE_KEYS.ELEMENTS_VERSION),
  setElementsVersion: (version) => localStorage.setItem(STORAGE_KEYS.ELEMENTS_VERSION, version),
  clearProject: () => {
    localStorage.removeItem(STORAGE_KEYS.ELEMENTS);
    localStorage.removeItem(STORAGE_KEYS.ELEMENTS_VERSION);
    localStorage.removeItem(STORAGE_KEYS.WEBSITE_SETTINGS);
  },
  // Chunk helpers
  getChunkCount: () => parseInt(localStorage.getItem(STORAGE_KEYS.ELEMENTS_CHUNKS) || '0'),
  getChunk: (index) => localStorage.getItem(`editableElements_chunk_${index}`),
  setChunk: (key, value) => localStorage.setItem(key, value),
  removeChunk: (key) => localStorage.removeItem(key),
  clearChunks: (count) => {
    for (let i = 0; i < count; i++) {
      localStorage.removeItem(`editableElements_chunk_${i}`);
    }
    localStorage.removeItem(STORAGE_KEYS.ELEMENTS_CHUNKS);
  },
  getElements: () => localStorage.getItem(STORAGE_KEYS.ELEMENTS),
  removeElements: () => localStorage.removeItem(STORAGE_KEYS.ELEMENTS),
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
