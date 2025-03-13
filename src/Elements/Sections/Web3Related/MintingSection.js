import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Image, Span, Button, DateComponent } from '../../SelectableElements';
import { mintingSectionStyles } from './DefaultWeb3Styles';
import useElementDrop from '../../../utils/useElementDrop';
import CircularProgressCustomImage from './CircularProgressCustomImage';
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

  // Filter out child elements for this section.
  const childElements = elements.filter((el) => el.parentId === uniqueId);

  // Helper functions to retrieve child elements by type.
  const getChildByType = (type) => childElements.find((child) => child.type === type);
  const getChildrenByType = (type) => childElements.filter((child) => child.type === type);

  // Retrieve elements.
  const logo = getChildByType('image');
  const timer = getChildByType('timer');
  const remaining = getChildByType('remaining');
  const value = getChildByType('value');
  const currency = getChildByType('currency');
  const quantity = getChildByType('quantity');
  const totalPrice = getChildByType('price');
  const title = getChildByType('title');
  const description = getChildByType('description');
  const mintButton = getChildByType('button');
  const rareItemsTitle = getChildByType('rareItemsTitle');
  const docItemsTitle = getChildByType('docItemsTitle');
  const rareItems = getChildrenByType('rare-item');
  const documentItems = getChildrenByType('document-item');

  useEffect(() => {
    console.log('MintingSection: childElements =', childElements);
  }, [childElements]);

  // Function to update linked values when quantity changes.
  const updateLinkedValues = (newQuantity) => {
    // Calculate and update total price.
    const basePrice = parseFloat(value.content) || 0;
    const computedTotal = basePrice * newQuantity;
    updateContent(totalPrice.id, `${computedTotal} ${currency.content}`);

    // Update remaining global quantity.
    // Assuming remaining.content is in the format "available/total" (e.g., "1000/1000")
    if (remaining && remaining.content.includes('/')) {
      const [_, totalSupplyStr] = remaining.content.split('/');
      const totalSupply = parseInt(totalSupplyStr.trim(), 10);
      const newAvailable = totalSupply - newQuantity;
      updateContent(remaining.id, `${newAvailable}/${totalSupply}`);
    }
  };

  // Assume remaining.content is in the format "available/total", e.g., "900/1000"
  const calculateProgress = (remainingContent) => {
    if (!remainingContent || !remainingContent.includes('/')) return 0;
    const [available, total] = remainingContent.split('/').map(num => parseInt(num.trim(), 10));
    // For a progress that fills as tokens are minted:
    const minted = total - available;
    return (minted / total) * 100;
  };

  // Inside your MintingSection component, for example:
  const progressPercentage = remaining ? calculateProgress(remaining.content) : 0;

  // Handlers for incrementing and decrementing the quantity.
  const handleIncrement = () => {
    const currentValue = parseInt(quantity.content, 10) || 0;
    const newValue = currentValue + 1;
    updateContent(quantity.id, newValue.toString());
    updateLinkedValues(newValue);
  };

  const handleDecrement = () => {
    const currentValue = parseInt(quantity.content, 10) || 0;
    const newValue = currentValue > 0 ? currentValue - 1 : 0;
    updateContent(quantity.id, newValue.toString());
    updateLinkedValues(newValue);
  };

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
    >
      {/* Left Section */}
      <div style={mintingSectionStyles.leftSection}>
        {logo && (
          <CircularProgressCustomImage
            id={logo.id}
            src={logo.content}
            styles={mintingSectionStyles.logo}
            handleOpenMediaPanel={handleOpenMediaPanel}
            progress={progressPercentage}

          />
        )}

        {timer && (
          <DateComponent
            id={timer.id}
            content={timer.content}
            label={timer.label}
            styles={mintingSectionStyles.timer}
          />
        )}
        <div style={mintingSectionStyles.details}>
          {remaining && (
            <Span
              id={remaining.id}
              label={remaining.label}
              content={remaining.content}
              styles={mintingSectionStyles.remaining}
            />
          )}
          {value && currency && (
            <Span
              id={`${value.id}-${currency.id}`}
              content={`${value.content} ${currency.content}`}
              label={value.label}
              styles={mintingSectionStyles.price}
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
                  style={{
                    width: '2rem',
                    height: '2rem',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: '800',
                  }}
                >
                  -
                </button>
                <Span
                  id={quantity.id}
                  content={quantity.content}
                  styles={mintingSectionStyles.quantity}
                />
                <button
                  onClick={handleIncrement}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: '800',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Render total price */}
          {totalPrice && (
            <Span
              id={totalPrice.id}
              label={totalPrice.label}
              content={`${totalPrice.label}: ${totalPrice.content}`}
              styles={mintingSectionStyles.quantity}
            />
          )}
        </div>
        {mintButton && (
          <Button
            id={mintButton.id}
            content={mintButton.content}
            styles={mintingSectionStyles.mintButton}
          />
        )}
      </div>

      {/* Right Section */}
      <div style={mintingSectionStyles.rightSection}>
        <div style={mintingSectionStyles.rightSectionHeader}>
          {title && (
            <Span
              id={title.id}
              content={title.content}
              styles={mintingSectionStyles.title}
            />
          )}
          {description && (
            <Span
              id={description.id}
              content={description.content}
              styles={mintingSectionStyles.description}
            />
          )}
          {rareItemsTitle && (
            <Span
              id={rareItemsTitle.id}
              content={rareItemsTitle.content}
              styles={mintingSectionStyles.sectionTitle}
            />
          )}
        </div>
        <div style={mintingSectionStyles.itemsContainer}>
          {rareItems.map((item) => (
            <Image
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
            />
          ))}
        </div>
        {docItemsTitle && (
          <Span
            id={docItemsTitle.id}
            content={docItemsTitle.content}
            styles={mintingSectionStyles.sectionTitle}
          />
        )}
        <div style={mintingSectionStyles.itemsContainer}>
          {documentItems.map((item) => (
            <Image
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
