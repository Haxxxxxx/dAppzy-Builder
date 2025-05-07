import React, { useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, DateComponent } from '../../SelectableElements';
import { mintingSectionStyles } from './DefaultWeb3Styles';
import useElementDrop from '../../../utils/useElementDrop';
import CircularProgressCustomImage from './CircularProgressCustomImage';

/**
 * MintingSection component for rendering and managing minting functionality.
 * Supports drag and drop, quantity controls, and linked value updates.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.handleSelect - Function to handle element selection
 * @param {string} props.uniqueId - Unique identifier for the minting section
 * @param {Function} props.onDropItem - Function to handle item drops
 * @param {Function} props.handleOpenMediaPanel - Function to handle media panel opening
 */
const MintingSection = ({
  handleSelect,
  uniqueId,
  onDropItem,
  handleOpenMediaPanel,
}) => {
  const { elements, updateContent } = useContext(EditableContext);
  const sectionRef = useRef(null);
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // Filter out child elements for this section with memoization
  const childElements = useMemo(() => 
    elements.filter((el) => el.parentId === uniqueId),
    [elements, uniqueId]
  );

  // Helper functions to retrieve child elements by type with memoization
  const getChildByType = useCallback((type) => 
    childElements.find((child) => child.type === type),
    [childElements]
  );

  const getChildrenByType = useCallback((type) => 
    childElements.filter((child) => child.type === type),
    [childElements]
  );

  // Retrieve elements with memoization
  const {
    logo,
    timer,
    remaining,
    value,
    currency,
    quantity,
    totalPrice,
    title,
    description,
    mintButton,
    rareItemsTitle,
    docItemsTitle,
    rareItems,
    documentItems
  } = useMemo(() => ({
    logo: getChildByType('image'),
    timer: getChildByType('timer'),
    remaining: getChildByType('remaining'),
    value: getChildByType('value'),
    currency: getChildByType('currency'),
    quantity: getChildByType('quantity'),
    totalPrice: getChildByType('price'),
    title: getChildByType('title'),
    description: getChildByType('description'),
    mintButton: getChildByType('button'),
    rareItemsTitle: getChildByType('rareItemsTitle'),
    docItemsTitle: getChildByType('docItemsTitle'),
    rareItems: getChildrenByType('rare-item'),
    documentItems: getChildrenByType('document-item')
  }), [getChildByType, getChildrenByType]);

  // Calculate progress with memoization
  const calculateProgress = useCallback((remainingContent) => {
    if (!remainingContent || !remainingContent.includes('/')) return 0;
    const [available, total] = remainingContent.split('/').map(num => parseInt(num.trim(), 10));
    const minted = total - available;
    return (minted / total) * 100;
  }, []);

  const progressPercentage = useMemo(() => 
    remaining ? calculateProgress(remaining.content) : 0,
    [remaining, calculateProgress]
  );

  // Function to update linked values when quantity changes with validation
  const updateLinkedValues = useCallback((newQuantity) => {
    if (!value || !currency || !totalPrice || !remaining) return;

    // Validate and parse values
    const basePrice = parseFloat(value.content) || 0;
    const maxQuantity = parseInt(remaining.content.split('/')[1], 10) || 0;
    
    // Ensure quantity doesn't exceed available supply
    const validatedQuantity = Math.min(Math.max(0, newQuantity), maxQuantity);
    
    // Calculate and update total price
    const computedTotal = basePrice * validatedQuantity;
    updateContent(totalPrice.id, `${computedTotal} ${currency.content}`);

    // Update remaining global quantity
    if (remaining.content.includes('/')) {
      const [_, totalSupplyStr] = remaining.content.split('/');
      const totalSupply = parseInt(totalSupplyStr.trim(), 10);
      const newAvailable = totalSupply - validatedQuantity;
      updateContent(remaining.id, `${newAvailable}/${totalSupply}`);
    }
  }, [value, currency, totalPrice, remaining, updateContent]);

  // Handlers for incrementing and decrementing the quantity with validation
  const handleIncrement = useCallback(() => {
    if (!quantity) return;
    const currentValue = parseInt(quantity.content, 10) || 0;
    const maxQuantity = parseInt(remaining?.content?.split('/')[1], 10) || 0;
    const newValue = Math.min(currentValue + 1, maxQuantity);
    updateContent(quantity.id, newValue.toString());
    updateLinkedValues(newValue);
  }, [quantity, remaining, updateContent, updateLinkedValues]);

  const handleDecrement = useCallback(() => {
    if (!quantity) return;
    const currentValue = parseInt(quantity.content, 10) || 0;
    const newValue = Math.max(0, currentValue - 1);
    updateContent(quantity.id, newValue.toString());
    updateLinkedValues(newValue);
  }, [quantity, updateContent, updateLinkedValues]);

  // Handle keyboard controls for quantity
  const handleQuantityKeyPress = useCallback((e) => {
    if (e.key === 'ArrowUp' || e.key === '+') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown' || e.key === '-') {
      e.preventDefault();
      handleDecrement();
    }
  }, [handleIncrement, handleDecrement]);

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={{
        ...mintingSectionStyles.section,
        border: isOverCurrent ? '2px dashed blue' : 'none',
      }}
      onClick={handleSelect}
      role="region"
      aria-label="Minting Section"
    >
      {/* Left Section */}
      <div 
        style={mintingSectionStyles.leftSection}
        role="complementary"
        aria-label="Minting Controls"
      >
        {logo && (
          <CircularProgressCustomImage
            id={logo.id}
            src={logo.content}
            styles={mintingSectionStyles.logo}
            handleOpenMediaPanel={handleOpenMediaPanel}
            progress={progressPercentage}
            aria-label="NFT Collection Logo"
          />
        )}

        {timer && (
          <DateComponent
            id={timer.id}
            content={timer.content}
            label={timer.label}
            styles={mintingSectionStyles.timer}
            aria-label="Minting Countdown"
          />
        )}
        
        <div style={mintingSectionStyles.details}>
          {remaining && (
            <Span
              id={remaining.id}
              label={remaining.label}
              content={remaining.content}
              styles={mintingSectionStyles.remaining}
              aria-label={`${remaining.label}: ${remaining.content}`}
            />
          )}
          {value && currency && (
            <Span
              id={`${value.id}-${currency.id}`}
              content={`${value.content} ${currency.content}`}
              label={value.label}
              styles={mintingSectionStyles.price}
              aria-label={`${value.label}: ${value.content} ${currency.content}`}
            />
          )}
          {quantity && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
              role="group"
              aria-label="Quantity Controls"
            >
              <span style={{ fontSize: '1rem', color: '#aaa' }}>
                {quantity.label}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <button
                  onClick={handleDecrement}
                  onKeyPress={handleQuantityKeyPress}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: '800',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Decrease Quantity"
                  disabled={parseInt(quantity.content, 10) <= 0}
                >
                  -
                </button>
                <Span
                  id={quantity.id}
                  content={quantity.content}
                  styles={mintingSectionStyles.quantity}
                  aria-label={`Current Quantity: ${quantity.content}`}
                />
                <button
                  onClick={handleIncrement}
                  onKeyPress={handleQuantityKeyPress}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: '800',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Increase Quantity"
                  disabled={parseInt(quantity.content, 10) >= parseInt(remaining?.content?.split('/')[1], 10)}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {totalPrice && (
            <Span
              id={totalPrice.id}
              label={totalPrice.label}
              content={`${totalPrice.label}: ${totalPrice.content}`}
              styles={mintingSectionStyles.quantity}
              aria-label={`${totalPrice.label}: ${totalPrice.content}`}
            />
          )}
        </div>
        {mintButton && (
          <Button
            id={mintButton.id}
            content={mintButton.content}
            styles={mintingSectionStyles.mintButton}
            aria-label="Mint NFT"
          />
        )}
      </div>

      {/* Right Section */}
      <div 
        style={mintingSectionStyles.rightSection}
        role="complementary"
        aria-label="Collection Information"
      >
        <div style={mintingSectionStyles.rightSectionHeader}>
          {title && (
            <Span
              id={title.id}
              content={title.content}
              styles={mintingSectionStyles.title}
              aria-label={`Collection Title: ${title.content}`}
            />
          )}
          {description && (
            <Span
              id={description.id}
              content={description.content}
              styles={mintingSectionStyles.description}
              aria-label={`Collection Description: ${description.content}`}
            />
          )}
          {rareItemsTitle && (
            <Span
              id={rareItemsTitle.id}
              content={rareItemsTitle.content}
              styles={mintingSectionStyles.sectionTitle}
              aria-label={`${rareItemsTitle.content} Section`}
            />
          )}
        </div>
        <div 
          style={mintingSectionStyles.itemsContainer}
          role="list"
          aria-label="Rare Items Gallery"
        >
          {rareItems.map((item, index) => (
            <Image
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
              aria-label={`Rare Item ${index + 1}`}
            />
          ))}
        </div>
        {docItemsTitle && (
          <Span
            id={docItemsTitle.id}
            content={docItemsTitle.content}
            styles={mintingSectionStyles.sectionTitle}
            aria-label={`${docItemsTitle.content} Section`}
          />
        )}
        <div 
          style={mintingSectionStyles.itemsContainer}
          role="list"
          aria-label="Document Items Gallery"
        >
          {documentItems.map((item, index) => (
            <Image
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
              aria-label={`Document Item ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
