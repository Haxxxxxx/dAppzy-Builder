import React, { useRef, useContext, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import DateComponent from '../../Interact/DateComponent';
import useElementDrop from '../../../utils/useElementDrop';
import withSelectable from '../../../utils/withSelectable';
import { EditableContext } from '../../../context/EditableContext';

// Make elements selectable
const SelectableSpan = withSelectable(Span);
const SelectableImage = withSelectable(Image);
const SelectableButton = withSelectable(Button);
const SelectableDateComponent = withSelectable(DateComponent);

const MintingSection = ({ uniqueId, children = [], setSelectedElement, onDropItem, handlePanelToggle }) => {
  const sectionRef = useRef(null);
  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // Helper functions to get children by type
  const getChildByType = (type) => children.find((child) => child.type === type);
  const getChildrenByType = (type) => children.filter((child) => child.type === type);

  // Extract specific children
  const logo = getChildByType('image');
  const title = getChildByType('title');
  const description = getChildByType('description');
  const timer = getChildByType('timer');
  const mintButton = getChildByType('mint-button');
  const remaining = getChildByType('remaining');
  const value = getChildByType('value');
  const currency = getChildByType('currency');
  const quantity = getChildByType('quantity');
  const totalPrice = getChildByType('price');
  const rareItemsTitle = getChildByType('rareItemsTitle');
  const docItemsTitle = getChildByType('docItemsTitle');
  const rareItems = getChildrenByType('rare-item').slice(0, 4);
  const documentItems = getChildrenByType('document-item').slice(0, 3);

  // Handle section click
  const handleClick = () => {
    setSelectedElement({ id: uniqueId, type: 'candyMachine' });
  };

  useEffect(() => {
    console.log('Children passed to MintingSection:', children);
  }, [children]);
  

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        padding: '2rem',
        backgroundColor: '#14141D',
        color: '#fff',
        alignItems: 'center',
        border: isOverCurrent ? '2px dashed blue' : 'none',
      }}
      onClick={handleClick}
    >
      {/* Left Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1D1C2B',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        {/* Logo */}
        {logo && (
          <SelectableImage
            id={logo.id}
            src={logo.content || 'Default Logo'}
            styles={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '1rem',
            }}
          />
        )}

        {/* Timer */}
        {timer && (
          <SelectableDateComponent
            id={timer.id}
            content={timer.content || 'N/A'}
            label={timer.label || 'Time before minting'}
            styles={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem', display: 'flex' }}
          />
        )}

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '80%' }}>
          {remaining && (
            <SelectableSpan
              id={remaining.id}
              label={remaining.label || 'Remaining'}
              content={remaining.content || '0/0'}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {value && currency && (
            <SelectableSpan
              id={`${value.id}-${currency.id}`}
              label={value.label || 'Price'}
              content={`${value.content || '0'} ${currency.content || 'N/A'}`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {quantity && totalPrice && (
            <SelectableSpan
              id={quantity.id}
              label={quantity.label || 'Quantity'}
              content={`${quantity.content || '0'} (${totalPrice.label || 'Total Price'}: ${totalPrice.content || '0'})`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
        </div>

        {mintButton && (
          <SelectableButton
            id={mintButton.id || `${uniqueId}-mint-button`}
            content={mintButton.content || 'Mint'}
            styles={{
              width: '80%',
              padding: '1rem',
              border: '1px solid #fff',
              borderRadius: '8px',
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          />
        )}
        <SelectableSpan
          id={`${uniqueId}-terms`}
          content="By clicking 'Mint', you agree to our Terms of Service and Privacy Policy"
          styles={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center', marginTop: '0.5rem' }}
        />
      </div>

      {/* Right Section */}
      <div style={{ padding: '1rem' }}>
        {title && (
          <SelectableSpan
            id={title.id}
            content={title.content || 'Default Title'}
            styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}
          />
        )}
        {description && (
          <SelectableSpan
            id={description.id}
            content={description.content || 'Default Description'}
            styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '2rem' }}
          />
        )}
        {rareItemsTitle && (
          <SelectableSpan
            id={rareItemsTitle.id}
            content={rareItemsTitle.content || ''}
            styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
          />
        )}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {rareItems.map((item) => (
            <SelectableImage
              id={item.id}
              src={item.content || 'Default Rare Item'}
              styles={{ width: '80px', height: '80px', borderRadius: '8px' }}
            />
          ))}
        </div>
        {docItemsTitle && (
          <SelectableSpan
            id={docItemsTitle.id}
            content={docItemsTitle.content || ''}
            styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
          />
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {documentItems.map((item) => (
            <SelectableImage
              id={item.id}
              src={item.content || 'Default Document Item'}
              styles={{ width: '80px', height: '80px', borderRadius: '8px' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
