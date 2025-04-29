export function renderDefiModule(element, collectedStyles) {
  const { id, moduleType, title, stats = [], settings = {}, functionality = {}, topPools = [], strategies = [], recentTransfers = [] } = element;
  
  // Create module data object
  const moduleData = {
    id,
    moduleType,
    title,
    stats,
    settings,
    functionality,
    topPools,
    strategies,
    recentTransfers
  };

  // Create stats HTML
  const statsHtml = stats.map(stat => `
    <div class="stat-item">
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
    </div>
  `).join('');

  // Create module specific content
  let moduleContent = '';
  if (moduleType === 'aggregator' && topPools.length > 0) {
    moduleContent = `
      <div class="top-pools">
        <h4>Top Pools</h4>
        ${topPools.map(pool => `
          <div class="pool-item">
            <span>${pool.name}</span>
            <span>APY: ${pool.apy}</span>
            <span>TVL: ${pool.tvl}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (moduleType === 'simulation' && strategies.length > 0) {
    moduleContent = `
      <div class="strategies">
        <h4>Investment Strategies</h4>
        ${strategies.map(strategy => `
          <div class="strategy-item">
            <span>${strategy.name}</span>
            <span>APY: ${strategy.apy}</span>
            <span>Risk: ${strategy.risk}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (moduleType === 'bridge' && recentTransfers.length > 0) {
    moduleContent = `
      <div class="recent-transfers">
        <h4>Recent Transfers</h4>
        ${recentTransfers.map(transfer => `
          <div class="transfer-item">
            <span>${transfer.fromChain} → ${transfer.toChain}</span>
            <span>${transfer.amount}</span>
            <span>${transfer.status}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
    <div class="defi-module" data-module='${JSON.stringify(moduleData)}'>
      <h3>${title}</h3>
      <div class="defi-stats">
        ${statsHtml}
      </div>
      ${moduleContent}
      ${settings.showButton ? `<button class="defi-button">View Details</button>` : ''}
    </div>
  `;
} 