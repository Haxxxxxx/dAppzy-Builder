import { describe, it, expect } from 'vitest';

import {
  removeElementById,
  removeElementRecursively,
  findElementById,
  buildHierarchy,
} from '../../utils/LeftBarUtils/elementUtils';

import { buildSectionTree } from '../../utils/sectionFactory';

// ─── elementUtils ────────────────────────────────────────────────────

describe('elementUtils', () => {

  // ── removeElementById ──────────────────────────────────────────

  describe('removeElementById', () => {
    const elements = [
      { id: 'root', type: 'div', children: ['child-1', 'child-2'], parentId: null },
      { id: 'child-1', type: 'paragraph', children: [], parentId: 'root' },
      { id: 'child-2', type: 'heading', children: [], parentId: 'root' },
    ];

    it('removes the target element from the array', () => {
      const result = removeElementById('child-1', elements);
      expect(result.find((el) => el.id === 'child-1')).toBeUndefined();
      expect(result).toHaveLength(2);
    });

    it('removes the target ID from parent children array', () => {
      const result = removeElementById('child-1', elements);
      const root = result.find((el) => el.id === 'root');
      expect(root.children).not.toContain('child-1');
      expect(root.children).toContain('child-2');
    });

    it('does NOT mutate the original array (immutability)', () => {
      const original = [
        { id: 'root', type: 'div', children: ['child-1'], parentId: null },
        { id: 'child-1', type: 'p', children: [], parentId: 'root' },
      ];
      const originalLength = original.length;
      const originalRootChildren = [...original[0].children];

      removeElementById('child-1', original);

      // Original array unchanged
      expect(original).toHaveLength(originalLength);
      expect(original[0].children).toEqual(originalRootChildren);
    });

    it('returns original array unchanged if ID not found', () => {
      const result = removeElementById('nonexistent', elements);
      expect(result).toHaveLength(elements.length);
      result.forEach((el, i) => {
        expect(el.id).toBe(elements[i].id);
      });
    });
  });

  // ── removeElementRecursively ───────────────────────────────────

  describe('removeElementRecursively', () => {
    const elements = [
      { id: 'root', type: 'div', children: ['parent-1'], parentId: null },
      { id: 'parent-1', type: 'div', children: ['child-a', 'child-b'], parentId: 'root' },
      { id: 'child-a', type: 'p', children: ['grandchild-1'], parentId: 'parent-1' },
      { id: 'child-b', type: 'p', children: [], parentId: 'parent-1' },
      { id: 'grandchild-1', type: 'span', children: [], parentId: 'child-a' },
    ];

    it('recursively removes the element and all its descendants', () => {
      const result = removeElementRecursively('parent-1', elements);
      // Should remove parent-1, child-a, child-b, grandchild-1
      expect(result.find((el) => el.id === 'parent-1')).toBeUndefined();
      expect(result.find((el) => el.id === 'child-a')).toBeUndefined();
      expect(result.find((el) => el.id === 'child-b')).toBeUndefined();
      expect(result.find((el) => el.id === 'grandchild-1')).toBeUndefined();
    });

    it('keeps the root element when removing a child subtree', () => {
      const result = removeElementRecursively('parent-1', elements);
      expect(result.find((el) => el.id === 'root')).toBeDefined();
    });

    it('removes the deleted ID from parent children array', () => {
      const result = removeElementRecursively('parent-1', elements);
      const root = result.find((el) => el.id === 'root');
      expect(root.children).not.toContain('parent-1');
    });

    it('does not mutate the original array', () => {
      const original = JSON.parse(JSON.stringify(elements));
      removeElementRecursively('parent-1', elements);
      // Deep equality check — original should be untouched
      expect(elements).toEqual(original);
    });

    it('returns all elements unchanged when ID not found', () => {
      const result = removeElementRecursively('nonexistent', elements);
      expect(result).toHaveLength(elements.length);
    });
  });

  // ── findElementById ────────────────────────────────────────────

  describe('findElementById', () => {
    const elements = [
      { id: 'a', type: 'div' },
      { id: 'b', type: 'p' },
    ];

    it('returns the matching element', () => {
      expect(findElementById('b', elements)).toEqual({ id: 'b', type: 'p' });
    });

    it('returns null when not found', () => {
      expect(findElementById('z', elements)).toBeNull();
    });
  });

  // ── buildHierarchy ─────────────────────────────────────────────

  describe('buildHierarchy', () => {
    it('builds a tree from flat elements', () => {
      const flat = [
        { id: 'root', type: 'section', children: ['c1', 'c2'], parentId: null, content: '', structure: 'heroOne' },
        { id: 'c1', type: 'heading', children: [], parentId: 'root', content: 'Title' },
        { id: 'c2', type: 'paragraph', children: [], parentId: 'root', content: 'Text' },
      ];
      const tree = buildHierarchy(flat);
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('root');
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children[0].id).toBe('c1');
      expect(tree[0].children[1].id).toBe('c2');
    });

    it('preserves child order from parent children array', () => {
      const flat = [
        { id: 'root', type: 'div', children: ['b', 'a'], parentId: null, content: '', structure: 'x' },
        { id: 'a', type: 'p', children: [], parentId: 'root', content: 'A' },
        { id: 'b', type: 'p', children: [], parentId: 'root', content: 'B' },
      ];
      const tree = buildHierarchy(flat);
      expect(tree[0].children[0].id).toBe('b');
      expect(tree[0].children[1].id).toBe('a');
    });

    it('excludes root elements with no children, content, or structure', () => {
      const flat = [
        { id: 'empty', type: 'div', children: [], parentId: null, content: '' },
        { id: 'valid', type: 'p', children: [], parentId: null, content: 'text' },
      ];
      const tree = buildHierarchy(flat);
      expect(tree.find((el) => el.id === 'empty')).toBeUndefined();
      expect(tree.find((el) => el.id === 'valid')).toBeDefined();
    });
  });
});

// ─── sectionFactory ──────────────────────────────────────────────────

describe('buildSectionTree', () => {
  it('returns correct rootId format (kebab type + timestamp + uid)', () => {
    const { rootId } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [],
      styles: {},
    });
    // Should start with "hero-"
    expect(rootId).toMatch(/^hero-\d+-[a-z0-9]+$/);
  });

  it('returns rootId with kebab-cased multi-word type', () => {
    const { rootId } = buildSectionTree({
      type: 'ContentSection',
      configuration: 'sectionOne',
      children: [],
      styles: {},
    });
    expect(rootId).toMatch(/^content-section-/);
  });

  it('creates root element with correct type and styles', () => {
    const sectionStyles = {
      section: { backgroundColor: '#000', padding: '40px' },
    };
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [],
      styles: sectionStyles,
    });
    const root = elements[0];
    expect(root.type).toBe('hero');
    expect(root.configuration).toBe('heroOne');
    expect(root.styles).toEqual({ backgroundColor: '#000', padding: '40px' });
    expect(root.isConfigured).toBe(true);
    expect(root.parentId).toBeNull();
  });

  it('uses top-level styles when section key is missing', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [],
      styles: { backgroundColor: '#fff' },
    });
    expect(elements[0].styles).toEqual({ backgroundColor: '#fff' });
  });

  it('processes children recursively', () => {
    const { elements, rootId } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [
        { type: 'heading', content: 'Title', styles: {}, children: [] },
        {
          type: 'div',
          content: '',
          styles: {},
          children: [
            { type: 'button', content: 'CTA', styles: {}, children: [] },
          ],
        },
      ],
      styles: {},
    });
    // Root + heading + div + button = 4 elements
    expect(elements).toHaveLength(4);
    // Root element has 2 direct children
    expect(elements[0].children).toHaveLength(2);
    // Find the div — it should have 1 child (the button)
    const divEl = elements.find((el) => el.type === 'div' && el.parentId === rootId);
    expect(divEl).toBeDefined();
    expect(divEl.children).toHaveLength(1);
  });

  it('resolves idSuffix for deterministic IDs', () => {
    const { elements, rootId } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [
        { type: 'div', idSuffix: 'left', content: '', styles: {}, children: [] },
        { type: 'div', idSuffix: 'right', content: '', styles: {}, children: [] },
      ],
      styles: {},
    });
    const leftEl = elements.find((el) => el.id === `${rootId}-left`);
    const rightEl = elements.find((el) => el.id === `${rootId}-right`);
    expect(leftEl).toBeDefined();
    expect(rightEl).toBeDefined();
  });

  it('resolves styles.key from parent section config', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [
        { type: 'heading', content: 'Title', styles: { key: 'title' }, children: [] },
      ],
      styles: {
        section: { backgroundColor: '#000' },
        title: { fontSize: '48px', color: '#fff' },
      },
    });
    const heading = elements.find((el) => el.type === 'heading');
    expect(heading.styles).toEqual({ fontSize: '48px', color: '#fff' });
  });

  it('keeps original styles when key does not match section config', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [
        { type: 'heading', content: 'Title', styles: { key: 'nonexistent' }, children: [] },
      ],
      styles: { section: {} },
    });
    const heading = elements.find((el) => el.type === 'heading');
    // key is still there since section config did not have 'nonexistent'
    expect(heading.styles).toEqual({ key: 'nonexistent' });
  });

  it('forwards moduleType, src, href, alt fields', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [
        { type: 'image', content: 'https://example.com/img.jpg', src: 'https://example.com/img.jpg', alt: 'Photo', styles: {}, children: [] },
        { type: 'defiModule', moduleType: 'aggregator', content: '', styles: {}, children: [] },
      ],
      styles: {},
    });
    const img = elements.find((el) => el.type === 'image');
    expect(img.src).toBe('https://example.com/img.jpg');
    expect(img.alt).toBe('Photo');

    const defi = elements.find((el) => el.type === 'defiModule');
    expect(defi.moduleType).toBe('aggregator');
  });

  it('sets content as src for image elements without explicit src', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [
        { type: 'image', content: 'https://example.com/fallback.jpg', styles: {}, children: [] },
      ],
      styles: {},
    });
    const img = elements.find((el) => el.type === 'image');
    expect(img.src).toBe('https://example.com/fallback.jpg');
  });

  it('assigns label from item fields', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      label: 'My Hero Section',
      children: [],
      styles: {},
    });
    expect(elements[0].label).toBe('My Hero Section');
  });

  it('falls back label to configuration then type', () => {
    const { elements: e1 } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [],
      styles: {},
    });
    expect(e1[0].label).toBe('heroOne');

    const { elements: e2 } = buildSectionTree({
      type: 'hero',
      children: [],
      styles: {},
    });
    expect(e2[0].label).toBe('hero');
  });

  it('handles empty children gracefully', () => {
    const { elements } = buildSectionTree({
      type: 'footer',
      configuration: 'simpleFooter',
      children: [],
      styles: {},
    });
    expect(elements).toHaveLength(1);
    expect(elements[0].children).toEqual([]);
  });

  it('handles null children gracefully', () => {
    const { elements } = buildSectionTree({
      type: 'footer',
      configuration: 'simpleFooter',
      children: null,
      styles: {},
    });
    expect(elements).toHaveLength(1);
    expect(elements[0].children).toEqual([]);
  });

  it('preserves settings on the root element', () => {
    const { elements } = buildSectionTree({
      type: 'hero',
      configuration: 'heroOne',
      children: [],
      styles: {},
      settings: { autoplay: true },
    });
    expect(elements[0].settings).toEqual({ autoplay: true });
  });
});
