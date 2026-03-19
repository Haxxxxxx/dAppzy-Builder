import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use real escape utilities so the rendered output is realistic
vi.mock('../export/escapeUtils', () => ({
  escapeHtml: vi.fn((str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }),
  escapeAttr: vi.fn((str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }),
  sanitizeStyleValue: vi.fn((val) => {
    if (!val || typeof val !== 'string') return '';
    if (val.includes('<') || val.includes('>')) return '';
    return val;
  }),
  camelToKebab: vi.fn((str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }),
}));

import { renderElementToHtml, buildAttributesString } from '../htmlRender';

/** Helper to build a minimal element object */
function el(overrides = {}) {
  return {
    id: 'test-1',
    type: 'div',
    content: '',
    styles: {},
    children: [],
    attributes: {},
    dataAttributes: {},
    events: {},
    configuration: {},
    settings: {},
    ...overrides,
  };
}

describe('renderElementToHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Basic element types ──────────────────────────────────────────

  describe('basic element types', () => {
    it('renders a paragraph as <p>', () => {
      const html = renderElementToHtml(el({ type: 'paragraph', content: 'Hello world' }));
      expect(html).toMatch(/^<p[^>]*>.*<\/p>$/);
      expect(html).toContain('Hello world');
    });

    it('renders a heading as <h3>', () => {
      const html = renderElementToHtml(el({ type: 'heading', content: 'Title' }));
      expect(html).toMatch(/<h3[^>]*>/);
      expect(html).toContain('Title');
    });

    it('renders a button as <button>', () => {
      const html = renderElementToHtml(el({ type: 'button', content: 'Click me' }));
      expect(html).toMatch(/<button[^>]*>/);
      expect(html).toContain('Click me');
      expect(html).toContain('type="button"');
    });

    it('renders a span as <span>', () => {
      const html = renderElementToHtml(el({ type: 'span', content: 'inline text' }));
      expect(html).toMatch(/<span[^>]*>/);
      expect(html).toContain('inline text');
    });

    it('renders a div element', () => {
      const html = renderElementToHtml(el({ type: 'div', content: 'content' }));
      expect(html).toMatch(/<div[^>]*>.*<\/div>$/);
    });

    it('renders a section element', () => {
      const html = renderElementToHtml(el({ type: 'section' }));
      expect(html).toMatch(/<section[^>]*>/);
    });

    it('renders hr as self-closing', () => {
      const html = renderElementToHtml(el({ type: 'line' }));
      expect(html).toMatch(/<hr[^>]*\/>/);
    });

    it('renders blockquote', () => {
      const html = renderElementToHtml(el({ type: 'blockquote', content: 'A quote' }));
      expect(html).toMatch(/<blockquote[^>]*>/);
      expect(html).toContain('A quote');
    });
  });

  // ── Image handling ───────────────────────────────────────────────

  describe('image elements', () => {
    it('renders an image with src and loading="lazy"', () => {
      const html = renderElementToHtml(el({ type: 'image', src: 'https://example.com/photo.jpg' }));
      expect(html).toMatch(/<img[^>]*>/);
      expect(html).toContain('src="https://example.com/photo.jpg"');
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('decoding="async"');
    });

    it('uses content as fallback src for image', () => {
      const html = renderElementToHtml(el({ type: 'image', content: 'https://example.com/fallback.jpg' }));
      expect(html).toContain('src="https://example.com/fallback.jpg"');
    });

    it('returns empty string for image without src', () => {
      const html = renderElementToHtml(el({ type: 'image', src: '', content: '' }));
      expect(html).toBe('');
    });

    it('includes alt attribute for accessibility', () => {
      const html = renderElementToHtml(el({
        type: 'image',
        src: 'https://example.com/photo.jpg',
        alt: 'A nice photo',
      }));
      expect(html).toContain('alt="A nice photo"');
    });
  });

  // ── Hidden elements ──────────────────────────────────────────────

  describe('hidden elements', () => {
    it('returns empty string when configuration.hidden is true', () => {
      const html = renderElementToHtml(el({ configuration: { hidden: true } }));
      expect(html).toBe('');
    });

    it('returns empty string when settings.hidden is true', () => {
      const html = renderElementToHtml(el({ settings: { hidden: true } }));
      expect(html).toBe('');
    });

    it('renders normally when hidden is false', () => {
      const html = renderElementToHtml(el({ configuration: { hidden: false }, content: 'visible' }));
      expect(html).not.toBe('');
    });

    it('returns empty string for null element', () => {
      const html = renderElementToHtml(null);
      expect(html).toBe('');
    });
  });

  // ── Rich text vs plain text ──────────────────────────────────────

  describe('text content rendering', () => {
    it('outputs sanitized HTML for rich text in paragraph', () => {
      const html = renderElementToHtml(el({
        type: 'paragraph',
        content: 'Hello <b>bold</b> world',
      }));
      // Rich text is sanitized but keeps safe tags
      expect(html).toContain('<b>bold</b>');
    });

    it('escapes plain text content in paragraph', () => {
      const html = renderElementToHtml(el({
        type: 'paragraph',
        content: 'No tags here',
      }));
      expect(html).toContain('No tags here');
    });

    it('escapes angle brackets in non-rich-text element types', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        content: '<script>alert(1)</script>',
      }));
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });
  });

  // ── Scroll animation ─────────────────────────────────────────────

  describe('scroll animation attributes', () => {
    it('adds data-scroll-animation when scrollAnimation is set', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        scrollAnimation: { type: 'fadeIn', duration: 800, delay: 200, once: true },
      }));
      expect(html).toContain('data-scroll-animation="fadeIn"');
      expect(html).toContain('data-scroll-duration="800"');
      expect(html).toContain('data-scroll-delay="200"');
      expect(html).toContain('data-scroll-once="true"');
    });

    it('does not add scroll attributes when type is none', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        scrollAnimation: { type: 'none' },
      }));
      expect(html).not.toContain('data-scroll-animation');
    });

    it('does not add scroll attributes when scrollAnimation is absent', () => {
      const html = renderElementToHtml(el({ type: 'div' }));
      expect(html).not.toContain('data-scroll-animation');
    });
  });

  // ── Carousel ─────────────────────────────────────────────────────

  describe('carousel', () => {
    it('renders prev/next buttons with data-action', () => {
      const slides = [
        { text: 'Slide 1' },
        { text: 'Slide 2' },
      ];
      const html = renderElementToHtml(el({
        type: 'carousel',
        content: JSON.stringify(slides),
      }));
      expect(html).toContain('data-action="carousel-prev"');
      expect(html).toContain('data-action="carousel-next"');
      expect(html).toContain('data-carousel');
      expect(html).toContain('data-slide-count="2"');
      expect(html).toContain('Slide 1');
    });

    it('renders first slide visible and others hidden', () => {
      const slides = [{ text: 'A' }, { text: 'B' }];
      const html = renderElementToHtml(el({
        type: 'carousel',
        content: JSON.stringify(slides),
      }));
      expect(html).toContain('data-slide="0" aria-hidden="false"');
      expect(html).toContain('data-slide="1" aria-hidden="true"');
    });
  });

  // ── Modal ────────────────────────────────────────────────────────

  describe('modal', () => {
    it('renders trigger button and hidden overlay with role="dialog"', () => {
      const data = { triggerText: 'Open Modal', title: 'My Modal', body: 'Modal content' };
      const html = renderElementToHtml(el({
        type: 'modal',
        content: JSON.stringify(data),
      }));
      expect(html).toContain('data-action="open-modal"');
      expect(html).toContain('Open Modal');
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('My Modal');
      expect(html).toContain('Modal content');
      expect(html).toContain('display:none');
    });
  });

  // ── Tabs ─────────────────────────────────────────────────────────

  describe('tabs', () => {
    it('renders with role="tablist" and role="tab"', () => {
      const tabs = [
        { label: 'Tab 1', body: 'Content 1' },
        { label: 'Tab 2', body: 'Content 2' },
      ];
      const html = renderElementToHtml(el({
        type: 'tabs',
        content: JSON.stringify(tabs),
      }));
      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('role="tabpanel"');
      expect(html).toContain('Tab 1');
      expect(html).toContain('Content 1');
      expect(html).toContain('data-action="switch-tab"');
    });

    it('first tab is selected, others are not', () => {
      const tabs = [
        { label: 'A', body: 'Body A' },
        { label: 'B', body: 'Body B' },
      ];
      const html = renderElementToHtml(el({
        type: 'tabs',
        content: JSON.stringify(tabs),
      }));
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain('aria-selected="false"');
    });
  });

  // ── Accordion ────────────────────────────────────────────────────

  describe('accordion', () => {
    it('renders <details> elements', () => {
      const items = [
        { title: 'Question 1', body: 'Answer 1' },
        { title: 'Question 2', body: 'Answer 2' },
      ];
      const html = renderElementToHtml(el({
        type: 'accordion',
        content: JSON.stringify(items),
      }));
      expect(html).toContain('<details');
      expect(html).toContain('<summary');
      expect(html).toContain('Question 1');
      expect(html).toContain('Answer 1');
    });

    it('opens the first item by default', () => {
      const items = [
        { title: 'Q1', body: 'A1' },
        { title: 'Q2', body: 'A2' },
      ];
      const html = renderElementToHtml(el({
        type: 'accordion',
        content: JSON.stringify(items),
      }));
      // First details has open attribute, second does not
      const detailsTags = html.match(/<details[^>]*>/g);
      expect(detailsTags[0]).toContain('open');
      expect(detailsTags[1]).not.toContain('open');
    });
  });

  // ── Social links ─────────────────────────────────────────────────

  describe('social links', () => {
    it('renders SVG icons in <a> tags', () => {
      const data = {
        links: [
          { platform: 'twitter', url: 'https://twitter.com/test' },
          { platform: 'github', url: 'https://github.com/test' },
        ],
      };
      const html = renderElementToHtml(el({
        type: 'socialLinks',
        content: JSON.stringify(data),
      }));
      expect(html).toContain('<a href="https://twitter.com/test"');
      expect(html).toContain('<svg');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('aria-label="twitter"');
      expect(html).toContain('aria-label="github"');
    });
  });

  // ── Countdown ────────────────────────────────────────────────────

  describe('countdown', () => {
    it('renders with data-countdown attribute', () => {
      const data = { targetDate: '2030-01-01T00:00:00', label: 'Launch', showLabels: true };
      const html = renderElementToHtml(el({
        type: 'countdown',
        content: JSON.stringify(data),
      }));
      expect(html).toContain('data-countdown="2030-01-01T00:00:00"');
      expect(html).toContain('data-countdown-unit="days"');
      expect(html).toContain('data-countdown-unit="hours"');
      expect(html).toContain('data-countdown-unit="minutes"');
      expect(html).toContain('data-countdown-unit="seconds"');
      expect(html).toContain('Launch');
    });
  });

  // ── Alert ────────────────────────────────────────────────────────

  describe('alert', () => {
    it('renders with data-alert and variant colors', () => {
      const data = { message: 'Watch out!', variant: 'warning', dismissible: true };
      const html = renderElementToHtml(el({
        type: 'alert',
        content: JSON.stringify(data),
      }));
      expect(html).toContain('data-alert');
      expect(html).toContain('Watch out!');
      // Warning variant uses #f59e0b border
      expect(html).toContain('#f59e0b');
      expect(html).toContain('data-action="dismiss-alert"');
    });

    it('renders info variant by default', () => {
      const data = { message: 'FYI' };
      const html = renderElementToHtml(el({
        type: 'alert',
        content: JSON.stringify(data),
      }));
      // Info variant uses blue border
      expect(html).toContain('#3b82f6');
    });

    it('omits dismiss button when dismissible is false', () => {
      const data = { message: 'Permanent', variant: 'error', dismissible: false };
      const html = renderElementToHtml(el({
        type: 'alert',
        content: JSON.stringify(data),
      }));
      expect(html).not.toContain('data-action="dismiss-alert"');
    });
  });

  // ── Slider ───────────────────────────────────────────────────────

  describe('slider', () => {
    it('renders <input type="range"> with data-slider', () => {
      const data = { label: 'Volume', min: 0, max: 100, step: 5, value: 50, showValue: true };
      const html = renderElementToHtml(el({
        type: 'slider',
        content: JSON.stringify(data),
      }));
      expect(html).toContain('type="range"');
      expect(html).toContain('data-slider');
      expect(html).toContain('min="0"');
      expect(html).toContain('max="100"');
      expect(html).toContain('step="5"');
      expect(html).toContain('value="50"');
      expect(html).toContain('Volume');
    });
  });

  // ── BackToTop ────────────────────────────────────────────────────
  // Note: backToTop maps to tag 'button' in tagMap. The generic `tag === 'button'`
  // handler fires before the type-specific handler, so it renders as a normal button.
  // The type-specific handler (with position:fixed, data-action="scroll-top") is
  // unreachable in the current code order — this test documents actual behavior.

  describe('backToTop', () => {
    it('renders as a <button> with type="button"', () => {
      const html = renderElementToHtml(el({ type: 'backToTop' }));
      expect(html).toContain('<button');
      expect(html).toContain('type="button"');
    });
  });

  // ── Custom class ─────────────────────────────────────────────────

  describe('className', () => {
    it('applies className as class attribute', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        className: 'my-custom-class',
      }));
      expect(html).toContain('class="');
      expect(html).toContain('my-custom-class');
    });
  });

  // ── Non-CSS metadata filtered ────────────────────────────────────

  describe('style filtering', () => {
    it('does not include backgroundType in inline styles', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        styles: { color: 'red', backgroundType: 'gradient' },
      }));
      expect(html).toContain('color: red');
      expect(html).not.toContain('background-type');
      expect(html).not.toContain('backgroundType');
    });

    it('does not include tooltipPosition in inline styles', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        styles: { padding: '10px', tooltipPosition: 'top' },
      }));
      expect(html).not.toContain('tooltip-position');
      expect(html).not.toContain('tooltipPosition');
    });

    it('does not include allowMultiple in inline styles', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        styles: { margin: '5px', allowMultiple: true },
      }));
      expect(html).not.toContain('allow-multiple');
    });
  });

  // ── Anchor default href ──────────────────────────────────────────

  describe('anchor element', () => {
    it('defaults to href="#" when no href or targetValue is set', () => {
      const html = renderElementToHtml(el({
        type: 'anchor',
        content: 'Click here',
      }));
      expect(html).toContain('<a');
      expect(html).toContain('href="#"');
    });

    it('uses the provided href', () => {
      const html = renderElementToHtml(el({
        type: 'anchor',
        content: 'Go',
        href: 'https://example.com',
      }));
      expect(html).toContain('href="https://example.com"');
    });

    it('uses settings.targetValue as href', () => {
      const html = renderElementToHtml(el({
        type: 'anchor',
        content: 'Go',
        settings: { targetValue: 'https://example.com/page' },
      }));
      expect(html).toContain('href="https://example.com/page"');
    });

    it('adds target="_blank" when openInNewTab is set', () => {
      const html = renderElementToHtml(el({
        type: 'anchor',
        content: 'External',
        settings: { targetValue: 'https://example.com', openInNewTab: true },
      }));
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });
  });

  // ── Video element ────────────────────────────────────────────────

  describe('video element', () => {
    it('renders a <video> tag with controls', () => {
      const html = renderElementToHtml(el({
        type: 'video',
        styles: { src: 'https://example.com/video.mp4', controls: true },
      }));
      expect(html).toMatch(/<video[^>]*>/);
      expect(html).toContain('controls');
      expect(html).toContain('src="https://example.com/video.mp4"');
    });

    it('adds muted when autoplay is enabled', () => {
      const html = renderElementToHtml(el({
        type: 'video',
        styles: { src: 'test.mp4', autoplay: true },
      }));
      expect(html).toContain('autoplay');
      expect(html).toContain('muted');
      expect(html).toContain('playsinline');
    });
  });

  // ── Form elements ────────────────────────────────────────────────

  describe('form elements', () => {
    it('renders input with type and placeholder', () => {
      const html = renderElementToHtml(el({
        type: 'input',
        attributes: { type: 'email', placeholder: 'Enter email' },
      }));
      expect(html).toMatch(/<input[^>]*\/>/);
      expect(html).toContain('type="email"');
      expect(html).toContain('placeholder="Enter email"');
    });

    it('renders textarea', () => {
      const html = renderElementToHtml(el({
        type: 'textarea',
        content: 'Initial text',
        settings: { placeholder: 'Type here...' },
      }));
      expect(html).toMatch(/<textarea[^>]*>/);
      expect(html).toContain('placeholder="Type here..."');
      expect(html).toContain('Initial text');
    });

    it('renders select with children', () => {
      const child1 = el({ type: 'option', content: 'Option A', value: 'a' });
      const child2 = el({ type: 'option', content: 'Option B', value: 'b' });
      const html = renderElementToHtml(el({
        type: 'select',
        children: [child1, child2],
      }));
      expect(html).toMatch(/<select[^>]*>/);
      expect(html).toContain('<option');
    });

    it('renders form with data-dappzy-form marker', () => {
      const html = renderElementToHtml(el({
        type: 'form',
        settings: { action: '/submit', method: 'POST' },
      }));
      expect(html).toContain('<form');
      expect(html).toContain('data-dappzy-form');
      expect(html).toContain('action="/submit"');
      expect(html).toContain('method="POST"');
    });
  });

  // ── Footer ───────────────────────────────────────────────────────

  describe('footer element', () => {
    it('renders with role="contentinfo"', () => {
      const html = renderElementToHtml(el({ type: 'footer', content: 'Copyright' }));
      expect(html).toContain('<footer');
      expect(html).toContain('role="contentinfo"');
    });
  });

  // ── Web3 elements ────────────────────────────────────────────────

  describe('web3 elements', () => {
    it('renders connect wallet button with data-wallet-connect', () => {
      const html = renderElementToHtml(el({ type: 'connectWalletButton', content: 'Connect' }));
      expect(html).toContain('<button');
      expect(html).toContain('data-wallet-connect');
      expect(html).toContain('Connect');
    });

    it('uses default text when content is empty', () => {
      const html = renderElementToHtml(el({ type: 'connectWalletButton', content: '' }));
      expect(html).toContain('Connect Wallet');
    });
  });

  // ── List ─────────────────────────────────────────────────────────

  describe('list element', () => {
    it('renders as <ul> by default', () => {
      const html = renderElementToHtml(el({
        type: 'list',
        children: [el({ type: 'list-item', content: 'Item 1' })],
      }));
      expect(html).toMatch(/<ul[^>]*>/);
      expect(html).toContain('<li');
    });

    it('renders as <ol> when listType is ol', () => {
      const html = renderElementToHtml(el({
        type: 'list',
        configuration: { listType: 'ol' },
        children: [el({ type: 'list-item', content: 'First' })],
      }));
      expect(html).toMatch(/<ol[^>]*>/);
    });
  });

  // ── Checkbox, Radio, Toggle ──────────────────────────────────────
  // Note: checkbox, radio, toggle all map to tag 'label' in tagMap.
  // The generic `tag === 'label'` handler fires before their type-specific
  // handlers, so they render as plain <label> elements. This tests actual behavior.

  describe('form control elements', () => {
    it('renders checkbox as <label>', () => {
      const html = renderElementToHtml(el({ type: 'checkbox', content: 'Accept terms' }));
      expect(html).toContain('<label');
      expect(html).toContain('Accept terms');
    });

    it('renders radio as <label>', () => {
      const html = renderElementToHtml(el({ type: 'radio', content: 'Option A' }));
      expect(html).toContain('<label');
      expect(html).toContain('Option A');
    });

    it('renders toggle as <label>', () => {
      const html = renderElementToHtml(el({ type: 'toggle', content: 'Dark mode' }));
      expect(html).toContain('<label');
      expect(html).toContain('Dark mode');
    });
  });

  // ── DeFi/Minting modules ────────────────────────────────────────

  describe('defi and minting modules', () => {
    it('renders defiModule with title and description', () => {
      const content = JSON.stringify({
        title: 'Swap',
        description: 'Token swap module',
        stats: [{ label: 'TVL', value: '$1M' }],
        settings: { showStats: true, showButton: true },
      });
      const html = renderElementToHtml(el({
        type: 'defiModule',
        content,
        moduleType: 'aggregator',
      }));
      expect(html).toContain('defi-module');
      expect(html).toContain('Swap');
      expect(html).toContain('Token swap module');
      expect(html).toContain('TVL');
      expect(html).toContain('data-wallet-connect');
    });

    it('skips disabled defiModule', () => {
      const content = JSON.stringify({ enabled: false });
      const html = renderElementToHtml(el({ type: 'defiModule', content }));
      expect(html).toBe('');
    });

    it('renders mintingModule with title', () => {
      const content = JSON.stringify({
        title: 'Mint NFT',
        description: 'Mint your collectible',
        stats: [],
        settings: { showButton: true },
      });
      const html = renderElementToHtml(el({
        type: 'mintingModule',
        content,
        moduleType: 'minting',
      }));
      expect(html).toContain('minting-module');
      expect(html).toContain('Mint NFT');
      expect(html).toContain('data-wallet-connect');
    });

    it('skips disabled mintingModule', () => {
      const content = JSON.stringify({ enabled: false });
      const html = renderElementToHtml(el({ type: 'mintingModule', content }));
      expect(html).toBe('');
    });
  });

  // ── Spacer and Separator ─────────────────────────────────────────

  describe('spacer and separator', () => {
    it('renders spacer as <div>', () => {
      const html = renderElementToHtml(el({ type: 'spacer', styles: { height: '40px' } }));
      expect(html).toMatch(/<div[^>]*>/);
    });

    it('renders separator as <hr>', () => {
      const html = renderElementToHtml(el({ type: 'separator' }));
      expect(html).toMatch(/<hr[^>]*\/>/);
    });
  });

  // ── Badge ────────────────────────────────────────────────────────

  describe('badge', () => {
    it('renders badge as <span>', () => {
      const html = renderElementToHtml(el({ type: 'badge', content: 'New' }));
      expect(html).toMatch(/<span[^>]*>/);
      expect(html).toContain('New');
    });
  });

  // ── YouTube video ────────────────────────────────────────────────

  describe('youtube video', () => {
    it('renders as iframe with embed URL', () => {
      const html = renderElementToHtml(el({
        type: 'youtubeVideo',
        settings: { videoId: 'dQw4w9WgXcQ' },
      }));
      expect(html).toContain('<iframe');
      expect(html).toContain('youtube.com/embed/dQw4w9WgXcQ');
      expect(html).toContain('allowfullscreen');
    });
  });

  // ── Progress ─────────────────────────────────────────────────────

  describe('progress', () => {
    it('renders <progress> with value and max', () => {
      const html = renderElementToHtml(el({
        type: 'progress',
        settings: { value: '75', max: '100' },
      }));
      expect(html).toContain('<progress');
      expect(html).toContain('value="75"');
      expect(html).toContain('max="100"');
    });
  });

  // ── Data attributes and events ───────────────────────────────────

  describe('data attributes and events', () => {
    it('renders custom data attributes', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        dataAttributes: { testId: 'abc123' },
      }));
      expect(html).toContain('data-test-id="abc123"');
    });

    it('renders event data attributes (CSP-safe)', () => {
      const html = renderElementToHtml(el({
        type: 'div',
        events: { click: 'handleClick' },
      }));
      expect(html).toContain('data-event-click="handleClick"');
      // Must NOT contain inline event handlers
      expect(html).not.toContain('onclick=');
    });
  });

  // ── SearchBar ────────────────────────────────────────────────────

  describe('searchBar', () => {
    it('renders search input with button', () => {
      const html = renderElementToHtml(el({
        type: 'searchBar',
        content: 'Find something...',
      }));
      expect(html).toContain('type="search"');
      expect(html).toContain('placeholder="Find something..."');
      expect(html).toContain('>Search</button>');
    });
  });

  // ── Breadcrumb ───────────────────────────────────────────────────

  describe('breadcrumb', () => {
    it('renders as nav with aria-label="Breadcrumb"', () => {
      const items = ['Home', 'Products', 'Widget'];
      const html = renderElementToHtml(el({
        type: 'breadcrumb',
        content: JSON.stringify(items),
      }));
      expect(html).toContain('<nav');
      expect(html).toContain('aria-label="Breadcrumb"');
      expect(html).toContain('Home');
      expect(html).toContain('Widget');
    });
  });
});

describe('buildAttributesString', () => {
  it('adds type for input elements', () => {
    const result = buildAttributesString('input', { type: 'email' }, null);
    expect(result).toContain('type="email"');
  });

  it('adds href for anchor elements', () => {
    const result = buildAttributesString('anchor', { href: 'https://example.com' }, null);
    expect(result).toContain('href="https://example.com"');
  });

  it('adds src for image elements', () => {
    const result = buildAttributesString('image', {}, 'https://example.com/img.png');
    expect(result).toContain('src="https://example.com/img.png"');
  });

  it('adds navigate data attributes for button with targetValue', () => {
    const result = buildAttributesString('button', {}, null, {
      targetValue: 'https://example.com',
      openInNewTab: true,
    });
    expect(result).toContain('data-action="navigate"');
    expect(result).toContain('data-target="https://example.com"');
    expect(result).toContain('data-new-tab="true"');
  });

  it('prepends mailto: for button with mailto actionType', () => {
    const result = buildAttributesString('button', {}, null, {
      targetValue: 'test@example.com',
      actionType: 'mailto',
    });
    expect(result).toContain('data-target="mailto:test@example.com"');
  });

  it('prepends tel: for button with tel actionType', () => {
    const result = buildAttributesString('button', {}, null, {
      targetValue: '5551234567',
      actionType: 'tel',
    });
    expect(result).toContain('data-target="tel:5551234567"');
  });
});
