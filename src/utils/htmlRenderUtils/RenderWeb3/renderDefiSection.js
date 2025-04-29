import { renderElementToHtml } from '../../htmlRender';

export function renderDefiSection(element, collectedStyles) {
  const { id, styles = {}, children = [], settings = {} } = element;
  
  // Clean styles for production
  const cleanedStyles = { ...styles };
  delete cleanedStyles.outline;
  delete cleanedStyles.boxShadow;
  
  // Add the styles to collectedStyles
  const className = `element-${id}`;
  collectedStyles.push({ className, styles: cleanedStyles });
  
  // Render children
  const childrenHtml = children
    .map(child => renderElementToHtml(child, collectedStyles))
    .join('');
  
  // Create the section with proper attributes
  const attributes = {
    id,
    class: className,
    'data-type': 'defiSection',
    ...(settings.backgroundImage && { 'data-bg-image': settings.backgroundImage }),
    ...(settings.backgroundVideo && { 'data-bg-video': settings.backgroundVideo })
  };
  
  // Convert attributes object to string
  const attributesString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  // Add DeFi section specific styles
  const defiStyles = `
    .defi-module {
      background: #2A2A3C;
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      color: white;
    }
    .defi-module h3 {
      color: white;
      margin-bottom: 15px;
    }
    .defi-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 0.9em;
      color: #aaa;
    }
    .stat-value {
      font-size: 1.1em;
      font-weight: bold;
    }
    .defi-button {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .defi-button:hover {
      background: #45a049;
    }
  `;

  // Add DeFi section specific JavaScript
  const defiScript = `
    <script>
      function initializeDefiSection() {
        // Handle connect wallet button
        const connectWalletBtn = document.querySelector('.connect-wallet-button');
        if (connectWalletBtn) {
          connectWalletBtn.addEventListener('click', async () => {
            try {
              // Check if wallet is already connected
              if (connectWalletBtn.textContent === 'Disconnect') {
                connectWalletBtn.textContent = 'Connect Wallet';
                updateWalletStatus(false);
                return;
              }
              
              // Simulate wallet connection
              connectWalletBtn.textContent = 'Disconnect';
              updateWalletStatus(true);
              
              // Update DeFi modules with wallet info
              updateDefiModules();
            } catch (error) {
              console.error('Wallet connection failed:', error);
            }
          });
        }

        function updateWalletStatus(connected) {
          const modules = document.querySelectorAll('.defi-module');
          modules.forEach(module => {
            const stats = module.querySelectorAll('.stat-item');
            stats.forEach(stat => {
              if (stat.querySelector('.stat-label').textContent === 'Connected Wallet') {
                stat.querySelector('.stat-value').textContent = connected ? '96Rtfs...jnmW' : 'Not Connected';
              }
            });
          });
        }

        function updateDefiModules() {
          // Update module data based on wallet connection
          const modules = document.querySelectorAll('.defi-module');
          modules.forEach(module => {
            const moduleData = JSON.parse(module.getAttribute('data-module'));
            if (moduleData.moduleType === 'aggregator') {
              // Update aggregator specific data
              updateAggregatorModule(module, moduleData);
            } else if (moduleData.moduleType === 'simulation') {
              // Update simulation specific data
              updateSimulationModule(module, moduleData);
            } else if (moduleData.moduleType === 'bridge') {
              // Update bridge specific data
              updateBridgeModule(module, moduleData);
            }
          });
        }

        function updateAggregatorModule(module, data) {
          // Update aggregator specific stats and pools
          const statsContainer = module.querySelector('.defi-stats');
          if (statsContainer) {
            data.stats.forEach(stat => {
              const statElement = document.createElement('div');
              statElement.className = 'stat-item';
              statElement.innerHTML = \`
                <div class="stat-label">\${stat.label}</div>
                <div class="stat-value">\${stat.value}</div>
              \`;
              statsContainer.appendChild(statElement);
            });
          }
        }

        function updateSimulationModule(module, data) {
          // Update simulation specific stats and strategies
          const statsContainer = module.querySelector('.defi-stats');
          if (statsContainer) {
            data.stats.forEach(stat => {
              const statElement = document.createElement('div');
              statElement.className = 'stat-item';
              statElement.innerHTML = \`
                <div class="stat-label">\${stat.label}</div>
                <div class="stat-value">\${stat.value}</div>
              \`;
              statsContainer.appendChild(statElement);
            });
          }
        }

        function updateBridgeModule(module, data) {
          // Update bridge specific stats and transfers
          const statsContainer = module.querySelector('.defi-stats');
          if (statsContainer) {
            data.stats.forEach(stat => {
              const statElement = document.createElement('div');
              statElement.className = 'stat-item';
              statElement.innerHTML = \`
                <div class="stat-label">\${stat.label}</div>
                <div class="stat-value">\${stat.value}</div>
              \`;
              statsContainer.appendChild(statElement);
            });
          }
        }
      }

      // Initialize when DOM is loaded
      document.addEventListener('DOMContentLoaded', initializeDefiSection);
    </script>
  `;
  
  return `
    <section ${attributesString}>
      <style>${defiStyles}</style>
      ${childrenHtml}
      ${defiScript}
    </section>
  `;
} 