import React, { useRef, useContext, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import DateComponent from '../../Interact/DateComponent';
import RemovableWrapper from '../../../utils/RemovableWrapper';
import useElementDrop from '../../../utils/useElementDrop';
import { EditableContext } from '../../../context/EditableContext';

const MintingSection = ({ uniqueId, children = [], setSelectedElement, onDropItem }) => {
  const sectionRef = useRef(null);
  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });
  const { elements } = useContext(EditableContext); // Access updated content

  // Helper function to get child by type
  const getChildByType = (type) => children.find((child) => child.type === type);
  const getChildrenByType = (type) => children.filter((child) => child.type === type);
  const titleContent = elements?.find(el => el.id === `${uniqueId}-4`)?.content || 'Default Collection Title'; // Fallback

  // Extract specific children
  const logo = getChildByType('image'); // Logo is the first image
  const title = elements.find(
    (el) => el.parentId === uniqueId && el.type === 'title'
  );
  const description = children.find((child) => child.type === 'description'); // Description
  const timer = getChildByType('timer');
  const remaining = getChildByType('remaining');
  const value = getChildByType('value');
  const currency = getChildByType('currency');
  const quantity = getChildByType('quantity');
  const rareItemsTitle = getChildByType('rareItemsTitle');
  const docItemsTitle = getChildByType('docItemsTitle');
  const totalPrice = getChildByType('price');
  const rareItems = getChildrenByType('rare-item').slice(1, 4); // Rare items
  const documentItems = getChildrenByType('document-item').slice(1, 3); // Document items


  const handleClick = () => {
    console.log("Selected Candy Machine Element:", uniqueId);
    setSelectedElement({ id: uniqueId, type: 'candyMachine' });
  };

  useEffect(() => {
    console.log('Elements state:', elements);
  }, [elements]);

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
        borderRadius: '12px',
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
              <Image id={logo.id} src={elements.find(el => el.id === `${uniqueId}-3`)?.content || logo.content} styles={{ width: '160px', height: '160px', borderRadius: '8px' }} />
            </div>
          </RemovableWrapper>
        )}
        {/* Timer */}
        {timer && (
          <RemovableWrapper id={timer.id}>
            <DateComponent
              id={timer.id}
              content={`Mint starting in... ${elements.find(el => el.id === `${uniqueId}-6`)?.content || timer.content}`}
              styles={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}
            />
          </RemovableWrapper>
        )}
        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0', gap: '1vh', }}>
          {remaining && (
            <Span
              id={remaining.id}
              content={`Remaining: ${elements.find(el => el.id === `${uniqueId}-7`)?.content || remaining.content}`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {value && currency && (
            <Span
              id={`${value.id}-${currency.id}`}
              content={`Price: ${elements.find(el => el.id === `${uniqueId}-8`)?.content || value.content} ${currency.content}`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
          {quantity && totalPrice && (
            <Span
              id={quantity.id}
              content={`Quantity: ${elements.find(el => el.id === `${uniqueId}-10`)?.content || quantity.content} (${totalPrice.content})`}
              styles={{ fontSize: '1rem', color: '#ccc', display: 'block' }}
            />
          )}
        </div>
        {/* Mint Button */}
        <Button
          id={`${uniqueId}-mint-button`}
          content="Mint"
          styles={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'transparent',
            border: '1px solid #fff',
            borderRadius: '8px',
            color: '#fff',
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
              content={titleContent}
              styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}
            />
          </RemovableWrapper>
        )}
        {description && (
          <RemovableWrapper id={description.id}>
            <Span
              id={description.id}
              content={elements.find(el => el.id === `${uniqueId}-5`)?.content || description.content}
              styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '2rem' }}
            />
          </RemovableWrapper>
        )}
        <Span
          id={rareItemsTitle.id}
          content={rareItemsTitle.content}
          styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {rareItems.map((item, index) => (
            <RemovableWrapper key={index} id={item.id}>
              <Image id={item.id} src={item.content} styles={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            </RemovableWrapper>
          ))}
        </div>
        <Span
          id={docItemsTitle.id}
          content={docItemsTitle.content}
          styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {documentItems.map((item, index) => (
            <RemovableWrapper key={index} id={item.id}>
              <Image id={item.id} src={item.content} styles={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            </RemovableWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
