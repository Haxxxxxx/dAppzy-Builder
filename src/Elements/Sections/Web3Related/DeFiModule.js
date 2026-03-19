import React, { useContext, forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { defaultDeFiStyles } from './defaultDeFiStyles';
import { getModuleLabel, getModuleDefaults } from '../../../constants/defiModuleTypes';
import { fetchTokenPrices } from '../../../services/coinGeckoService';

const DEFAULT_TRACKED_TOKENS = ['bitcoin', 'ethereum', 'solana'];
const PRICE_REFRESH_MS = 60_000;

const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price);
const formatChange = (change) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

const DeFiModule = forwardRef(({
  id,
  content,
  styles,
  isConnected,
  moduleType: propModuleType,
}, ref) => {
  const { elements, findElementById } = useContext(EditableContext);
  const { isConnected: contextConnected } = useWalletContext();

  const moduleElement = findElementById(id, elements);
  const moduleType = moduleElement?.moduleType || propModuleType || 'aggregator';
  const defaults = getModuleDefaults(moduleType);

  // Normalize content: handle string (legacy), object, or fallback to defaults
  const rawContent = moduleElement?.content || content;
  const moduleContent = typeof rawContent === 'string'
    ? (() => { try { return JSON.parse(rawContent); } catch { return {}; } })()
    : (rawContent || {});

  const moduleSettings = moduleContent?.settings || defaults.defaultSettings;
  const connected = isConnected ?? contextConnected;

  // Live price data for aggregator modules
  const [liveStats, setLiveStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const intervalRef = useRef(null);

  const loadPrices = useCallback(async () => {
    if (moduleType !== 'aggregator') return;
    const tokens = moduleSettings?.selectedTokens?.length > 0
      ? moduleSettings.selectedTokens
      : DEFAULT_TRACKED_TOKENS;
    setIsLoading(true);
    try {
      const prices = await fetchTokenPrices(tokens);
      const stats = Object.entries(prices).map(([tokenId, data]) => ({
        tokenId,
        label: tokenId.charAt(0).toUpperCase() + tokenId.slice(1),
        value: `${formatPrice(data.price)} (${formatChange(data.change24h)})`,
        change24h: data.change24h,
      }));
      if (stats.length > 0) {
        setLiveStats(stats);
        setFetchError(null);
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [moduleType, moduleSettings?.selectedTokens]);

  useEffect(() => {
    if (moduleType === 'aggregator') {
      loadPrices();
      intervalRef.current = setInterval(loadPrices, PRICE_REFRESH_MS);
      return () => clearInterval(intervalRef.current);
    }
  }, [moduleType, loadPrices]);

  const mergedStyles = {
    ...defaultDeFiStyles.defiModule,
    ...(moduleElement?.styles || styles || {}),
  };

  if (!id) return null;

  // Respect the enabled flag — render a dimmed placeholder in the builder
  const isEnabled = moduleContent.enabled !== false;

  return (
    <div
      id={id}
      ref={ref}
      style={{
        ...mergedStyles,
        ...(!isEnabled ? { opacity: 0.4, pointerEvents: 'auto' } : {}),
      }}
    >
      <div style={defaultDeFiStyles.defiModuleContent}>
        <h3 style={defaultDeFiStyles.defiModuleTitle}>
          {moduleContent.title || getModuleLabel(moduleType)}
        </h3>
        <p style={defaultDeFiStyles.defiModuleDescription}>
          {moduleContent.description || defaults.description}
        </p>
        {moduleSettings.showStats && (() => {
          const displayStats = (moduleType === 'aggregator' && liveStats) ? liveStats : (moduleContent.stats || defaults.defaultStats);
          if (!displayStats) return null;
          return (
            <div style={defaultDeFiStyles.defiModuleStats}>
              {isLoading && !liveStats ? (
                [0, 1, 2].map(i => (
                  <div key={i} style={{ ...defaultDeFiStyles.defiModuleStat, animation: 'pulse 1.5s ease-in-out infinite' }}>
                    <span style={{ ...defaultDeFiStyles.defiModuleStatLabel, opacity: 0.4 }}>Loading...</span>
                    <span style={{ ...defaultDeFiStyles.defiModuleStatValue, opacity: 0.4 }}>--</span>
                  </div>
                ))
              ) : (
                displayStats.map((stat, index) => (
                  <div key={index} style={defaultDeFiStyles.defiModuleStat}>
                    <span style={defaultDeFiStyles.defiModuleStatLabel}>{stat.label}</span>
                    <span style={{
                      ...defaultDeFiStyles.defiModuleStatValue,
                      color: stat.change24h != null
                        ? (stat.change24h >= 0 ? '#52c41a' : '#ff4d4f')
                        : '#fff',
                    }}>{stat.value}</span>
                  </div>
                ))
              )}
              {fetchError && (
                <div style={{ fontSize: '0.75rem', color: '#faad14', padding: '4px 8px', textAlign: 'center' }}>
                  Data may be stale
                  <button onClick={loadPrices} style={{ marginLeft: 8, background: 'none', border: '1px solid #faad14', color: '#faad14', borderRadius: 4, cursor: 'pointer', fontSize: '0.7rem', padding: '2px 6px' }}>Refresh</button>
                </div>
              )}
            </div>
          );
        })()}
        {moduleSettings.showButton && (
          <button
            style={{
              ...defaultDeFiStyles.defiModuleButton,
              backgroundColor: moduleSettings.customColor || '#2A2A3C',
            }}
          >
            {connected ? 'Connected' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </div>
  );
});

DeFiModule.displayName = 'DeFiModule';

export default DeFiModule;
