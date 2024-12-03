// src/components/Topbar.js
import React, { useContext, useState } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/Topbar.css';
import { defaultNavbarStyles } from '../Elements/Sections/Navbars/TwoColumnNavbarStyles';
import JSZip from 'jszip'; // Import JSZip

const Topbar = ({
  onExport,
  onResize,
  scale,
  onPreviewToggle,
  isPreviewMode,
  pageSettings,
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);
  const [customSize, setCustomSize] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');

  // Use the page settings or default values
  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';

  // Mapping component types to HTML tags
  const typeToTagMap = {
    div: 'div',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    span: 'span',
    image: 'img',
    video: 'video',
    audio: 'audio',
    iframe: 'iframe',
    navbar: 'nav',
    button: 'button',
    input: 'input',
    form: 'form',
    ul: 'ul',
    ol: 'ol',
    li: 'li',
    table: 'table',
    tr: 'tr',
    td: 'td',
    anchor: 'a',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    label: 'label',
    fieldset: 'fieldset',
    legend: 'legend',
    progress: 'progress',
    meter: 'meter',
    blockquote: 'blockquote',
    code: 'code',
    pre: 'pre',
    hr: 'hr',
    caption: 'caption',
    date: 'input', // date will be an input type="date"
    // Add other mappings as needed
  };

  let collectedStyles = [];

  // Collect default styles from components
  const defaultStylesMap = {
    navbar: defaultNavbarStyles.nav,
    'navbar-logo-container': defaultNavbarStyles.logoContainer,
    'navbar-compact-menu-icon': defaultNavbarStyles.compactMenuIcon,
    'navbar-compact-menu': defaultNavbarStyles.compactMenu,
    'navbar-standard-menu-container': defaultNavbarStyles.standardMenuContainer,
    'navbar-nav-list': defaultNavbarStyles.navList,
    'navbar-button-container': defaultNavbarStyles.buttonContainer,
    // Add other default styles and class names as needed
  };

  // Function to render elements to HTML
  function renderElementToHtml(element) {
    const { id, type, styles, content, src, children = [], attributes = {} } = element;
    const tag = typeToTagMap[type];

    if (!tag) {
      console.warn(`No HTML tag mapping found for type: ${type}`);
      return '';
    }

    // Generate a unique class name
    const className = `element-${id}`;

    // Collect styles for this class
    collectedStyles.push({
      className,
      styles,
    });

    // Build attributes string
    let attributesString = `class="${className}"`;

    // Handle special attributes
    if (type === 'input' && attributes.type) {
      attributesString += ` type="${attributes.type}"`;
    }
    if (type === 'anchor' && attributes.href) {
      attributesString += ` href="${attributes.href}"`;
    }
    if (['img', 'video', 'audio', 'iframe', 'source'].includes(tag) && src) {
      attributesString += ` src="${src}"`;
    }
    if (type === 'select' && attributes.multiple) {
      attributesString += ' multiple';
    }
    if (type === 'option' && attributes.value) {
      attributesString += ` value="${attributes.value}"`;
    }
    if (type === 'progress' && attributes.value && attributes.max) {
      attributesString += ` value="${attributes.value}" max="${attributes.max}"`;
    }
    if (type === 'meter' && attributes.value && attributes.min && attributes.max) {
      attributesString += ` value="${attributes.value}" min="${attributes.min}" max="${attributes.max}"`;
    }
    if (type === 'iframe' && attributes.frameborder) {
      attributesString += ` frameborder="${attributes.frameborder}"`;
    }

    // Handle self-closing tags
    const selfClosingTags = ['img', 'input', 'hr', 'br', 'meta', 'link', 'source'];

    // Render child elements
    const childrenHtml = children.map((childElement) => {
      if (childElement) {
        return renderElementToHtml(childElement);
      }
      return '';
    }).join('');

    // Handle content
    const elementContent = content || '';

    // Handle special components like navbar
    if (type === 'navbar') {
      // Similar handling as before for navbar
      // ...
      // For brevity, let's assume we have a function to handle navbar rendering
      return renderNavbarElement(element);
    }

    // Handle other special components as needed
    // ...

    // Build the final HTML
    if (selfClosingTags.includes(tag)) {
      return `<${tag} ${attributesString} />`;
    } else {
      return `<${tag} ${attributesString}>${elementContent}${childrenHtml}</${tag}>`;
    }
  }

  // Function to render navbar element
  function renderNavbarElement(element) {
    const { id, children = [] } = element;
    const className = `element-${id}`;
    let attributes = `class="navbar ${className}"`;

    // Collect styles
    collectedStyles.push({
      className,
      styles: element.styles,
    });

    // Build the logo section
    let logoHtml = '';
    const logoChildren = children.filter((child) => child.type === 'image');
    if (logoChildren.length > 0) {
      const logoElement = logoChildren[0];
      const logoClassName = `element-${logoElement.id} navbar-logo`;
      collectedStyles.push({
        className: logoClassName,
        styles: { ...logoElement.styles, width: '40px', height: '40px' },
      });
      const logoSrc = logoElement.src || ''; // Provide default src if missing
      logoHtml = `<div class="navbar-logo-container"><img class="${logoClassName}" src="${logoSrc}" alt="${logoElement.content}"></div>`;
    }

    // Build the navigation links
    const navItemsHtml = children
      .filter((child) => child.type === 'span')
      .map((childElement) => {
        const linkContent = childElement.content || '';
        const linkClassName = `element-${childElement.id}`;
        collectedStyles.push({
          className: linkClassName,
          styles: childElement.styles,
        });
        return `<li><a href="#" class="${linkClassName}">${linkContent}</a></li>`;
      })
      .join('');

    const navListHtml = `<ul class="navbar-nav-list">${navItemsHtml}</ul>`;

    // Build the button container (if any buttons)
    const buttonItemsHtml = children
      .filter((child) => child.type === 'button' || child.type === 'connectWalletButton')
      .map((childElement) => {
        const buttonContent = childElement.content || '';
        const buttonClassName = `element-${childElement.id}`;
        collectedStyles.push({
          className: buttonClassName,
          styles: childElement.styles,
        });
        return `<button class="${buttonClassName}">${buttonContent}</button>`;
      })
      .join('');

    const buttonContainerHtml = buttonItemsHtml
      ? `<div class="navbar-button-container">${buttonItemsHtml}</div>`
      : '';

    // Combine nav list and buttons into standard menu container
    const standardMenuHtml = `<div class="navbar-standard-menu-container">${navListHtml}${buttonContainerHtml}</div>`;

    // Combine logo and standard menu
    const navbarHtml = `${logoHtml}${standardMenuHtml}`;

    return `<nav ${attributes}>${navbarHtml}</nav>`;
  }

  // Function to generate CSS from collected styles
  function generateCss() {
    // Convert default styles to CSS
    const defaultStylesCss = Object.entries(defaultStylesMap).map(([className, styles]) => {
      const styleString = Object.entries(styles).map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${value};`;
      }).join('\n');
      return `.${className} {\n${styleString}\n}`;
    }).join('\n\n');

    // Convert element styles to CSS
    const elementStylesCss = collectedStyles.map(({ className, styles }) => {
      const styleString = Object.entries(styles || {}).map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${value};`;
      }).join('\n');
      return `.${className} {\n${styleString}\n}`;
    }).join('\n\n');

    // Combine default styles and element styles
    return `${defaultStylesCss}\n\n${elementStylesCss}`;
  }

  // Export to ZIP file containing HTML and CSS files
  const handleExportHtmlClick = () => {
    // Reset collected styles
    collectedStyles = [];

    // Build hierarchy
    const nestedElements = buildHierarchy(elements);

    // Render the body HTML
    const bodyHtml = nestedElements.map(element => renderElementToHtml(element)).join('');

    // Generate full HTML content
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${projectName}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${faviconUrl ? `<link rel="icon" href="${faviconUrl}" />` : ''}
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ${bodyHtml}
</body>
</html>
`;

    // Generate CSS content
    const cssContent = generateCss();

    // Create a zip file with JSZip
    const zip = new JSZip();

    // Add the HTML file to the zip
    zip.file('index.html', fullHtml.trim());

    // Add the CSS file to the zip
    zip.file('styles.css', cssContent);

    // Generate the zip file and trigger download
    zip.generateAsync({ type: 'blob' }).then((content) => {
      downloadBlob('website.zip', content);
    });
  };

  // Function to download blob content as a file
  const downloadBlob = (filename, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to download file (not used for zip)
  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle resizing of content based on button or input
  const handleResize = (size) => {
    if (onResize) {
      onResize(size);
      setCustomSize(size);
    }
  };

  // Handle resizing with custom input size
  const handleCustomResize = (e) => {
    if (e.key === 'Enter') {
      const parsedSize = parseInt(customSize, 10);
      if (!isNaN(parsedSize)) {
        handleResize(parsedSize);
      }
    }
  };

  // Simulate auto-save whenever an edit occurs
  const handleEdit = () => {
    setAutoSaveStatus('Saving...');
    setTimeout(() => {
      setAutoSaveStatus('All changes saved');
    }, 1000); // Simulating save delay of 1 second
  };
  
  // Export to JSON file
  const handleExportClick = () => {
    const nestedElements = buildHierarchy(elements);
    downloadFile(
      'website_structure.json',
      JSON.stringify(nestedElements, null, 2),
      'application/json'
    );
  };
  return (
    <div className="topbar">
      <div className="project-info">
        <button className="return-button">⬅️</button>
        {faviconUrl && (
          <img src={faviconUrl} alt="Favicon" className="favicon" />
        )}
        <div className="project-details">
          <span className="project-name">{projectName}</span>
          <span className="project-description">{description}</span>
        </div>
      </div>

      <div className="actions">
        <button className="undo-button">↺</button>
        <button className="redo-button">↻</button>
        <button className="preview-button" onClick={onPreviewToggle}>
          {isPreviewMode ? (
            <span className="material-symbols-outlined">visibility_off</span>
          ) : (
            <span className="material-symbols-outlined">visibility</span>
          )}
        </button>
      </div>

      <div className="resize-controls">
        <button className="resize-button" onClick={() => handleResize(1440)}>
          Big PC
        </button>
        <button className="resize-button" onClick={() => handleResize(1200)}>
          PC
        </button>
        <button className="resize-button" onClick={() => handleResize(768)}>
          Tablet
        </button>
        <button className="resize-button" onClick={() => handleResize(375)}>
          Phone
        </button>
        <input
          type="text"
          className="input"
          placeholder="Custom size (px)"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyDown={handleCustomResize} // Resize on Enter key
        />
        <span className="scale-percentage">
          Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      <div className="export-section">
        <span className="autosave-status">{autoSaveStatus}</span>
        <button className="button" onClick={handleExportClick}>
          Export JSON
        </button>
        <button className="button" onClick={handleExportHtmlClick}>
          Export as HTML
        </button>
      </div>
    </div>
  );
};

export default Topbar;
