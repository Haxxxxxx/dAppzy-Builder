/* global solanaWeb3, Metaplex */

import React from 'react';
import { mintingSectionStyles } from '../../../Elements/Sections/Web3Related/DefaultWeb3Styles';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';
import { db, doc, setDoc } from '../../../firebase';

// Helper to compute progress from "remaining"
function calculateProgress(remainingContent) {
  if (!remainingContent || !remainingContent.includes('/')) return 0;
  const [available, total] = remainingContent.split('/').map((num) => parseInt(num.trim(), 10));
  const minted = total - available;
  return (minted / total) * 100;
}

// Circular progress component
function CircularProgress({ logo, remainingContent }) {
  if (!logo) return null;

  const progress = calculateProgress(remainingContent);
  const containerSize = 150;
  const marginSize = 10;
  const innerSize = containerSize - marginSize * 2;
  const strokeWidth = 10;
  const center = innerSize / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const dotRadius = strokeWidth / 2;
  const angleDeg = progress * 3.6;
  const angleRad = (Math.PI / 180) * angleDeg;
  const dotX = center + radius * Math.cos(angleRad);
  const dotY = center + radius * Math.sin(angleRad);

  return (
    <div style={{
      position: 'relative',
      width: containerSize,
      height: containerSize,
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'relative',
        width: innerSize,
        height: innerSize,
        borderRadius: '50%',
        overflow: 'hidden'
      }}>
        <img
          src={SecurityManager.sanitizeUrl(logo.content)}
          alt="Logo"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: innerSize,
          height: innerSize,
          pointerEvents: 'none'
        }}>
          <svg
            width={innerSize}
            height={innerSize}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'rotate(-90deg)'
            }}
          >
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EAC050" />
                <stop offset="48.5%" stopColor="#7E1C48" />
                <stop offset="100%" stopColor="#1A587C" />
              </linearGradient>
            </defs>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#ccc"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
            <circle
              cx={dotX}
              cy={dotY}
              r={dotRadius}
              fill="black"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function renderMintingSection(mintingElement, context) {
  const { id, children = [], styles = {} } = mintingElement;

  // Helper functions to retrieve children
  const findChild = (type) => children.find((c) => c.type === type);
  const findChildren = (type) => children.filter((c) => c.type === type);

  // Left column items
  const logo = findChild('image');
  const timer = findChild('timer');
  const remaining = findChild('remaining');
  const value = findChild('value');
  const currency = findChild('currency');
  const quantity = findChild('quantity');
  const totalPrice = findChild('price');
  const mintButton = findChild('button');

  // Right column items
  const title = findChild('title');
  const description = findChild('description');
  const rareItemsTitle = findChild('rareItemsTitle');
  const docItemsTitle = findChild('docItemsTitle');
  const rareItems = findChildren('rare-item');
  const documentItems = findChildren('document-item');

  // Retrieve candyMachineId and nftPrice
  let candyMachineId = findChild('candyMachineId')?.content || '';
  const nftPrice = totalPrice?.content || '0';

  // Generate a new Candy Machine ID if missing
  if (!candyMachineId) {
    const generatedId = crypto.randomUUID();
    candyMachineId = generatedId;
    console.log('No Candy Machine ID found. Generated one:', generatedId);

    // Save to Firestore asynchronously
    setDoc(doc(db, 'candyMachineIds', `element-${id}`), {
      candyMachineId: generatedId,
      createdAt: new Date().toISOString(),
    })
      .then(() => {
        console.log('Generated Candy Machine ID saved to Firestore successfully.');
      })
      .catch(err => {
        console.error('Error saving generated Candy Machine ID to Firestore:', err);
      });
  }

  // Apply styles using StyleManager
  const sectionStyle = StyleManager.applyStyles(
    mintingSectionStyles.section,
    styles,
    'mintingSection'
  );

  const leftColumnStyle = StyleManager.applyStyles(
    mintingSectionStyles.leftColumn,
    {},
    'leftColumn'
  );

  const rightColumnStyle = StyleManager.applyStyles(
    mintingSectionStyles.rightColumn,
    {},
    'rightColumn'
  );

  const timerStyle = StyleManager.applyStyles(
    mintingSectionStyles.timer,
    timer?.styles,
    'timer'
  );

  const remainingStyle = StyleManager.applyStyles(
    mintingSectionStyles.remaining,
    remaining?.styles,
    'remaining'
  );

  const priceStyle = StyleManager.applyStyles(
    mintingSectionStyles.price,
    value?.styles,
    'price'
  );

  const quantityStyle = StyleManager.applyStyles(
    mintingSectionStyles.quantity,
    quantity?.styles,
    'quantity'
  );

  const mintButtonStyle = StyleManager.applyStyles(
    mintingSectionStyles.mintButton,
    mintButton?.styles,
    'button'
  );

  const titleStyle = StyleManager.applyStyles(
    mintingSectionStyles.title,
    title?.styles,
    'heading'
  );

  const descriptionStyle = StyleManager.applyStyles(
    mintingSectionStyles.description,
    description?.styles,
    'paragraph'
  );

  const sectionTitleStyle = StyleManager.applyStyles(
    mintingSectionStyles.sectionTitle,
    {},
    'sectionTitle'
  );

  const itemStyle = StyleManager.applyStyles(
    mintingSectionStyles.item,
    {},
    'item'
  );

  return (
    <section id={id} className={id} style={sectionStyle}>
      <div className="leftColumn" style={leftColumnStyle}>
        {logo && <CircularProgress logo={logo} remainingContent={remaining?.content} />}
        {timer && (
          <div className="timer" id={`mint-timer-${id}`} style={timerStyle}>
            <p>Minting starts in: Loading...</p>
        </div>
        )}
        {remaining && (
          <span className="remaining" style={remainingStyle}>
            {remaining.label ? `${remaining.label}: ` : ''}
            {SecurityManager.sanitizeInput(remaining.content)}
          </span>
        )}
        {value && currency && (
          <span className="price" style={priceStyle}>
            {value.label ? `${value.label}: ` : ''}
            {SecurityManager.sanitizeInput(value.content)} {SecurityManager.sanitizeInput(currency.content)}
          </span>
        )}
        {quantity && totalPrice && (
          <span className="quantity" style={quantityStyle}>
            {quantity.label ? `${quantity.label}: ` : ''}
            {SecurityManager.sanitizeInput(quantity.content)} (
            {totalPrice.label ? `${totalPrice.label}: ` : ''}
            {SecurityManager.sanitizeInput(totalPrice.content)})
          </span>
        )}
        {mintButton && (
          <button
            className="mintButton"
            id={`mint-btn-${id}`}
            style={mintButtonStyle}
            onClick={() => context.onMintClick?.(mintButton)}
            disabled
          >
            {SecurityManager.sanitizeInput(mintButton.content || 'MINT')}
          </button>
        )}
      </div>
      <div className="rightColumn" style={rightColumnStyle}>
        {title && (
          <span className="title" style={titleStyle}>
            {SecurityManager.sanitizeInput(title.content)}
          </span>
        )}
        {description && (
          <span className="description" style={descriptionStyle}>
            {description.label ? `${description.label}: ` : ''}
            {SecurityManager.sanitizeInput(description.content)}
          </span>
        )}
        {rareItemsTitle && (
          <span className="sectionTitle" style={sectionTitleStyle}>
            {SecurityManager.sanitizeInput(rareItemsTitle.content)}
          </span>
        )}
        {rareItems.length > 0 && (
          <div className="rareItems">
            {rareItems.map((item, index) => (
              <div key={`${id}-rare-${index}`} className="item" style={itemStyle}>
                {SecurityManager.sanitizeInput(item.content)}
              </div>
            ))}
        </div>
        )}
        {docItemsTitle && (
          <span className="sectionTitle" style={sectionTitleStyle}>
            {SecurityManager.sanitizeInput(docItemsTitle.content)}
          </span>
        )}
        {documentItems.length > 0 && (
          <div className="documentItems">
            {documentItems.map((item, index) => (
              <div key={`${id}-doc-${index}`} className="item" style={itemStyle}>
                {SecurityManager.sanitizeInput(item.content)}
        </div>
            ))}
        </div>
        )}
      </div>
    </section>
  );
} 