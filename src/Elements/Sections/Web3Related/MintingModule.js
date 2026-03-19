import React, { useContext, forwardRef, useState } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { defaultMintingStyles } from './defaultMintingStyles';
import { getMintingModuleLabel, getMintingModuleDefaults } from '../../../constants/mintingModuleTypes';

const MintingModule = forwardRef(({
  id,
  content,
  styles,
  moduleType: propModuleType,
}, ref) => {
  const { elements, findElementById } = useContext(EditableContext);
  const { isConnected: contextConnected } = useWalletContext();

  const moduleElement = findElementById(id, elements);
  const moduleType = moduleElement?.moduleType || propModuleType || 'minting';
  const defaults = getMintingModuleDefaults(moduleType);

  // Normalize content: handle string (legacy), object, or fallback to defaults
  const rawContent = moduleElement?.content || content;
  const moduleContent = typeof rawContent === 'string'
    ? (() => { try { return JSON.parse(rawContent); } catch { return {}; } })()
    : (rawContent || {});

  const moduleSettings = moduleContent?.settings || defaults.defaultSettings;
  const connected = contextConnected;

  const [quantity, setQuantity] = useState(1);
  const maxQuantity = moduleSettings?.maxQuantity || 10;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const mergedStyles = {
    ...defaultMintingStyles.mintingModule,
    ...(moduleElement?.styles || styles || {}),
  };

  if (!id) return null;

  // Respect the enabled flag
  const isEnabled = moduleContent.enabled !== false;

  // Get display data with defaults
  const title = moduleContent.title || getMintingModuleLabel(moduleType);
  const description = moduleContent.description || defaults.description;
  const stats = moduleContent.stats || defaults.defaultStats;
  const items = moduleContent.items || defaults.defaultItems || [];

  // Calculate price display for minting modules
  const priceStr = stats?.find(s => s.label === 'Price')?.value || '1.5 SOL';
  const priceParts = priceStr.split(' ');
  const priceNum = parseFloat(priceParts[0]) || 0;
  const priceCurrency = priceParts[1] || 'SOL';
  const totalPrice = `${(priceNum * quantity).toFixed(2)} ${priceCurrency}`;

  return (
    <div
      id={id}
      ref={ref}

      style={{
        ...mergedStyles,
        color: '#ffffff',
        ...(!isEnabled ? { opacity: 0.4, pointerEvents: 'auto' } : {}),
      }}
    >
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 10px 0', color: '#fff' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '0 0 20px 0', color: '#ccc', fontSize: '1rem', lineHeight: '1.5' }}>
          {description}
        </p>
      )}

      {/* Stats grid */}
      {moduleSettings?.showStats !== false && stats?.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
              padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px',
            }}>
              <span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </span>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Minting module — quantity selector + mint button */}
      {moduleType === 'minting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleQuantityChange(quantity - 1); }}
              disabled={quantity <= 1}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #5C4EFA, #7B6CFF)', color: 'white',
                opacity: quantity <= 1 ? 0.5 : 1,
              }}
            >
              -
            </button>
            <span style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>{quantity}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleQuantityChange(quantity + 1); }}
              disabled={quantity >= maxQuantity}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #5C4EFA, #7B6CFF)', color: 'white',
                opacity: quantity >= maxQuantity ? 0.5 : 1,
              }}
            >
              +
            </button>
          </div>

          {moduleSettings?.showButton !== false && (
            <button
        
              style={defaultMintingStyles.mintingButton}
            >
              {connected ? `Mint ${quantity} NFT(s) for ${totalPrice}` : 'Connect Wallet to Mint'}
            </button>
          )}
        </div>
      )}

      {/* Gallery module — image grid */}
      {moduleType === 'gallery' && items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${moduleSettings?.columnMinWidth || '200px'}, 1fr))`,
          gap: '16px',
        }}>
          {items.map((item, index) => (
            <div key={index} style={{ position: 'relative', aspectRatio: '1' }}>
              <img
                src={item.content}
                alt={`Item ${index + 1}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Documents module — document grid */}
      {moduleType === 'documents' && items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${moduleSettings?.columnMinWidth || '150px'}, 1fr))`,
          gap: '16px',
        }}>
          {items.map((item, index) => (
            <div key={index} style={{ position: 'relative', aspectRatio: '1' }}>
              <img
                src={item.content}
                alt={`Document ${index + 1}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

MintingModule.displayName = 'MintingModule';

export default MintingModule;
