// src/Mapping/elementIconPaths.js
// Maps element types to their sidebar icon SVGs.
// Convention: /img/icon-{type}.svg — DraggableElement uses this as override,
// falling back to the same convention if no icon prop is passed.

const elementIconPaths = {
  // Text Elements
  paragraph: '/img/icon-paragraph.svg',
  heading: '/img/icon-heading.svg',
  span: '/img/icon-span.svg',
  anchor: '/img/icon-anchor.svg',
  blockquote: '/img/icon-blockquote.svg',
  code: '/img/icon-code.svg',

  // Container / Structure Elements
  section: '/img/icon-section.svg',
  div: '/img/icon-div.svg',
  container: '/img/icon-container.svg',
  gridLayout: '/img/icon-gridLayout.svg',
  hflexLayout: '/img/icon-hflexLayout.svg',
  vflexLayout: '/img/icon-vflexLayout.svg',
  line: '/img/icon-line.svg',
  list: '/img/icon-list.svg',
  linkblock: '/img/icon-linkblock.svg',
  table: '/img/icon-table.svg',

  // Form Elements
  input: '/img/icon-input.svg',
  form: '/img/icon-form.svg',
  textarea: '/img/icon-textarea.svg',
  select: '/img/icon-select.svg',
  label: '/img/icon-label.svg',
  checkbox: '/img/icon-checkbox.svg',
  radio: '/img/icon-radio.svg',
  toggle: '/img/icon-toggle.svg',
  dropdown: '/img/icon-dropdown.svg',
  fileUpload: '/img/icon-fileUpload.svg',
  datePicker: '/img/icon-datePicker.svg',
  searchBar: '/img/icon-searchBar.svg',

  // Media Elements
  image: '/img/icon-image.svg',
  video: '/img/icon-video.svg',
  bgVideo: '/img/icon-bgVideo.svg',
  audio: '/img/icon-audio.svg',
  iframe: '/img/icon-iframe.svg',
  icon: '/img/icon-icon.svg',
  youtubeVideo: '/img/icon-youtubeVideo.svg',

  // Interactive Elements
  button: '/img/icon-button.svg',
  badge: '/img/icon-badge.svg',
  progress: '/img/icon-progress.svg',
  spacer: '/img/icon-spacer.svg',
  separator: '/img/icon-separator.svg',
  tabs: '/img/icon-tabs.svg',
  accordion: '/img/icon-accordion.svg',
  modal: '/img/icon-modal.svg',
  carousel: '/img/icon-carousel.svg',
  tooltip: '/img/icon-tooltip.svg',
  breadcrumb: '/img/icon-breadcrumb.svg',
  backToTop: '/img/icon-backToTop.svg',
  countdown: '/img/icon-countdown.svg',
  codeInject: '/img/icon-codeInject.svg',
  mapEmbed: '/img/icon-mapEmbed.svg',
  socialLinks: '/img/icon-socialLinks.svg',
  slider: '/img/icon-slider.svg',
  rating: '/img/icon-rating.svg',
  lightbox: '/img/icon-lightbox.svg',
  marquee: '/img/icon-marquee.svg',
  alert: '/img/icon-alert.svg',
  pagination: '/img/icon-pagination.svg',

  // Web3 Elements
  connectWalletButton: '/img/icon-connectWalletButton.svg',
};

export default elementIconPaths;
