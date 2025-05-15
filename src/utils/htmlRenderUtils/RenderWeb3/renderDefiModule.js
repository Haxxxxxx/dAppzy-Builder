import { renderElementToHtml } from '../../htmlRender';

export function renderDefiModule(element, collectedStyles) {
  console.log('renderDefiModule element:', element);
  
  // Extract content from element
  let moduleContent = element.content;
  if (typeof moduleContent === 'string') {
    try {
      moduleContent = JSON.parse(moduleContent);
    } catch (e) {
      console.log('Module content is string but not JSON:', moduleContent);
      moduleContent = {};
    }
  }

  const { id, styles = {} } = element;
  const className = `defi-module-${id}`;
  
  // Add module styles
  collectedStyles.push({
    className,
    styles: {
      backgroundColor: 'rgb(42, 42, 60)',
      padding: '1.5rem',
      borderRadius: '12px',
      color: 'rgb(255, 255, 255)',
      cursor: 'pointer',
      position: 'relative',
      ...styles,
    },
  });

  // Extract module information
  const {
    title = 'DeFi Aggregator',
    description = '',
    stats = [],
  } = moduleContent;

  // Generate stats HTML
  const statsHtml = stats && stats.length > 0 ? `
    <div style="display: grid; gap: 1rem;">
      ${stats.map(stat => `
        <div style="display: flex; justify-content: space-between;">
          <span style="opacity: 0.8;">${stat.label}</span>
          <span style="font-weight: bold;">${stat.value}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Add connected message placeholder after the title
  const connectedMessageHtml = `<div class="defi-connected-message" style="display:none; margin-top:0.5rem; padding:0.5rem; background-color:rgba(0,255,0,0.1); border-radius:4px; font-size:0.9rem; color:#52c41a;"></div>`;

  // Add error message with a class for JS toggling
  const errorMessageHtml = `<div class="defi-error-message" style="margin-top:0.5rem; padding:0.5rem; background-color:rgba(255,0,0,0.1); border-radius:4px; font-size:0.9rem; color:rgb(255,77,79);">Connect your wallet to view DeFi data</div>`;

  return `
    <div style="position: relative; box-sizing: border-box;">
      <div class="${className}">
        <div style="margin-bottom: 1rem;">
          <h3 style="margin: 0; font-size: 1.2rem; font-weight: bold; color: rgb(255, 255, 255);">${title}</h3>
          ${connectedMessageHtml}
          ${errorMessageHtml}
        </div>
        ${statsHtml}
      </div>
    </div>
  `;
} 