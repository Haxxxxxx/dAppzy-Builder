import React from 'react';
import FooterPanel from './FooterPanel';
import NavbarPanel from './NavbarPanel';
import { useDrag } from 'react-dnd';
import './css/Sidebar.css';

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
      className="draggable-element"
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {label}
    </div>
  );
};

const NewElementPanel = ({ viewMode }) => {
  if (viewMode === 'layout') {
    return (
      <div>
        <div className="panel-header">Layout Elements</div>
        {/* Render sections or layout elements */}
        <div className="content-section">
          <h4>Sections Created</h4>
          <DraggableElement type="section" label="Section 1" />
          <DraggableElement type="section" label="Section 2" />
          <NavbarPanel />
          <FooterPanel />
        </div>
      </div>
    );
  }

  // Default to Elements view
  return (
    <div>
      <div className="panel-header">New Elements</div>
      {/* Text Elements Section */}
      <div className="content-section">
        <h4>Text Elements</h4>
        <DraggableElement type="paragraph" label="Paragraph" />
        <DraggableElement type="heading" level={1} label="Heading" />
        <DraggableElement type="span" label="Span" />
      </div>

      {/* Container Elements Section */}
      <div className="content-section">
        <h4>Container Elements</h4>
        <DraggableElement type="section" label="Section" />
        <DraggableElement type="div" label="Div" />
        <DraggableElement type="ul" label="Unordered List" />
        <DraggableElement type="ol" label="Ordered List" />
      </div>

      {/* Form Elements Section */}
      <div className="content-section">
        <h4>Form Elements</h4>
        <DraggableElement type="input" label="Input" />
        <DraggableElement type="form" label="Form" />
      </div>

      {/* Media Elements Section */}
      <div className="content-section">
        <h4>Media Elements</h4>
        <DraggableElement type="image" label="Image" />
      </div>

      {/* Button Elements Section */}
      <div className="content-section">
        <h4>Button Elements</h4>
        <DraggableElement type="button" label="Button" />
      </div>
    </div>
  );
};

export default NewElementPanel;
