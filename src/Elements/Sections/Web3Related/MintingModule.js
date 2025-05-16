import React, { useState, useEffect } from 'react';
import { Image, Span, Button, Heading, Paragraph, Div } from '../../SelectableElements';

const MintingModule = ({
  id,
  content,
  styles,
  configuration,
  handleSelect,
  handleOpenMediaPanel,
  isConnected,
  isSigned,
  requireSignature
}) => {
  const [mintingData, setMintingData] = useState({
    totalSupply: content?.stats?.[0]?.value || '10,000',
    minted: content?.stats?.[1]?.value || '0',
    price: content?.stats?.[2]?.value || '1.5 SOL',
    timeLeft: content?.stats?.[3]?.value || '24:00:00'
  });

  const [quantity, setQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);

  // Handle quantity changes
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Handle minting process
  const handleMint = async () => {
    if (!isConnected) {
      console.log('Please connect your wallet first');
      return;
    }

    if (requireSignature && !isSigned) {
      console.log('Please sign the transaction');
      return;
    }

    setIsMinting(true);
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Minting ${quantity} NFT(s)...`);
      // Add actual minting logic here
    } catch (error) {
      console.error('Minting failed:', error);
    } finally {
      setIsMinting(false);
    }
  };

  // Calculate total price
  const totalPrice = `${parseFloat(mintingData.price.split(' ')[0]) * quantity} ${mintingData.price.split(' ')[1]}`;

  return (
    <Div
      id={id}
      style={{
        ...styles,
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: content?.settings?.customColor || '#2A2A3C',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      onClick={handleSelect}
    >
      {content?.title && (
        <Heading level={2} style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
          {content.title}
        </Heading>
      )}
      
      {content?.description && (
        <Paragraph style={{ fontSize: '16px', margin: 0, opacity: 0.8 }}>
          {content.description}
        </Paragraph>
      )}

      {content?.settings?.showStats && (
        <Div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {content.stats.map((stat, index) => (
            <Div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Span style={{ fontSize: '14px', opacity: 0.6 }}>{stat.label}</Span>
              <Span style={{ fontSize: '18px', fontWeight: '500' }}>{stat.value}</Span>
            </Div>
          ))}
        </Div>
      )}

      {content?.moduleType === 'minting' && (
        <Div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                opacity: quantity <= 1 ? 0.5 : 1
              }}
            >
              -
            </Button>
            <Span style={{ fontSize: '18px', fontWeight: '500' }}>{quantity}</Span>
            <Button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 10}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                opacity: quantity >= 10 ? 0.5 : 1
              }}
            >
              +
            </Button>
          </Div>

          {content?.settings?.showButton && (
            <Button
              onClick={handleMint}
              disabled={!isConnected || (requireSignature && !isSigned) || isMinting}
              style={{
                padding: '16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!isConnected || (requireSignature && !isSigned) || isMinting) ? 'not-allowed' : 'pointer',
                opacity: (!isConnected || (requireSignature && !isSigned) || isMinting) ? 0.5 : 1
              }}
            >
              {isMinting ? 'Minting...' : `Mint ${quantity} NFT(s) for ${totalPrice}`}
            </Button>
          )}
        </Div>
      )}

      {content?.moduleType === 'gallery' && content?.items && (
        <Div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {content.items.map((item, index) => (
            <Div key={index} style={{ position: 'relative', aspectRatio: '1' }}>
              <Image
                src={item.content}
                alt={`Rare item ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                onClick={() => handleOpenMediaPanel && handleOpenMediaPanel(item.content)}
              />
            </Div>
          ))}
        </Div>
      )}

      {content?.moduleType === 'documents' && content?.items && (
        <Div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {content.items.map((item, index) => (
            <Div key={index} style={{ position: 'relative', aspectRatio: '1' }}>
              <Image
                src={item.content}
                alt={`Document ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                onClick={() => handleOpenMediaPanel && handleOpenMediaPanel(item.content)}
              />
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
};

export default MintingModule; 