
// NewElementPanel.js
import React from 'react';
import FooterPanel from './FooterPanel'
import NavbarPanel from './NavbarPanel';
import { useDrag } from 'react-dnd';

const DraggableElement = ({ type, label, level = null }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type, level },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px',
        margin: '4px 0',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {label}
    </div>
  );
};
const NewElementPanel = () => {
  return (
    <div>
      {/* Navbar Elements Section */}
      <div style={{ marginTop: '16px' }}>
        <NavbarPanel />
        <FooterPanel />
      </div>
      <h3>Create New Element</h3>

      {/* Text Elements Section */}
      <div>
        <h4>Text Elements</h4>
        <DraggableElement type="paragraph" label="Paragraph" />
        <DraggableElement type="heading" level={1} label="Heading" />
        <DraggableElement type="span" label="Span" />
      </div>

      {/* Container Elements Section */}
      <div style={{ marginTop: '16px' }}>
        <h4>Container Elements</h4>
        <DraggableElement type="section" label="Section" />
        <DraggableElement type="div" label="Div" />
        <DraggableElement type="ul" label="Unordered List" />
        <DraggableElement type="ol" label="Ordered List" />
      </div>

      {/* Form Elements Section */}
      <div style={{ marginTop: '16px' }}>
        <h4>Form Elements</h4>
        <DraggableElement type="input" label="Input" />
        <DraggableElement type="form" label="Form" />
      </div>

      {/* Media Elements Section */}
      <div style={{ marginTop: '16px' }}>
        <h4>Media Elements</h4>
        <DraggableElement type="image" label="Image" />
      </div>

      {/* Button Elements Section */}
      <div style={{ marginTop: '16px' }}>
        <h4>Button Elements</h4>
        <DraggableElement type="button" label="Button" />
      </div>


    </div>
  );
};

export default NewElementPanel;
