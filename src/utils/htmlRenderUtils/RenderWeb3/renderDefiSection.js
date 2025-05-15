import { renderElementToHtml } from '../../htmlRender';

export function renderDefiSection(element, collectedStyles) {
  console.log('renderDefiSection element:', element);
  
  // Extract content from element, handling both string and object formats
  let content = element.content;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      content = {};
    }
  }

  const { 
    id, 
    styles = {}, 
    inlineStyles = {},
    children = [], 
    settings = content?.settings || {},
    defaultModules = [
      {
        moduleType: 'aggregator',
        content: {
          title: 'DeFi Aggregator',
          description: 'Access multiple DeFi protocols through a single interface',
          stats: [
            { label: 'Connected Wallet', value: 'Not Connected' },
            { label: 'Total Pools', value: 'Loading...' },
            { label: 'Total Value Locked', value: '$0' },
            { label: 'Best APY', value: 'Not Connected' }
          ]
        }
      },
      {
        moduleType: 'simulation',
        content: {
          title: 'Investment Simulator',
          description: 'Simulate different investment strategies',
          stats: [
            { label: 'Investment Range', value: '$10,000' },
            { label: 'Supported Assets', value: '20+' },
            { label: 'Historical Data', value: '5 Years' }
          ]
        }
      },
      {
        moduleType: 'bridge',
        content: {
          title: 'Cross-Chain Bridge',
          description: 'Transfer assets between different blockchains',
          stats: [
            { label: 'Supported Chains', value: 'Select Chain' },
            { label: 'Transfer Time', value: 'Select Chain' },
            { label: 'Security Score', value: '0.1%' }
          ]
        }
      }
    ]
  } = element;
  
  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  // Helper to merge and generate style string from styles and inlineStyles, with fallbacks
  function getStyleString(styles, inlineStyles) {
    let merged = { ...(styles || {}), ...(inlineStyles || {}) };
    // Remove borderRadius if present
    delete merged.borderRadius;
    if (!merged.display) merged.display = 'grid';
    if (!merged.gridTemplateColumns) merged.gridTemplateColumns = '1fr';
    if (!merged.gap) merged.gap = '2rem';
    if (!merged.padding) merged.padding = '2rem';
    if (!merged.backgroundColor) merged.backgroundColor = 'rgb(29, 28, 43)';
    if (!merged.color) merged.color = 'rgb(255, 255, 255)';
    if (!merged.alignItems) merged.alignItems = 'center';
    if (!merged.border) merged.border = 'none';
    if (!merged.position) merged.position = 'relative';
    return Object.entries(merged)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // Section styles
  const className = `defi-section-${id}`;
  const sectionStyle = getStyleString(styles, inlineStyles);

  // Title styles
  collectedStyles.push({
    className: 'defi-section-title',
    styles: {
      color: 'rgb(255, 255, 255)',
      fontSize: '2rem',
      fontWeight: 'bold',
      display: 'block',
      marginBottom: '1rem',
      cursor: 'text',
      border: 'none',
      outline: 'none',
    },
  });

  // Description styles
  collectedStyles.push({
    className: 'defi-section-description',
    styles: {
      fontSize: '1rem',
      color: 'rgb(204, 204, 204)',
      display: 'block',
      marginBottom: '2rem',
      cursor: 'text',
      border: 'none',
      outline: 'none',
    },
  });

  // Modules container styles
  collectedStyles.push({
    className: 'defi-modules-container',
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      opacity: '0.3',
      pointerEvents: 'none',
      transition: 'opacity 0.3s',
    },
  });

  // Wallet popup styles
  collectedStyles.push({
    className: 'defi-wallet-popup',
    styles: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '1.5rem',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '80%',
      zIndex: '10',
    },
  });

  // Render children
  const headings = children.filter((c) => c.type === 'title' || c.type === 'heading');
  const paragraphs = children.filter((c) => c.type === 'paragraph');
  const modules = children.filter((c) => c.type === 'defiModule');

  // Merge default module content with empty modules
  const mergedModules = modules.map((module, index) => {
    const defaultModule = defaultModules[index];
    if (defaultModule && (!module.content || module.content === '')) {
      return {
        ...module,
        content: JSON.stringify(defaultModule.content),
        moduleType: defaultModule.moduleType
      };
    }
    return module;
  });

  const headingsHtml = headings.map((c) => `
    <div style="position: relative; box-sizing: border-box;">
      <span style="color: rgb(255, 255, 255); font-size: 2rem; font-weight: bold; display: block; margin-bottom: 1rem; cursor: text; border: none; outline: none;">${c.content || ''}</span>
    </div>
  `).join('\n');

  const paragraphsHtml = paragraphs.map((c) => `
    <div style="position: relative; box-sizing: border-box;">
      <span style="font-size: 1rem; color: rgb(204, 204, 204); display: block; margin-bottom: 2rem; cursor: text; border: none; outline: none;">${c.content || ''}</span>
    </div>
  `).join('\n');

  const modulesHtml = mergedModules.map((c) => renderElementToHtml(c, collectedStyles)).join('\n');
  
  return `
    <section id="defi-section" style="${sectionStyle}">
      <div style="text-align: center; margin-bottom: 2rem;">
        ${headingsHtml}
        ${paragraphsHtml}
      </div>
      <div id="defi-not-connected-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 255, 255, 0.1); padding: 1.5rem; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); max-width: 80%; z-index: 10;">
        <div style="font-size: 1.2rem; font-weight: bold; color: rgb(255, 255, 255); margin-bottom: 0.5rem;">Wallet Not Connected</div>
        <div style="font-size: 0.9rem; color: rgb(204, 204, 204); margin-bottom: 1rem;">Please connect your wallet to view DeFi data and interact with this section</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: rgb(76, 175, 80); font-size: 0.9rem;">
          <span>Tip:</span>
          <span>Add a Connect Wallet button to your page / Navbar to enable this section</span>
        </div>
      </div>
      <div id="defi-dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; opacity: 0.3; pointer-events: none; transition: opacity 0.3s; max-width: 1100px; width: 100%; margin: 0 auto;">
        ${modulesHtml}
      </div>
    </section>
  `;
} 