import elementIconPaths from '../../../Mapping/elementIconPaths';

/** Core basic elements */
const BasicElements = [
  {
    type: 'button',
    label: 'Button',
    description: 'Create a button',
    icon: elementIconPaths.button,
    tags: ['cta', 'action', 'click', 'submit'],
  },
  {
    type: 'table',
    label: 'Table',
    description: 'A data table with rows and cells.',
    icon: elementIconPaths.table,
    tags: ['grid', 'data', 'spreadsheet', 'rows', 'columns'],
  },
  {
    type: 'list',
    label: 'List',
    description: 'A list element',
    icon: elementIconPaths.list,
    tags: ['ul', 'ol', 'items', 'bullet', 'ordered', 'unordered'],
  },
  {
    type: 'linkblock',
    label: 'LinkBlock',
    description: 'Create a LinkBlock',
    icon: elementIconPaths.linkblock,
    tags: ['link', 'anchor', 'href', 'url'],
  },
];

/** Interactive widgets: tabs, accordion, modal, carousel, tooltip, dropdown */
export const InteractiveElements = [
  {
    type: 'tabs',
    label: 'Tabs',
    description: 'Tabbed content with switchable panels.',
    icon: elementIconPaths.tabs,
    tags: ['tabbed', 'panels', 'sections'],
  },
  {
    type: 'accordion',
    label: 'Accordion',
    description: 'Collapsible content sections.',
    icon: elementIconPaths.accordion,
    tags: ['faq', 'expandable', 'collapsible', 'dropdown'],
  },
  {
    type: 'modal',
    label: 'Modal / Popup',
    description: 'A popup dialog with trigger button.',
    icon: elementIconPaths.modal,
    tags: ['popup', 'dialog', 'overlay', 'lightbox'],
  },
  {
    type: 'carousel',
    label: 'Carousel',
    description: 'A content slider with navigation.',
    icon: elementIconPaths.carousel,
    tags: ['slideshow', 'slides', 'gallery', 'swiper'],
  },
  {
    type: 'tooltip',
    label: 'Tooltip',
    description: 'Hover text with tooltip bubble.',
    icon: elementIconPaths.tooltip,
    tags: ['hover', 'hint', 'info', 'popover'],
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    description: 'A custom dropdown menu.',
    icon: elementIconPaths.dropdown,
    tags: ['select', 'menu', 'options'],
  },
];

/** Content display elements */
export const ContentElements = [
  {
    type: 'countdown',
    label: 'Countdown Timer',
    description: 'A countdown to a target date.',
    icon: elementIconPaths.countdown,
    tags: ['timer', 'clock', 'deadline', 'launch'],
  },
  {
    type: 'marquee',
    label: 'Marquee / Ticker',
    description: 'A horizontally scrolling text ticker.',
    icon: elementIconPaths.marquee,
    tags: ['ticker', 'scroll', 'announcement', 'news'],
  },
  {
    type: 'socialLinks',
    label: 'Social Links',
    description: 'A row of social media icon links.',
    icon: elementIconPaths.socialLinks,
    tags: ['social', 'twitter', 'facebook', 'instagram', 'links', 'icons'],
  },
  {
    type: 'rating',
    label: 'Star Rating',
    description: 'A star rating display or input element.',
    icon: elementIconPaths.rating,
    tags: ['stars', 'review', 'score', 'feedback'],
  },
  {
    type: 'alert',
    label: 'Alert Banner',
    description: 'A dismissible notification banner.',
    icon: elementIconPaths.alert,
    tags: ['banner', 'notification', 'warning', 'message', 'toast'],
  },
  {
    type: 'badge',
    label: 'Badge',
    description: 'A tag or label chip.',
    icon: elementIconPaths.badge,
    tags: ['tag', 'label', 'chip', 'pill'],
  },
  {
    type: 'progress',
    label: 'Progress Bar',
    description: 'A visual progress indicator.',
    icon: elementIconPaths.progress,
    tags: ['loading', 'bar', 'status', 'percentage'],
  },
];

/** Navigation helpers */
export const NavigationElements = [
  {
    type: 'breadcrumb',
    label: 'Breadcrumb',
    description: 'Navigation breadcrumb trail.',
    icon: elementIconPaths.breadcrumb,
    tags: ['navigation', 'trail', 'path'],
  },
  {
    type: 'backToTop',
    label: 'Back to Top',
    description: 'A scroll-to-top button.',
    icon: elementIconPaths.backToTop,
    tags: ['scroll', 'top', 'arrow', 'up'],
  },
  {
    type: 'pagination',
    label: 'Pagination',
    description: 'Page navigation with prev/next buttons.',
    icon: elementIconPaths.pagination,
    tags: ['pages', 'navigation', 'paging', 'next', 'previous'],
  },
  {
    type: 'anchor',
    label: 'Anchor Link',
    description: 'A hyperlink element.',
    icon: elementIconPaths.anchor,
    tags: ['link', 'href', 'url', 'hyperlink'],
  },
];

/** Utility / layout primitives */
export const UtilityElements = [
  {
    type: 'div',
    label: 'Div',
    description: 'A generic container element.',
    icon: elementIconPaths.div,
    tags: ['container', 'wrapper', 'box'],
  },
  {
    type: 'spacer',
    label: 'Spacer',
    description: 'Vertical spacing between elements.',
    icon: elementIconPaths.spacer,
    tags: ['gap', 'space', 'padding', 'margin'],
  },
  {
    type: 'separator',
    label: 'Separator',
    description: 'A styled divider line.',
    icon: elementIconPaths.separator,
    tags: ['divider', 'line', 'hr', 'rule'],
  },
  {
    type: 'line',
    label: 'Line',
    description: 'Create a line',
    icon: elementIconPaths.line,
    tags: ['divider', 'hr', 'rule', 'border'],
  },
  {
    type: 'hr',
    label: 'Horizontal Rule',
    description: 'A native HTML horizontal rule.',
    icon: elementIconPaths.line,
    tags: ['hr', 'divider', 'rule', 'horizontal'],
  },
  {
    type: 'codeInject',
    label: 'Custom Code',
    description: 'Inject custom HTML, CSS, and JS.',
    icon: elementIconPaths.codeInject,
    tags: ['custom', 'html', 'css', 'javascript', 'embed', 'script'],
  },
];

export default BasicElements;
