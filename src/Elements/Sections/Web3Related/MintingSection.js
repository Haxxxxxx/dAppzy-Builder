import React, { useRef, useContext, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import DateComponent from '../../Interact/DateComponent';
import RemovableWrapper from '../../../utils/RemovableWrapper';
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const MintingSection = ({ uniqueId, children = [], setSelectedElement, onDropItem, handlePanelToggle }) => {
  const sectionRef = useRef(null);
  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });
  const { elements } = useContext(EditableContext);

  // Helper function to get a child by type
  const getChildByType = (type) => children.find((child) => child.type === type);
  const getChildrenByType = (type) => children.filter((child) => child.type === type);

  // Extract specific children
  const logo = getChildByType('image');
  const title = getChildByType('title');
  const description = getChildByType('description');
  const timer = getChildByType('timer');
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
    handlePanelToggle('settings');
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
          <RemovableWrapper id={logo.id}>
            <div
              style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <Image
                id={logo.id}
                src={logo.content || 'Default Logo'}
                styles={{ width: '160px', height: '160px', borderRadius: '50%', overflow:'hidden', objectFit:'cover'}}
              />
            </div>
          </RemovableWrapper>
        )}

        {/* Timer */}
        {timer && (
          <RemovableWrapper id={timer.id}>
            <DateComponent
              id={timer.id}
              content={timer.content || 'N/A'}
              label={timer.label || 'Time before minting'}
              styles={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem', display:'flex' }}
            />
          </RemovableWrapper>
        )}

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0', gap: '1vh', width:'80%', alignContent:'space-between'}}>
          {remaining && (
            <Span
              id={remaining.id}
              label={remaining.label || 'Remaining'}
              content={remaining.content || '0/0'}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {value && currency && (
            <Span
              id={`${value.id}-${currency.id}`}
              label={value.label || 'Price'}
              content={`${value.content || '0'} ${currency.content || 'N/A'}`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {quantity && totalPrice && (
            <Span
              id={totalPrice.id}
              label={totalPrice.label || 'Quantity'}
              content={`${totalPrice.content || '0'} (${totalPrice.label || 'Total Price'}: ${totalPrice.content || '0'})`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {quantity && (
            <Span
              id={quantity.id}
              label={quantity.label || 'Quantity'}
              content={`${quantity.content || '0'} (${totalPrice.label || 'Total Price'}: ${totalPrice.content || '0'})`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}

        </div>

        {/* Mint Button */}
        <Button
          id={`${uniqueId}-mint-button`}
          content="Mint"
          styles={{
            width: '80%',
            padding: '1rem',
            border: '1px solid #fff',
            borderRadius: '8px',
            color: '#fff',
            backgroundColor :'rgba(255, 255, 255, 0.1)',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        />
        <Span
          id={`${uniqueId}-terms`}
          content="By clicking 'Mint', you agree to our Terms of Service and Privacy Policy"
          styles={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center', marginTop: '0.5rem' }}
        />
      </div>

      {/* Right Section */}
      <div style={{ padding: '1rem' }}>
        {title && (
          <RemovableWrapper id={title.id}>
            <Span
              id={title.id}
              content={title.content || 'Default Title'}
              styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}
            />
          </RemovableWrapper>
        )}
        {description && (
          <RemovableWrapper id={description.id}>
            <Span
              id={description.id}
              content={description.content || 'Default Description'}
              styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '2rem' }}
            />
          </RemovableWrapper>
        )}
        <Span
          id={rareItemsTitle?.id}
          content={rareItemsTitle?.content || ''}
          styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {rareItems.map((item) => (
            <RemovableWrapper key={item.id} id={item.id}>
              <Image id={item.id} src={item.content || 'Default Rare Item'} styles={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            </RemovableWrapper>
          ))}
        </div>
        <Span
          id={docItemsTitle?.id}
          content={docItemsTitle?.content || ''}
          styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {documentItems.map((item) => (
            <RemovableWrapper key={item.id} id={item.id}>
              <Image id={item.id} src={item.content || 'Default Document Item'} styles={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            </RemovableWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
