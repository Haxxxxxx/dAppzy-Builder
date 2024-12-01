import React, { useContext, useRef } from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Heading from '../../Texts/Heading';
import Paragraph from '../../Texts/Paragraph';
import Button from '../../Interact/Button';
import DateComponent from '../../Interact/DateComponent';
import { EditableContext } from '../../../context/EditableContext';

const MintingSection = ({ uniqueId, children, setSelectedElement, onDropItem }) => {
  const sectionRef = useRef(null);
  const { handleRemoveElement, setSelectedElements } = useContext(EditableContext);

  // Utility function to find child element or provide fallback
  const findChild = (suffix, fallbackContent = '', fallbackStyles = {}) =>
    children.find((child) => child?.id === `${uniqueId}-${suffix}`) || {
      id: `${uniqueId}-${suffix}`,
      content: fallbackContent,
      styles: fallbackStyles,
    };

  // Find specific child elements
  const logo = findChild('logo', 'https://via.placeholder.com/160', { borderRadius: '8px' });
  const title = findChild('title', 'Mint Your NFTs Now');
  const description = findChild('description', 'Minting NFTs has never been easier.');
  const timer = findChild('timer', 'TBD', { fontSize: '1.8rem', fontWeight: 'bold' });
  const remaining = findChild('remaining', 'N/A');
  const price = findChild('price', 'N/A');
  const quantity = findChild('quantity', 'N/A');
  const rareItems = children.filter((child) => child?.id?.includes('-rare-item')) || [];
  const documentItems = children.filter((child) => child?.id?.includes('-document-item')) || [];

  const handleClick = () => {
    setSelectedElement({ id: uniqueId, type: 'mintingSection' });
  };

  return (
    <section
      ref={sectionRef}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        padding: '2rem',
        backgroundColor: '#14141D',
        color: '#fff',
        borderRadius: '12px',
        alignItems: 'center',
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
          <Image id={logo.id} src={logo.content} styles={{ width: '160px', height: '160px', borderRadius: '8px' }} />
        </div>

        {/* Timer */}
        <Span id={`${uniqueId}-mint-starting`} content="Mint starting in..." styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '0.5rem' }} />
        {timer && <DateComponent id={timer.id} styles={timer.styles} />}

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '70%' }}>
          {[{ label: 'Remaining', value: remaining }, { label: 'Price', value: price }, { label: 'Quantity', value: quantity }].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <Span id={`${uniqueId}-${label}-title`} content={label} styles={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
              <Span id={value.id} content={value.content} styles={{ fontSize: '1rem', color: '#ccc' }} />
            </div>
          ))}
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
        <Span id={`${uniqueId}-terms`} content="By clicking 'Mint', you agree to our Terms of Service and Privacy Policy" styles={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center', marginTop: '0.5rem' }} />
      </div>

      {/* Right Section */}
      <div style={{ padding: '1rem' }}>
        <Heading id={title.id} content={title.content} styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }} />
        <Paragraph id={description.id} content={description.content} styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '2rem' }} />

        {/* Rare Items */}
        <Span id={`${uniqueId}-rarest-items`} content="Rarest Items" styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }} />
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {rareItems.map((item) => (
            <Image key={item.id} id={item.id} src={item.content} styles={{ width: '80px', height: '80px', borderRadius: '8px' }} />
          ))}
        </div>

        {/* Document Items */}
        <Span id={`${uniqueId}-our-documents`} content="Our Documents" styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {documentItems.map((item) => (
            <Button key={item.id} id={item.id} content={item.content} styles={{ padding: '1rem', backgroundColor: '#1D1C2B', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '1rem', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
