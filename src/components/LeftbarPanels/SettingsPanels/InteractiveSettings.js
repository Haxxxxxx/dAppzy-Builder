/**
 * Unified settings panel for interactive elements:
 * Tabs, Accordion, Modal, Carousel, Tooltip, Dropdown, Breadcrumb, Progress
 *
 * Each element stores its data in `content` (JSON) and custom props in `styles`.
 * This panel reads the element type and renders the appropriate controls.
 */
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import '../../css/SettingsPanel.css';
import './css/InteractiveSettings.css';

// ── Helpers ─────────────────────────────────────────────────────────

function parseContent(element) {
  const raw = element?.content;
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return raw; }
  }
  return raw;
}

function ItemListEditor({ items, onUpdate, labelKey, bodyKey, addLabel }) {
  const handleChange = (idx, key, value) => {
    const next = items.map((item, i) => i === idx ? { ...item, [key]: value } : item);
    onUpdate(next);
  };
  const handleAdd = () => {
    const blank = bodyKey
      ? { [labelKey]: '', [bodyKey]: '' }
      : { [labelKey]: '' };
    onUpdate([...items, blank]);
  };
  const handleRemove = (idx) => {
    onUpdate(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="settings-group">
      {items.map((item, idx) => (
        <div key={idx} className="interactive-item-row">
          <div className="interactive-item-fields">
            <input
              type="text"
              value={typeof item === 'string' ? item : (item[labelKey] || '')}
              onChange={(e) => {
                if (typeof item === 'string') {
                  const next = [...items];
                  next[idx] = e.target.value;
                  onUpdate(next);
                } else {
                  handleChange(idx, labelKey, e.target.value);
                }
              }}
              placeholder={labelKey}
              className="settings-input"
            />
            {bodyKey && typeof item === 'object' && (
              <textarea
                value={item[bodyKey] || ''}
                onChange={(e) => handleChange(idx, bodyKey, e.target.value)}
                placeholder={bodyKey}
                className="settings-input"
                rows={2}
              />
            )}
          </div>
          <button
            className="interactive-item-remove"
            onClick={() => handleRemove(idx)}
            title="Remove"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ))}
      <button className="interactive-item-add" onClick={handleAdd}>
        <span className="material-symbols-outlined">add</span> {addLabel}
      </button>
    </div>
  );
}

// ── Tabs Settings ───────────────────────────────────────────────────

function TabsSettings({ element, updateContent, updateStyles }) {
  const content = parseContent(element) || [{ label: 'Tab 1', body: 'Content 1' }];
  const s = element.styles || {};

  return (
    <>
      <div className="settings-group">
        <label>Tabs</label>
        <ItemListEditor
          items={content}
          onUpdate={(items) => updateContent(element.id, JSON.stringify(items))}
          labelKey="label"
          bodyKey="body"
          addLabel="Add Tab"
        />
      </div>
      <div className="settings-group">
        <label>Active Color</label>
        <input
          type="color"
          value={s.activeColor || '#217BF4'}
          onChange={(e) => updateStyles(element.id, { activeColor: e.target.value })}
        />
      </div>
    </>
  );
}

// ── Accordion Settings ──────────────────────────────────────────────

function AccordionSettings({ element, updateContent, updateStyles }) {
  const content = parseContent(element) || [{ title: 'Section 1', body: 'Content 1' }];
  const s = element.styles || {};

  return (
    <>
      <div className="settings-group">
        <label>Items</label>
        <ItemListEditor
          items={content}
          onUpdate={(items) => updateContent(element.id, JSON.stringify(items))}
          labelKey="title"
          bodyKey="body"
          addLabel="Add Item"
        />
      </div>
      <div className="settings-group">
        <label>Allow Multiple Open</label>
        <select
          value={s.allowMultiple === false ? 'false' : 'true'}
          onChange={(e) => updateStyles(element.id, { allowMultiple: e.target.value === 'true' })}
          className="settings-select"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </>
  );
}

// ── Modal Settings ──────────────────────────────────────────────────

function ModalSettings({ element, updateContent }) {
  const content = parseContent(element) || { triggerText: 'Open Modal', title: 'Modal Title', body: 'Modal body text' };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Trigger Text</label>
        <input type="text" value={content.triggerText || ''} onChange={(e) => update('triggerText', e.target.value)} className="settings-input" />
      </div>
      <div className="settings-group">
        <label>Modal Title</label>
        <input type="text" value={content.title || ''} onChange={(e) => update('title', e.target.value)} className="settings-input" />
      </div>
      <div className="settings-group">
        <label>Modal Body</label>
        <textarea value={content.body || ''} onChange={(e) => update('body', e.target.value)} className="settings-input" rows={3} />
      </div>
    </>
  );
}

// ── Carousel Settings ───────────────────────────────────────────────

function CarouselSettings({ element, updateContent }) {
  const content = parseContent(element) || [{ text: 'Slide 1' }, { text: 'Slide 2' }];

  return (
    <div className="settings-group">
      <label>Slides</label>
      <ItemListEditor
        items={content}
        onUpdate={(items) => updateContent(element.id, JSON.stringify(items))}
        labelKey="text"
        addLabel="Add Slide"
      />
    </div>
  );
}

// ── Tooltip Settings ────────────────────────────────────────────────

function TooltipSettings({ element, updateContent, updateStyles }) {
  const content = parseContent(element) || { trigger: 'Hover me', tip: 'Tooltip text' };
  const s = element.styles || {};

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Trigger Text</label>
        <input type="text" value={content.trigger || ''} onChange={(e) => update('trigger', e.target.value)} className="settings-input" />
      </div>
      <div className="settings-group">
        <label>Tooltip Text</label>
        <input type="text" value={content.tip || ''} onChange={(e) => update('tip', e.target.value)} className="settings-input" />
      </div>
      <div className="settings-group">
        <label>Position</label>
        <select
          value={s.tooltipPosition || 'top'}
          onChange={(e) => updateStyles(element.id, { tooltipPosition: e.target.value })}
          className="settings-select"
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
    </>
  );
}

// ── Dropdown Settings ───────────────────────────────────────────────

function DropdownSettings({ element, updateContent }) {
  const content = parseContent(element) || { label: 'Select...', items: ['Option 1', 'Option 2'] };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Label</label>
        <input type="text" value={content.label || ''} onChange={(e) => update('label', e.target.value)} className="settings-input" />
      </div>
      <div className="settings-group">
        <label>Options</label>
        <ItemListEditor
          items={content.items || []}
          onUpdate={(items) => update('items', items)}
          labelKey="text"
          addLabel="Add Option"
        />
      </div>
    </>
  );
}

// ── Breadcrumb Settings ─────────────────────────────────────────────

function BreadcrumbSettings({ element, updateContent, updateStyles }) {
  const content = parseContent(element) || ['Home', 'Page'];
  const s = element.styles || {};

  return (
    <>
      <div className="settings-group">
        <label>Items</label>
        <ItemListEditor
          items={content}
          onUpdate={(items) => updateContent(element.id, JSON.stringify(items))}
          labelKey="label"
          addLabel="Add Item"
        />
      </div>
      <div className="settings-group">
        <label>Separator</label>
        <input
          type="text"
          value={s.separator || '/'}
          onChange={(e) => updateStyles(element.id, { separator: e.target.value })}
          className="settings-input"
          style={{ width: '60px' }}
        />
      </div>
    </>
  );
}

// ── Progress Settings ───────────────────────────────────────────────

function ProgressSettings({ element, updateStyles }) {
  const s = element.styles || {};

  return (
    <>
      <div className="settings-group">
        <label>Value</label>
        <input
          type="number"
          min="0"
          max={s.max || 100}
          value={s.value || 0}
          onChange={(e) => updateStyles(element.id, { value: Number(e.target.value) })}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Max</label>
        <input
          type="number"
          min="1"
          value={s.max || 100}
          onChange={(e) => updateStyles(element.id, { max: Number(e.target.value) })}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Label</label>
        <input
          type="text"
          value={s.label || ''}
          onChange={(e) => updateStyles(element.id, { label: e.target.value })}
          placeholder="e.g. Loading..."
          className="settings-input"
        />
      </div>
    </>
  );
}

// ── Form Control Settings (checkbox, radio, toggle, etc.) ───────────

function FormControlSettings({ element, updateContent, updateStyles }) {
  const s = element.styles || {};
  const type = element.type;
  const content = element.content || '';

  const hasLabel = ['checkbox', 'radio', 'toggle', 'fileUpload', 'datePicker'].includes(type);
  const hasChecked = ['checkbox', 'radio', 'toggle'].includes(type);
  const hasPlaceholder = ['searchBar', 'fileUpload', 'datePicker'].includes(type);
  const hasAccentColor = ['checkbox', 'radio', 'toggle'].includes(type);

  return (
    <>
      {hasLabel && (
        <div className="settings-group">
          <label>Label</label>
          <input
            type="text"
            value={content}
            onChange={(e) => updateContent(element.id, e.target.value)}
            className="settings-input"
          />
        </div>
      )}
      {hasPlaceholder && (
        <div className="settings-group">
          <label>Placeholder</label>
          <input
            type="text"
            value={hasLabel ? (s.placeholder || '') : content}
            onChange={(e) => hasLabel
              ? updateStyles(element.id, { placeholder: e.target.value })
              : updateContent(element.id, e.target.value)
            }
            className="settings-input"
          />
        </div>
      )}
      {hasChecked && (
        <div className="settings-group">
          <label>Default State</label>
          <select
            value={s.checked ? 'checked' : 'unchecked'}
            onChange={(e) => updateStyles(element.id, { checked: e.target.value === 'checked' })}
            className="settings-select"
          >
            <option value="unchecked">Unchecked</option>
            <option value="checked">Checked</option>
          </select>
        </div>
      )}
      {type === 'searchBar' && (
        <div className="settings-group">
          <label>Show Button</label>
          <select
            value={s.showButton === false ? 'false' : 'true'}
            onChange={(e) => updateStyles(element.id, { showButton: e.target.value === 'true' })}
            className="settings-select"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      )}
      {hasAccentColor && (
        <div className="settings-group">
          <label>Accent Color</label>
          <input
            type="color"
            value={s.accentColor || '#217BF4'}
            onChange={(e) => updateStyles(element.id, { accentColor: e.target.value })}
          />
        </div>
      )}
    </>
  );
}

// ── Back To Top Settings ────────────────────────────────────────────

function BackToTopSettings({ element, updateContent, updateStyles }) {
  const s = element.styles || {};
  const content = element.content || 'Back to Top';

  return (
    <>
      <div className="settings-group">
        <label>Button Label</label>
        <input
          type="text"
          value={content}
          onChange={(e) => updateContent(element.id, e.target.value)}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Scroll Behavior</label>
        <select
          value={s.scrollBehavior || 'smooth'}
          onChange={(e) => updateStyles(element.id, { scrollBehavior: e.target.value })}
          className="settings-select"
        >
          <option value="smooth">Smooth</option>
          <option value="instant">Instant</option>
        </select>
      </div>
    </>
  );
}

// ── Iframe Settings ─────────────────────────────────────────────────

function IframeSettings({ element, updateContent }) {
  const [src, setSrc] = useState(element.content || '');

  useEffect(() => {
    setSrc(element.content || '');
  }, [element.content]);

  const handleSave = () => {
    updateContent(element.id, src);
  };

  return (
    <div className="settings-group">
      <label>Embed URL</label>
      <input
        type="text"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        placeholder="https://..."
        className="settings-input"
      />
    </div>
  );
}

// ── Spacer Settings ──────────────────────────────────────────────────

function SpacerSettings({ element, updateStyles }) {
  const s = element.styles || {};
  const height = parseInt(s.height, 10) || 40;

  return (
    <div className="settings-group">
      <label>Height (px)</label>
      <input
        type="number"
        min="1"
        value={height}
        onChange={(e) => updateStyles(element.id, { height: `${e.target.value}px` })}
        className="settings-input"
      />
    </div>
  );
}

// ── Separator Settings ───────────────────────────────────────────────

function SeparatorSettings({ element, updateStyles }) {
  const s = element.styles || {};

  return (
    <>
      <div className="settings-group">
        <label>Variant</label>
        <select
          value={s.borderTopStyle || 'solid'}
          onChange={(e) => updateStyles(element.id, { borderTopStyle: e.target.value })}
          className="settings-select"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Color</label>
        <input
          type="color"
          value={s.borderTopColor || '#e5e7eb'}
          onChange={(e) => updateStyles(element.id, { borderTopColor: e.target.value })}
        />
      </div>
      <div className="settings-group">
        <label>Thickness (px)</label>
        <input
          type="number"
          min="1"
          value={parseInt(s.borderTopWidth, 10) || 1}
          onChange={(e) => updateStyles(element.id, { borderTopWidth: `${e.target.value}px` })}
          className="settings-input"
        />
      </div>
    </>
  );
}

// ── Countdown Settings ───────────────────────────────────────────────

function CountdownSettings({ element, updateContent }) {
  const content = parseContent(element) || { targetDate: '2025-12-31T00:00:00', label: 'Launch in', showLabels: true };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Target Date</label>
        <input
          type="datetime-local"
          value={content.targetDate || '2025-12-31T00:00:00'}
          onChange={(e) => update('targetDate', e.target.value)}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Label Text</label>
        <input
          type="text"
          value={content.label || ''}
          onChange={(e) => update('label', e.target.value)}
          placeholder="e.g. Launch in"
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Show Unit Labels</label>
        <select
          value={content.showLabels === false ? 'false' : 'true'}
          onChange={(e) => update('showLabels', e.target.value === 'true')}
          className="settings-select"
        >
          <option value="true">Yes (Days, Hours, Minutes, Seconds)</option>
          <option value="false">No</option>
        </select>
      </div>
    </>
  );
}

// ── Code Inject Settings ─────────────────────────────────────────────

function CodeInjectSettings({ element, updateContent }) {
  const content = parseContent(element) || { html: '', css: '', js: '' };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  const textareaStyle = {
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontSize: '12px',
    backgroundColor: '#1e1e2e',
    color: '#cdd6f4',
    border: '1px solid #313244',
    borderRadius: '6px',
    padding: '10px',
    resize: 'vertical',
    minHeight: '80px',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <>
      <div className="settings-group">
        <label>HTML</label>
        <textarea
          value={content.html || ''}
          onChange={(e) => update('html', e.target.value)}
          placeholder="<div>Your HTML here</div>"
          style={textareaStyle}
          rows={4}
        />
      </div>
      <div className="settings-group">
        <label>CSS</label>
        <textarea
          value={content.css || ''}
          onChange={(e) => update('css', e.target.value)}
          placeholder=".my-class { color: red; }"
          style={textareaStyle}
          rows={4}
        />
      </div>
      <div className="settings-group">
        <label>JavaScript</label>
        <textarea
          value={content.js || ''}
          onChange={(e) => update('js', e.target.value)}
          placeholder="console.log('Hello');"
          style={textareaStyle}
          rows={4}
        />
      </div>
      <div style={{
        padding: '10px 12px',
        backgroundColor: 'rgba(250, 179, 135, 0.1)',
        border: '1px solid rgba(250, 179, 135, 0.3)',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#fab387',
        lineHeight: 1.5,
      }}>
        Custom code is injected as-is into the exported page.
      </div>
    </>
  );
}

// ── Map Embed Settings ────────────────────────────────────────────────

function MapEmbedSettings({ element, updateContent, updateStyles }) {
  const [src, setSrc] = useState(element.content || '');
  const s = element.styles || {};

  useEffect(() => {
    setSrc(element.content || '');
  }, [element.content]);

  const handleSave = () => {
    updateContent(element.id, src);
  };

  return (
    <>
      <div className="settings-group">
        <label>Address / Embed URL</label>
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Paste a Google Maps embed URL or enter an address"
          className="settings-input"
        />
        <span style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
          Paste a Google Maps embed URL or enter an address
        </span>
      </div>
      <div className="settings-group">
        <label>Height</label>
        <input
          type="text"
          value={s.height || '300px'}
          onChange={(e) => updateStyles(element.id, { height: e.target.value })}
          placeholder="e.g. 300px"
          className="settings-input"
        />
      </div>
    </>
  );
}

// ── Social Links Settings ─────────────────────────────────────────────

const SOCIAL_PLATFORM_OPTIONS = [
  'twitter', 'github', 'discord', 'telegram', 'linkedin',
  'youtube', 'instagram', 'facebook', 'tiktok', 'website',
];

function SocialLinksSettings({ element, updateContent }) {
  const content = parseContent(element);
  const links = content?.links || [
    { platform: 'twitter', url: '' },
    { platform: 'github', url: '' },
    { platform: 'discord', url: '' },
  ];

  const save = (nextLinks) => {
    updateContent(element.id, JSON.stringify({ links: nextLinks }));
  };

  const handlePlatformChange = (idx, platform) => {
    const next = links.map((l, i) => i === idx ? { ...l, platform } : l);
    save(next);
  };

  const handleUrlChange = (idx, url) => {
    const next = links.map((l, i) => i === idx ? { ...l, url } : l);
    save(next);
  };

  const handleAdd = () => {
    save([...links, { platform: 'website', url: '' }]);
  };

  const handleRemove = (idx) => {
    save(links.filter((_, i) => i !== idx));
  };

  return (
    <div className="settings-group">
      <label>Social Links</label>
      {links.map((link, idx) => (
        <div key={idx} className="interactive-item-row">
          <div className="interactive-item-fields">
            <select
              value={link.platform}
              onChange={(e) => handlePlatformChange(idx, e.target.value)}
              className="settings-select"
            >
              {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              value={link.url || ''}
              onChange={(e) => handleUrlChange(idx, e.target.value)}
              placeholder="https://..."
              className="settings-input"
            />
          </div>
          <button
            className="interactive-item-remove"
            onClick={() => handleRemove(idx)}
            title="Remove"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ))}
      <button className="interactive-item-add" onClick={handleAdd}>
        <span className="material-symbols-outlined">add</span> Add Link
      </button>
    </div>
  );
}

// ── Slider Settings ──────────────────────────────────────────────────

function SliderSettings({ element, updateContent }) {
  const content = parseContent(element) || { label: 'Volume', min: 0, max: 100, step: 1, value: 50, showValue: true };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Label</label>
        <input
          type="text"
          value={content.label || ''}
          onChange={(e) => update('label', e.target.value)}
          placeholder="e.g. Volume"
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Min Value</label>
        <input
          type="number"
          value={content.min ?? 0}
          onChange={(e) => update('min', Number(e.target.value))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Max Value</label>
        <input
          type="number"
          value={content.max ?? 100}
          onChange={(e) => update('max', Number(e.target.value))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Step</label>
        <input
          type="number"
          min="0.01"
          step="any"
          value={content.step ?? 1}
          onChange={(e) => update('step', Number(e.target.value))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Default Value</label>
        <input
          type="number"
          min={content.min ?? 0}
          max={content.max ?? 100}
          value={content.value ?? 50}
          onChange={(e) => update('value', Number(e.target.value))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Show Value</label>
        <select
          value={content.showValue === false ? 'false' : 'true'}
          onChange={(e) => update('showValue', e.target.value === 'true')}
          className="settings-select"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </>
  );
}

// ── Rating Settings ──────────────────────────────────────────────────

function RatingSettings({ element, updateContent }) {
  const content = parseContent(element) || { value: 4, maxStars: 5, interactive: false, color: '#FFD700' };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Rating Value</label>
        <input
          type="number"
          min="0"
          max={content.maxStars ?? 5}
          value={content.value ?? 4}
          onChange={(e) => update('value', Number(e.target.value))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Max Stars</label>
        <input
          type="number"
          min="1"
          max="10"
          value={content.maxStars ?? 5}
          onChange={(e) => update('maxStars', Number(e.target.value))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Interactive</label>
        <select
          value={content.interactive ? 'true' : 'false'}
          onChange={(e) => update('interactive', e.target.value === 'true')}
          className="settings-select"
        >
          <option value="false">No (display only)</option>
          <option value="true">Yes (clickable)</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Star Color</label>
        <input
          type="color"
          value={content.color || '#FFD700'}
          onChange={(e) => update('color', e.target.value)}
        />
      </div>
    </>
  );
}

// ── Lightbox Settings ─────────────────────────────────────────────────

function LightboxSettings({ element, updateContent }) {
  const content = parseContent(element) || { images: [{ src: '', alt: '' }], columns: 3 };

  const images = content.images || [{ src: '', alt: '' }];
  const columns = content.columns || 3;

  const save = (next) => {
    updateContent(element.id, JSON.stringify(next));
  };

  const handleImageChange = (idx, key, value) => {
    const next = images.map((img, i) => i === idx ? { ...img, [key]: value } : img);
    save({ ...content, images: next });
  };

  const handleAddImage = () => {
    save({ ...content, images: [...images, { src: '', alt: '' }] });
  };

  const handleRemoveImage = (idx) => {
    save({ ...content, images: images.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <div className="settings-group">
        <label>Images</label>
        {images.map((img, idx) => (
          <div key={idx} className="interactive-item-row">
            <div className="interactive-item-fields">
              <input
                type="text"
                value={img.src || ''}
                onChange={(e) => handleImageChange(idx, 'src', e.target.value)}
                placeholder="Image URL"
                className="settings-input"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => handleImageChange(idx, 'alt', e.target.value)}
                placeholder="Alt text"
                className="settings-input"
              />
            </div>
            <button
              className="interactive-item-remove"
              onClick={() => handleRemoveImage(idx)}
              title="Remove"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
        <button className="interactive-item-add" onClick={handleAddImage}>
          <span className="material-symbols-outlined">add</span> Add Image
        </button>
      </div>
      <div className="settings-group">
        <label>Grid Columns</label>
        <input
          type="number"
          min="1"
          max="8"
          value={columns}
          onChange={(e) => save({ ...content, columns: Number(e.target.value) })}
          className="settings-input"
        />
      </div>
    </>
  );
}

// ── Marquee Settings ─────────────────────────────────────────────────

function MarqueeSettings({ element, updateContent }) {
  const content = parseContent(element) || { items: ['Text 1', 'Text 2', 'Text 3'], speed: 30, direction: 'left', pauseOnHover: true };

  const save = (next) => {
    updateContent(element.id, JSON.stringify(next));
  };

  const items = content.items || [];

  const handleItemChange = (idx, value) => {
    const next = items.map((item, i) => i === idx ? value : item);
    save({ ...content, items: next });
  };

  const handleAddItem = () => {
    save({ ...content, items: [...items, ''] });
  };

  const handleRemoveItem = (idx) => {
    save({ ...content, items: items.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <div className="settings-group">
        <label>Items</label>
        {items.map((item, idx) => (
          <div key={idx} className="interactive-item-row">
            <div className="interactive-item-fields">
              <input
                type="text"
                value={item || ''}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                placeholder="Text content"
                className="settings-input"
              />
            </div>
            <button
              className="interactive-item-remove"
              onClick={() => handleRemoveItem(idx)}
              title="Remove"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
        <button className="interactive-item-add" onClick={handleAddItem}>
          <span className="material-symbols-outlined">add</span> Add Item
        </button>
      </div>
      <div className="settings-group">
        <label>Speed (px/sec)</label>
        <input
          type="number"
          min="1"
          value={content.speed || 30}
          onChange={(e) => save({ ...content, speed: Number(e.target.value) })}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Direction</label>
        <select
          value={content.direction || 'left'}
          onChange={(e) => save({ ...content, direction: e.target.value })}
          className="settings-select"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Pause on Hover</label>
        <select
          value={content.pauseOnHover === false ? 'false' : 'true'}
          onChange={(e) => save({ ...content, pauseOnHover: e.target.value === 'true' })}
          className="settings-select"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </>
  );
}

// ── Alert Settings ─────────────────────────────────────────────────

function AlertSettings({ element, updateContent }) {
  const content = parseContent(element) || { message: 'This is an alert message', variant: 'info', dismissible: true };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Message</label>
        <textarea
          value={content.message || ''}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Alert message..."
          className="settings-input"
          rows={3}
        />
      </div>
      <div className="settings-group">
        <label>Variant</label>
        <select
          value={content.variant || 'info'}
          onChange={(e) => update('variant', e.target.value)}
          className="settings-select"
        >
          <option value="info">Info (Blue)</option>
          <option value="success">Success (Green)</option>
          <option value="warning">Warning (Amber)</option>
          <option value="error">Error (Red)</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Dismissible</label>
        <select
          value={content.dismissible === false ? 'false' : 'true'}
          onChange={(e) => update('dismissible', e.target.value === 'true')}
          className="settings-select"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      {content.dismissed && (
        <div className="settings-group">
          <button
            className="interactive-item-add"
            onClick={() => update('dismissed', false)}
          >
            <span className="material-symbols-outlined">visibility</span> Restore Alert
          </button>
        </div>
      )}
    </>
  );
}

// ── Pagination Settings ──────────────────────────────────────────────

function PaginationSettings({ element, updateContent }) {
  const content = parseContent(element) || { totalPages: 5, currentPage: 1, showPrevNext: true };

  const update = (key, value) => {
    updateContent(element.id, JSON.stringify({ ...content, [key]: value }));
  };

  return (
    <>
      <div className="settings-group">
        <label>Total Pages</label>
        <input
          type="number"
          min="1"
          value={content.totalPages || 5}
          onChange={(e) => update('totalPages', Math.max(1, Number(e.target.value)))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Current Page</label>
        <input
          type="number"
          min="1"
          max={content.totalPages || 5}
          value={content.currentPage || 1}
          onChange={(e) => update('currentPage', Math.min(Math.max(1, Number(e.target.value)), content.totalPages || 5))}
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label>Show Prev / Next</label>
        <select
          value={content.showPrevNext === false ? 'false' : 'true'}
          onChange={(e) => update('showPrevNext', e.target.value === 'true')}
          className="settings-select"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </>
  );
}

// ── Main Router ─────────────────────────────────────────────────────

const InteractiveSettings = () => {
  const { selectedElement, updateContent, updateStyles } = useContext(EditableContext);

  if (!selectedElement) return null;

  const type = selectedElement.type;
  const props = { element: selectedElement, updateContent, updateStyles };

  switch (type) {
    case 'tabs':       return <div className="settings-panel"><TabsSettings {...props} /></div>;
    case 'accordion':  return <div className="settings-panel"><AccordionSettings {...props} /></div>;
    case 'modal':      return <div className="settings-panel"><ModalSettings {...props} /></div>;
    case 'carousel':   return <div className="settings-panel"><CarouselSettings {...props} /></div>;
    case 'tooltip':    return <div className="settings-panel"><TooltipSettings {...props} /></div>;
    case 'dropdown':   return <div className="settings-panel"><DropdownSettings {...props} /></div>;
    case 'breadcrumb': return <div className="settings-panel"><BreadcrumbSettings {...props} /></div>;
    case 'progress':   return <div className="settings-panel"><ProgressSettings {...props} /></div>;
    case 'iframe':     return <div className="settings-panel"><IframeSettings {...props} /></div>;
    case 'backToTop':  return <div className="settings-panel"><BackToTopSettings {...props} /></div>;
    case 'spacer':     return <div className="settings-panel"><SpacerSettings {...props} /></div>;
    case 'separator':  return <div className="settings-panel"><SeparatorSettings {...props} /></div>;
    case 'countdown':  return <div className="settings-panel"><CountdownSettings {...props} /></div>;
    case 'codeInject': return <div className="settings-panel"><CodeInjectSettings {...props} /></div>;
    case 'mapEmbed':   return <div className="settings-panel"><MapEmbedSettings {...props} /></div>;
    case 'socialLinks': return <div className="settings-panel"><SocialLinksSettings {...props} /></div>;
    case 'slider':     return <div className="settings-panel"><SliderSettings {...props} /></div>;
    case 'rating':     return <div className="settings-panel"><RatingSettings {...props} /></div>;
    case 'lightbox':   return <div className="settings-panel"><LightboxSettings {...props} /></div>;
    case 'marquee':    return <div className="settings-panel"><MarqueeSettings {...props} /></div>;
    case 'alert':      return <div className="settings-panel"><AlertSettings {...props} /></div>;
    case 'pagination': return <div className="settings-panel"><PaginationSettings {...props} /></div>;
    case 'checkbox':
    case 'radio':
    case 'toggle':
    case 'fileUpload':
    case 'datePicker':
    case 'searchBar':
      return <div className="settings-panel"><FormControlSettings {...props} /></div>;
    default:
      return <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No settings available for this element type.</p>;
  }
};

export default InteractiveSettings;
