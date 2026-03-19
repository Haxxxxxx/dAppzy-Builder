import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('../export/elementUtils', () => ({
  buildElementHierarchy: vi.fn((elements) => elements),
  cleanElementData: vi.fn((el) => el),
}));

vi.mock('../export/escapeUtils', () => ({
  escapeHtml: vi.fn((str) => str || ''),
  escapeAttr: vi.fn((str) => str || ''),
  sanitizeStyleValue: vi.fn((val) => val || ''),
  camelToKebab: vi.fn((str) => str ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : ''),
}));

vi.mock('../htmlRender', () => ({
  renderElementToHtml: vi.fn(() => '<div>rendered</div>'),
}));

vi.mock('../../configs/ipfsConfig', () => ({
  IPFS_GATEWAYS: [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ],
}));

import { generateProjectHtml } from '../export/htmlGenerator';
import { buildElementHierarchy } from '../export/elementUtils';
import { renderElementToHtml } from '../htmlRender';

describe('htmlGenerator', () => {
  const defaultSettings = {
    siteTitle: 'Test Site',
    metaDescription: 'A test description',
    metaKeywords: 'test, site',
    author: 'Tester',
    ogImage: 'https://example.com/og.png',
    faviconUrl: '/favicon.ico',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    buildElementHierarchy.mockImplementation((elements) => elements);
    renderElementToHtml.mockImplementation(() => '<div>rendered</div>');
  });

  describe('HTML structure', () => {
    it('should generate valid HTML with DOCTYPE, html, head, and body tags', () => {
      const html = generateProjectHtml([], defaultSettings);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
      expect(html).toContain('</html>');
    });

    it('should include the site title', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('<title>Test Site</title>');
    });

    it('should use default title when siteTitle is missing', () => {
      const html = generateProjectHtml([], {});
      expect(html).toContain('<title>Exported Website</title>');
    });

    it('should include viewport meta tag', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('name="viewport"');
      expect(html).toContain('width=device-width, initial-scale=1.0');
    });

    it('should include charset meta tag', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('charset="UTF-8"');
    });
  });

  describe('Content-Security-Policy', () => {
    it('should include a CSP meta tag', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('Content-Security-Policy');
    });

    it('should allow self and https in default-src', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain("default-src 'self' https:");
    });

    it('should use nonce for script-src and unsafe-inline only for style-src', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' https:/);
      expect(html).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(html).toContain("style-src 'self' 'unsafe-inline' https:");
    });

    it('should add nonce attribute to all executable script tags', () => {
      const html = generateProjectHtml([], defaultSettings);
      const scriptTags = html.match(/<script[^>]*>/g) || [];
      expect(scriptTags.length).toBeGreaterThan(0);
      scriptTags.forEach(tag => {
        // JSON-LD scripts don't need nonce (not executable)
        if (tag.includes('application/ld+json')) return;
        expect(tag).toMatch(/nonce="[A-Za-z0-9+/=]+"/);
      });
    });

    it('should allow data and blob for images', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('img-src');
      expect(html).toContain('data:');
      expect(html).toContain('blob:');
    });
  });

  describe('IPFS gateway injection', () => {
    it('should embed IPFS gateways array in a script tag', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('ipfsGateways');
      expect(html).toContain('https://ipfs.io/ipfs/');
      expect(html).toContain('https://gateway.pinata.cloud/ipfs/');
    });

    it('should include IPFS gateway fallback logic', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('handleImageLoad');
      expect(html).toContain('tryNextGateway');
    });
  });

  describe('Open Graph / Twitter meta tags', () => {
    it('should include OG meta tags from settings', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('og:title');
      expect(html).toContain('og:description');
      expect(html).toContain('og:image');
      expect(html).toContain('og:type');
    });

    it('should include Twitter card meta tags', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('twitter:card');
      expect(html).toContain('twitter:title');
      expect(html).toContain('twitter:description');
    });
  });

  describe('CSS base styles', () => {
    it('should include CSS custom properties', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('--primary-color');
      expect(html).toContain('--text-color');
      expect(html).toContain('--background-color');
    });

    it('should include responsive media query for navbar', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('@media (max-width: 768px)');
      expect(html).toContain('.section-navbar');
    });

    it('should include IPFS image optimizations', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('img {');
      expect(html).toContain('max-width: 100%');
    });
  });

  describe('Element rendering', () => {
    it('should render a hero element using generateHeroHtml', () => {
      const heroElement = {
        id: 'hero-1',
        type: 'hero',
        configuration: 'heroOne',
        styles: {},
        children: [
          { id: 'h1', type: 'heading', content: 'Hello World' },
          { id: 'p1', type: 'paragraph', content: 'Welcome' },
          { id: 'b1', type: 'button', content: 'Click Me' },
        ],
      };

      buildElementHierarchy.mockReturnValue([heroElement]);
      const html = generateProjectHtml([heroElement], defaultSettings);

      expect(html).toContain('section-hero');
      expect(html).toContain('Hello World');
      expect(html).toContain('Welcome');
      expect(html).toContain('Click Me');
    });

    it('should render a navbar element using generateNavbarHtml', () => {
      const navElement = {
        id: 'nav-1',
        type: 'navbar',
        configuration: 'threeColumn',
        styles: {},
        children: [
          { id: 'logo', type: 'image', content: 'https://example.com/logo.png' },
          { id: 'link1', type: 'span', content: 'Home' },
          { id: 'link2', type: 'span', content: 'About' },
          { id: 'btn1', type: 'button', content: 'Sign In' },
        ],
      };

      buildElementHierarchy.mockReturnValue([navElement]);
      const html = generateProjectHtml([navElement], defaultSettings);

      expect(html).toContain('section-navbar');
      expect(html).toContain('Home');
      expect(html).toContain('About');
      expect(html).toContain('Sign In');
    });

    it('should dispatch non-hero/navbar elements to renderElementToHtml', () => {
      const divElement = {
        id: 'div-1',
        type: 'div',
        content: '',
        styles: {},
        children: [],
      };

      buildElementHierarchy.mockReturnValue([divElement]);
      const html = generateProjectHtml([divElement], defaultSettings);

      expect(renderElementToHtml).toHaveBeenCalledWith(divElement, [], expect.objectContaining({ themeColor: expect.any(String) }));
      expect(html).toContain('rendered');
    });

    it('should clean className to class in rendered output', () => {
      renderElementToHtml.mockReturnValue('<div className="test">content</div>');
      const el = { id: 'x', type: 'div', styles: {}, children: [] };
      buildElementHierarchy.mockReturnValue([el]);

      const html = generateProjectHtml([el], defaultSettings);
      expect(html).toContain('class="test"');
      expect(html).not.toContain('className=');
    });

    it('should clean empty divs from output', () => {
      renderElementToHtml.mockReturnValue('<div></div><div>keep</div>');
      const el = { id: 'y', type: 'div', styles: {}, children: [] };
      buildElementHierarchy.mockReturnValue([el]);

      const html = generateProjectHtml([el], defaultSettings);
      expect(html).toContain('keep');
    });

    it('should handle empty elements array', () => {
      buildElementHierarchy.mockReturnValue([]);
      const html = generateProjectHtml([], defaultSettings);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<body>');
    });
  });

  describe('Google Fonts injection', () => {
    it('should inject Google Fonts link tags for custom fontFamily values', () => {
      const elements = [
        { id: 'h1', type: 'heading', styles: { fontFamily: 'Inter' }, children: [] },
        { id: 'p1', type: 'paragraph', styles: { fontFamily: 'Poppins' }, children: [] },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      expect(html).toContain('fonts.googleapis.com');
      expect(html).toContain('fonts.gstatic.com');
      expect(html).toContain('family=Inter:wght@400;500;600;700');
      expect(html).toContain('family=Poppins:wght@400;500;600;700');
      expect(html).toContain('display=swap');
    });

    it('should not inject Google Fonts link tags for system fonts', () => {
      const elements = [
        { id: 'h1', type: 'heading', styles: { fontFamily: 'Arial' }, children: [] },
        { id: 'p1', type: 'paragraph', styles: { fontFamily: 'Helvetica' }, children: [] },
        { id: 'p2', type: 'paragraph', styles: { fontFamily: 'sans-serif' }, children: [] },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      expect(html).not.toContain('fonts.googleapis.com/css2?family=');
    });

    it('should deduplicate font families', () => {
      const elements = [
        { id: 'h1', type: 'heading', styles: { fontFamily: 'Inter' }, children: [] },
        { id: 'h2', type: 'heading', styles: { fontFamily: 'Inter' }, children: [] },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      const matches = html.match(/family=Inter/g);
      expect(matches).toHaveLength(1);
    });

    it('should extract font families from breakpointStyles', () => {
      const elements = [
        {
          id: 'h1',
          type: 'heading',
          styles: { fontFamily: 'Arial' },
          breakpointStyles: {
            tablet: { fontFamily: 'Montserrat' },
            mobile: { fontFamily: 'Lato' },
          },
          children: [],
        },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      expect(html).toContain('family=Montserrat:wght@400;500;600;700');
      expect(html).toContain('family=Lato:wght@400;500;600;700');
    });

    it('should handle comma-separated fontFamily values by using the first entry', () => {
      const elements = [
        { id: 'h1', type: 'heading', styles: { fontFamily: "'Playfair Display', serif" }, children: [] },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      expect(html).toContain('family=Playfair+Display:wght@400;500;600;700');
    });

    it('should produce no font links when no elements have fontFamily', () => {
      const elements = [
        { id: 'h1', type: 'heading', styles: { color: 'red' }, children: [] },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      expect(html).not.toContain('fonts.googleapis.com/css2?family=');
    });

    it('should place font link tags before the style block', () => {
      const elements = [
        { id: 'h1', type: 'heading', styles: { fontFamily: 'Inter' }, children: [] },
      ];
      buildElementHierarchy.mockReturnValue(elements);
      const html = generateProjectHtml(elements, defaultSettings);

      const fontLinkIndex = html.indexOf('fonts.googleapis.com/css2?family=');
      const styleIndex = html.indexOf('<style>');
      expect(fontLinkIndex).toBeLessThan(styleIndex);
    });
  });

  describe('Favicon', () => {
    it('should include the custom favicon', () => {
      const html = generateProjectHtml([], defaultSettings);
      expect(html).toContain('rel="icon"');
      expect(html).toContain('/favicon.ico');
    });

    it('should default to /favicon.ico when faviconUrl is missing', () => {
      const html = generateProjectHtml([], {});
      expect(html).toContain('href="/favicon.ico"');
    });
  });
});
