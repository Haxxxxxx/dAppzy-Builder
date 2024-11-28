import React from 'react';
import Image from '../../Media/Image';
import Span from '../../Texts/Span';
import Heading from '../../Texts/Heading';
import Paragraph from '../../Texts/Paragraph';
import Button from '../../Interact/Button';
import DateComponent from '../../Interact/DateComponent';

const MintingSection = ({ uniqueId, children = [], setSelectedElement }) => {
  const handleClick = () => {
    console.log("Selected Candy Machine Element:", uniqueId);
    setSelectedElement({ id: uniqueId, type: 'candyMachine' });
  };

  // Safely access children with fallbacks
  const logo = children.find((child) => child?.id === `${uniqueId}-logo`) || null;
  const title = children.find((child) => child?.id === `${uniqueId}-title`) || {};
  const description = children.find((child) => child?.id === `${uniqueId}-description`) || {};
  const timer = children.find((child) => child?.id === `${uniqueId}-timer`) || {};
  const remaining = children.find((child) => child?.id === `${uniqueId}-remaining`) || {};
  const price = children.find((child) => child?.id === `${uniqueId}-price`) || {};
  const quantity = children.find((child) => child?.id === `${uniqueId}-quantity`) || {};
  const rareItems = children.filter((child) => child?.id?.includes('-rare-item')) || [];
  const documentItems = children.filter((child) => child?.id?.includes('-document-item')) || [];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        padding: '2rem',
        backgroundColor: '#14141D',
        color: '#fff',
        borderRadius: '12px',
        alignItems:'center',
      }}
      onClick={handleClick}
    >
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
        {logo && (
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
        )}

        <Span
          id={`${uniqueId}-mint-starting`}
          content="Mint starting in..."
          styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '0.5rem' }}
        />
        {timer && (
          <DateComponent
            id={timer.id}
            styles={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '70%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <Span
              id={`${uniqueId}-remaining-title`}
              content="Remaining"
              styles={{ fontSize: '1.2rem', fontWeight: 'bold' }}
            />
            {remaining && <Span id={remaining.id} content={remaining.content} styles={{ fontSize: '1rem', color: '#ccc' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <Span
              id={`${uniqueId}-price-title`}
              content="Price"
              styles={{ fontSize: '1.2rem', fontWeight: 'bold' }}
            />
            {price && <Span id={price.id} content={price.content} styles={{ fontSize: '1rem', color: '#ccc' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <Span
              id={`${uniqueId}-quantity-title`}
              content="Quantity"
              styles={{ fontSize: '1.2rem', fontWeight: 'bold' }}
            />
            {quantity && <Span id={quantity.id} content={quantity.content} styles={{ fontSize: '1rem', color: '#ccc' }} />}
          </div>
        </div>

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

      <div style={{ padding: '1rem' }}>
        {title && <Heading id={title.id} content={title.content} styles={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }} />}
        {description && (
          <Paragraph
            id={description.id}
            content={description.content}
            styles={{ fontSize: '1rem', color: '#ccc', marginBottom: '2rem' }}
          />
        )}
        <Span
          id={`${uniqueId}-rarest-items`}
          content="Rarest Items"
          styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {rareItems.slice(0, 4).map((item) => (
            <Image key={item.id} id={item.id} src={item.content} styles={{ width: '80px', height: '80px', borderRadius: '8px' }} />
          ))}
        </div>
        <Span
          id={`${uniqueId}-our-documents`}
          content="Our Documents"
          styles={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          {documentItems.map((item) => (
            <Button
              key={item.id}
              id={item.id}
              content={item.content}
              styles={{ padding: '1rem', backgroundColor: '#1D1C2B', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '1rem', cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MintingSection;
