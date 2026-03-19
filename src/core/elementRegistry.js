/**
 * Centralized element & section type registry.
 *
 * Every element/section type is defined ONCE here with its metadata.
 * All consumer files (SideBar, EditorPanel, withSelectable, UnifiedDropZone,
 * ContentList) import derived Sets instead of maintaining their own.
 *
 * To add a new element:
 *   1. Add a constant to constants/elementTypes.js
 *   2. Add an entry here with its metadata
 *   3. Add a componentMap entry in RenderUtils.js
 *   4. (Optional) Add a drag source in the appropriate ElementsMapping panel
 *   Done — all Sets update automatically.
 */

import * as T from '../constants/elementTypes';
import { registryByConfig, SECTION_CATEGORIES } from '../configs/sectionRegistry';

// ── Registry ──────────────────────────────────────────────────────
//
// editorGroup      'container' | 'text' | 'media' | 'none'
//                  → which style editors to show in EditorPanel
// sidebarCategory  'textual' | 'form' | 'video' | 'image' | 'icon' |
//                  'youtube' | 'table' | 'list' | 'defi' | 'structural'
//                  → which content-tab panel to render in SideBar
// isInline         boolean → withSelectable uses inline-block sizing
// isSection        boolean → top-level section handled in ContentList handleDrop
// isLink           boolean → SideBar LINK_TYPES
// acceptInDrop     boolean → included in UnifiedDropZone accept list

const registry = {
  // ── Text / Content ──────────────────────────────────────────────
  [T.PARAGRAPH]:   { editorGroup: 'text',      sidebarCategory: 'textual', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.HEADING]:     { editorGroup: 'text',      sidebarCategory: 'textual', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.BLOCKQUOTE]:  { editorGroup: 'text',      sidebarCategory: 'textual', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.CODE]:        { editorGroup: 'text',      sidebarCategory: 'textual', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.SPAN]:        { editorGroup: 'text',      sidebarCategory: 'textual', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.BADGE]:       { editorGroup: 'text',      sidebarCategory: 'textual', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.LABEL]:       { editorGroup: 'text',      sidebarCategory: 'textual', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },

  // ── Links / Buttons ─────────────────────────────────────────────
  [T.ANCHOR]:          { editorGroup: 'text', sidebarCategory: 'textual', isInline: true,  isSection: false, isLink: true,  acceptInDrop: true },
  [T.LINK_BLOCK]:      { editorGroup: 'text', sidebarCategory: 'textual', isInline: false, isSection: false, isLink: true,  acceptInDrop: true },
  [T.LINK_BLOCK_CAMEL]:{ editorGroup: 'text', sidebarCategory: 'textual', isInline: false, isSection: false, isLink: true,  acceptInDrop: true },
  [T.BUTTON]:          { editorGroup: 'text', sidebarCategory: 'textual', isInline: true,  isSection: false, isLink: true,  acceptInDrop: true },

  // ── Web3 inline ─────────────────────────────────────────────────
  [T.CONNECT_WALLET_BUTTON]: { editorGroup: 'text', sidebarCategory: 'textual', isInline: true, isSection: false, isLink: false, acceptInDrop: true },

  // ── Form ────────────────────────────────────────────────────────
  [T.FORM]:     { editorGroup: 'container', sidebarCategory: 'form', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.INPUT]:    { editorGroup: 'text',      sidebarCategory: 'form', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.TEXTAREA]: { editorGroup: 'text',      sidebarCategory: 'form', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.SELECT]:   { editorGroup: 'text',      sidebarCategory: 'form', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.CHECKBOX]: { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.RADIO]:    { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.TOGGLE]:   { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },

  // ── Interactive ───────────────────────────────────────────────
  [T.TABS]:        { editorGroup: 'container', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.ACCORDION]:   { editorGroup: 'container', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.DROPDOWN]:    { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.FILE_UPLOAD]: { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.DATE_PICKER]: { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.BREADCRUMB]:  { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.MODAL]:       { editorGroup: 'container', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.CAROUSEL]:    { editorGroup: 'container', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.TOOLTIP]:     { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.SEARCH_BAR]:  { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.BACK_TO_TOP]: { editorGroup: 'none',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },

  // ── Media ───────────────────────────────────────────────────────
  [T.IMAGE]:         { editorGroup: 'media', sidebarCategory: 'image',   isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.VIDEO]:         { editorGroup: 'media', sidebarCategory: 'video',   isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.BG_VIDEO]:      { editorGroup: 'media', sidebarCategory: 'video',   isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.AUDIO]:         { editorGroup: 'media', sidebarCategory: 'video',   isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.YOUTUBE_VIDEO]: { editorGroup: 'media', sidebarCategory: 'youtube', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.ICON]:          { editorGroup: 'media', sidebarCategory: 'icon',    isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.IFRAME]:        { editorGroup: 'media', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.MAP_EMBED]:     { editorGroup: 'media', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },

  // ── Table ───────────────────────────────────────────────────────
  [T.TABLE]:      { editorGroup: 'container', sidebarCategory: 'table', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.TABLE_ROW]:  { editorGroup: 'container', sidebarCategory: 'table', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.TABLE_CELL]: { editorGroup: 'container', sidebarCategory: 'table', isInline: false, isSection: false, isLink: false, acceptInDrop: true },

  // ── List ────────────────────────────────────────────────────────
  [T.LIST]: { editorGroup: 'container', sidebarCategory: 'list', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  'list-item': { editorGroup: 'text', sidebarCategory: 'textual', isInline: false, isSection: false, isLink: false, acceptInDrop: false },

  // ── Layout / Structure ──────────────────────────────────────────
  [T.DIV]:          { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.SECTION]:      { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.CONTAINER]:    { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.GRID_LAYOUT]:  { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.HFLEX]:        { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.VFLEX]:        { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.HFLEX_LAYOUT]: { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.VFLEX_LAYOUT]: { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.HR]:           { editorGroup: 'none',      sidebarCategory: 'structural', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.LINE]:         { editorGroup: 'none',      sidebarCategory: 'structural', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.SPACER]:       { editorGroup: 'none',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.SEPARATOR]:    { editorGroup: 'none',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.PROGRESS]:     { editorGroup: 'none',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.COUNTDOWN]:    { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.CODE_INJECT]:  { editorGroup: 'none',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.SOCIAL_LINKS]: { editorGroup: 'container', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.SLIDER]:       { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.RATING]:       { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: true,  isSection: false, isLink: false, acceptInDrop: true },
  [T.LIGHTBOX]:     { editorGroup: 'container', sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.MARQUEE]:      { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.ALERT]:        { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.PAGINATION]:   { editorGroup: 'text',      sidebarCategory: 'interactive', isInline: false, isSection: false, isLink: false, acceptInDrop: true },

  // ── Sections (top-level) ────────────────────────────────────────
  [T.NAVBAR]:          { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: true, isLink: false, acceptInDrop: true },
  [T.HERO]:            { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: true, isLink: false, acceptInDrop: true },
  [T.FOOTER]:          { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: true, isLink: false, acceptInDrop: true },
  [T.CTA]:             { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: true, isLink: false, acceptInDrop: true },
  [T.CONTENT_SECTION]: { editorGroup: 'container', sidebarCategory: 'structural', isInline: false, isSection: true, isLink: false, acceptInDrop: true },

  // ── Web3 sections / modules ─────────────────────────────────────
  [T.DEFI_SECTION]:    { editorGroup: 'container', sidebarCategory: 'defi', isInline: false, isSection: true,  isLink: false, acceptInDrop: true },
  [T.DEFI_MODULE]:     { editorGroup: 'container', sidebarCategory: 'defi', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
  [T.MINTING_SECTION]: { editorGroup: 'container', sidebarCategory: 'defi', isInline: false, isSection: true,  isLink: false, acceptInDrop: true },
  [T.MINTING_MODULE]:  { editorGroup: 'container', sidebarCategory: 'defi', isInline: false, isSection: false, isLink: false, acceptInDrop: true },
};

// ── Derived Sets (computed once at import) ────────────────────────

const typesWhere = (predicate) =>
  new Set(Object.entries(registry).filter(([, m]) => predicate(m)).map(([type]) => type));

// EditorPanel groups
export const CONTAINER_TYPES = typesWhere(m => m.editorGroup === 'container');
export const TEXT_TYPES      = typesWhere(m => m.editorGroup === 'text');
export const MEDIA_TYPES     = typesWhere(m => m.editorGroup === 'media');

// SideBar categories
export const TEXTUAL_TYPES = typesWhere(m => m.sidebarCategory === 'textual');
export const LINK_TYPES    = typesWhere(m => m.isLink === true);
export const FORM_TYPES    = typesWhere(m => m.sidebarCategory === 'form');
export const LIST_TYPES    = typesWhere(m => m.sidebarCategory === 'list');
export const VIDEO_TYPES   = typesWhere(m => m.sidebarCategory === 'video');
export const TABLE_TYPES   = typesWhere(m => m.sidebarCategory === 'table');
// withSelectable
export const INLINE_TYPES = typesWhere(m => m.isInline === true);

// ContentList / handleDrop — section types that get full structure creation
export const SECTION_TYPES = typesWhere(m => m.isSection === true);

// UnifiedDropZone accept list — all droppable types + 'ELEMENT' for section draggables
export const ALL_DROPPABLE_TYPES = [
  ...typesWhere(m => m.acceptInDrop === true),
  'ELEMENT',
  'savedBlock',
];

// ── Section popup metadata (derived from sectionRegistry) ────────

const POPUP_CATEGORY_MAP = {
  [SECTION_CATEGORIES.NAVBAR]: 'Navbar',
  [SECTION_CATEGORIES.HERO]: 'Hero',
  [SECTION_CATEGORIES.CTA]: 'CTA',
  [SECTION_CATEGORIES.CONTENT]: 'Content',
  [SECTION_CATEGORIES.WEB3]: 'Web3',
  [SECTION_CATEGORIES.FOOTER]: 'Footer',
};

export const sectionPopupConfigs = Object.fromEntries(
  Object.entries(registryByConfig).map(([key, entry]) => [
    key,
    {
      name: entry.label,
      previewImage: entry.imgSrc,
      category: POPUP_CATEGORY_MAP[entry.category] || entry.category,
      resolvedType: entry.type,
    },
  ])
);

export const SECTION_POPUP_CATEGORIES = ['All', ...Object.values(POPUP_CATEGORY_MAP)];

// ── Helpers ───────────────────────────────────────────────────────

export const getMeta    = (type) => registry[type];
export const isTextual  = (el) => el?.type && TEXTUAL_TYPES.has(el.type);

/** Resolve the canonical element type for a structureConfigurations key.
 *  e.g. 'heroTwo' → 'hero', 'sectionFive' → 'ContentSection' */
export const resolveConfigType = (configKey) =>
  sectionPopupConfigs[configKey]?.resolvedType || T.CONTENT_SECTION;

export default registry;
