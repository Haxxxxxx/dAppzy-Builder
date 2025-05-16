import React, { forwardRef } from 'react';

export const DeFiModule = forwardRef(({ id, type, content, styles, children, handleOpenMediaPanel, handleSelect }, ref) => {
  return (
    <div 
      ref={ref} 
      id={id} 
      style={{
        backgroundColor: '#2A2A2A',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        ...styles
      }}
      onClick={handleSelect}
    >
      {content?.title && <h3 style={{ margin: '0 0 10px 0', color: '#FFFFFF' }}>{content.title}</h3>}
      {content?.description && <p style={{ margin: '0', color: '#CCCCCC' }}>{content.description}</p>}
      {children}
    </div>
  );
});

export { default as MintingModule } from '../Sections/Web3Related/MintingModule'; 