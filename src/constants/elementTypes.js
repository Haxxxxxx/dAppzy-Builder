// Canonical element type string constants used throughout the builder.
// Import from here instead of using raw strings to avoid typos and enable
// easy refactoring.

// Basic elements
export const PARAGRAPH = 'paragraph';
export const HEADING = 'heading';
export const SECTION = 'section';
export const DIV = 'div';
export const BUTTON = 'button';
export const SPAN = 'span';
export const IMAGE = 'image';
export const INPUT = 'input';
export const FORM = 'form';
export const LIST = 'list';
export const ANCHOR = 'anchor';
export const TEXTAREA = 'textarea';
export const SELECT = 'select';
export const LABEL = 'label';
export const CHECKBOX = 'checkbox';
export const RADIO = 'radio';
export const TOGGLE = 'toggle';
export const TABS = 'tabs';
export const ACCORDION = 'accordion';
export const DROPDOWN = 'dropdown';
export const FILE_UPLOAD = 'fileUpload';
export const DATE_PICKER = 'datePicker';
export const BREADCRUMB = 'breadcrumb';
export const MODAL = 'modal';
export const CAROUSEL = 'carousel';
export const TOOLTIP = 'tooltip';
export const SEARCH_BAR = 'searchBar';
export const BACK_TO_TOP = 'backToTop';
export const BLOCKQUOTE = 'blockquote';
export const CODE = 'code';
export const HR = 'hr';
export const TABLE = 'table';
export const TABLE_ROW = 'tableRow';
export const TABLE_CELL = 'tableCell';
export const LINE = 'line';
export const LINK_BLOCK = 'linkblock';
export const ICON = 'icon';
export const BADGE = 'badge';
export const PROGRESS = 'progress';
export const SPACER = 'spacer';
export const SEPARATOR = 'separator';
export const COUNTDOWN = 'countdown';
export const CODE_INJECT = 'codeInject';
export const SLIDER = 'slider';
export const RATING = 'rating';
export const LIGHTBOX = 'lightbox';
export const MARQUEE = 'marquee';
export const ALERT = 'alert';
export const PAGINATION = 'pagination';

// Media elements
export const VIDEO = 'video';
export const BG_VIDEO = 'bgVideo';
export const YOUTUBE_VIDEO = 'youtubeVideo';
export const AUDIO = 'audio';
export const IFRAME = 'iframe';
export const MAP_EMBED = 'mapEmbed';

// Social
export const SOCIAL_LINKS = 'socialLinks';

// Layout / section elements
export const NAVBAR = 'navbar';
export const HERO = 'hero';
export const FOOTER = 'footer';
export const CTA = 'cta';
export const CONTENT_SECTION = 'ContentSection';
export const CONTAINER = 'container';
export const GRID_LAYOUT = 'gridLayout';
export const HFLEX = 'hflex';
export const VFLEX = 'vflex';
export const HFLEX_LAYOUT = 'hflexLayout';
export const VFLEX_LAYOUT = 'vflexLayout';

// Web3 elements
export const CONNECT_WALLET_BUTTON = 'connectWalletButton';
export const DEFI_SECTION = 'defiSection';
export const DEFI_MODULE = 'defiModule';
export const MINTING_SECTION = 'mintingSection';
export const MINTING_MODULE = 'mintingModule';

// Alias — some code uses camelCase 'linkBlock', canonical is 'linkblock'
export const LINK_BLOCK_CAMEL = 'linkBlock';

// Layout types that require configuration
export const LAYOUT_TYPES = [
  NAVBAR,
  HERO,
  FOOTER,
  CTA,
  CONTENT_SECTION,
  DEFI_SECTION,
  MINTING_SECTION,
];

