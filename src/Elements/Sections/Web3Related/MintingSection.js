import React, { useRef, useEffect } from 'react';
import Image from '../../Media/Image';
import Span from '../../Typography/Span';
import Button from '../../Basic/Button';
import DateComponent from '../../Unused(Yet)/DateComponent';
import useElementDrop from '../../../utils/useElementDrop';
import withSelectable from '../../../utils/withSelectable';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { mintingSectionStyles } from './DefaultWeb3Styles';

// Make elements selectable
const SelectableSpan = withSelectable(Span);
const SelectableImage = withSelectable(Image);
const SelectableButton = withSelectable(Button);
const SelectableDateComponent = withSelectable(DateComponent);

const MintingSection = ({
  handleSelect, uniqueId, children, onDropItem, contentListWidth, handleOpenMediaPanel }) => {
  const sectionRef = useRef(null);
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // Load the `mintingSection` configuration
  const { mintingSection } = structureConfigurations;

  // Merge default children with overrides
  const mergedChildren = mintingSection.children.map((defaultChild, index) => {
    const overrideChild = children.find((child) => child.id === `${uniqueId}-minting-child-${index}`);
    return overrideChild || { ...defaultChild, id: `${uniqueId}-minting-child-${index}` };
  });

  // Extract specific elements
  const getChildByType = (type) => mergedChildren.find((child) => child.type === type);
  const getChildrenByType = (type) => mergedChildren.filter((child) => child.type === type);

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



  const handleImageDrop = (droppedItem, imageId) => {
    if (droppedItem.mediaType === 'image') {
      onDropItem(imageId, droppedItem.src); // Update the image's content
    }
  };

  useEffect(() => {
    console.log('Merged Children for MintingSection:', mergedChildren);
  }, [mergedChildren]);

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
      onClick={(e) => handleSelect(e)}  // if you need the event explicitly
    >
      {/* Left Section */}
      <div style={mintingSectionStyles.leftSection}>
        {logo && (
          <SelectableImage
            id={logo.id}
            src={logo.content}
            styles={mintingSectionStyles.logo}
            handleOpenMediaPanel={handleOpenMediaPanel}
            handleDrop={handleImageDrop}

          />
        )}
        {timer && (
          <SelectableDateComponent
            id={timer.id}
            content={timer.content}
            label={timer.label}
            styles={mintingSectionStyles.timer}
          />
        )}
        <div style={mintingSectionStyles.details}>
          {remaining && (
            <SelectableSpan
              id={remaining.id}
              label={remaining.label}
              content={remaining.content}
              styles={mintingSectionStyles.remaining}
            />
          )}
          {value && currency && (
            <SelectableSpan
              id={`${value.id}-${currency.id}`}
              content={`${value.content} ${currency.content}`}
              label={value.label}
              styles={mintingSectionStyles.price}
            />
          )}
          {quantity && totalPrice && (
            <SelectableSpan
              id={quantity.id}
              content={`${quantity.content} (${totalPrice.label}: ${totalPrice.content})`}
              label={quantity.label}
              styles={mintingSectionStyles.quantity}
            />
          )}
        </div>
        {mintButton && (
          <SelectableButton
            id={mintButton.id}
            content={mintButton.content}
            styles={mintingSectionStyles.mintButton}
          />
        )}
      </div>

      {/* Right Section */}
      <div style={mintingSectionStyles.rightSection}>
        {title && (
          <SelectableSpan
            id={title.id}
            content={title.content}
            styles={mintingSectionStyles.title}
          />
        )}
        {description && (
          <SelectableSpan
            id={description.id}
            content={description.content}
            styles={mintingSectionStyles.description}
          />
        )}
        {rareItemsTitle && (
          <SelectableSpan
            id={rareItemsTitle.id}
            content={rareItemsTitle.content}
            styles={mintingSectionStyles.sectionTitle}
          />
        )}
        <div style={mintingSectionStyles.itemsContainer}>
          {rareItems.map((item) => (
            <SelectableImage
              key={item.id}
              id={item.id}
              src={item.content}
              styles={mintingSectionStyles.itemImage}
              handleOpenMediaPanel={handleOpenMediaPanel}
            />
          ))}
        </div>
        {docItemsTitle && (
          <SelectableSpan
            id={docItemsTitle.id}
            content={docItemsTitle.content}
            styles={mintingSectionStyles.sectionTitle}
          />
        )}
        <div style={mintingSectionStyles.itemsContainer}>
          {documentItems.map((item) => (
            <SelectableImage
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
