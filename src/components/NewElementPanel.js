// src/components/NewElementPanel.js
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
        <div className='bento-display-elements'>
          <DraggableElement type="paragraph" label="Paragraph" />
          <DraggableElement type="heading" level={1} label="Heading" />
          <DraggableElement type="span" label="Span" />
          <DraggableElement type="anchor" label="Anchor (Link)" />
          <DraggableElement type="blockquote" label="Blockquote" />
          <DraggableElement type="code" label="Code" />
          <DraggableElement type="pre" label="Preformatted Text" />
        </div>
      </div>

      {/* Container Elements Section */}
      <div className="content-section">
        <h4>Container Elements</h4>
        <div className='bento-display-elements'>
          <DraggableElement type="section" label="Section" />
          <DraggableElement type="div" label="Div" />
          <DraggableElement type="table" label="Table" />
          <DraggableElement type="ul" label="Unordered List" />
          <DraggableElement type="ol" label="Ordered List" />
          <DraggableElement type="fieldset" label="Fieldset" />
        </div>
      </div>

      {/* Form Elements Section */}
      <div className="content-section">
        <h4>Form Elements</h4>
        <div className='bento-display-elements'>
          <DraggableElement type="input" label="Input" />
          <DraggableElement type="form" label="Form" />
          <DraggableElement type="textarea" label="Textarea" />
          <DraggableElement type="select" label="Select (Dropdown)" />
          <DraggableElement type="label" label="Label" />
          <DraggableElement type="legend" label="Legend" />
        </div>
      </div>

      {/* Media Elements Section */}
      <div className="content-section">
        <h4>Media Elements</h4>
        <div className='bento-display-elements'>
          <DraggableElement type="image" label="Image" />
          <DraggableElement type="video" label="Video" />
          <DraggableElement type="audio" label="Audio" />
          <DraggableElement type="iframe" label="Iframe" />
        </div>
      </div>

      {/* Interactive Elements Section */}
      <div className="content-section">
        <h4>Interactive Elements</h4>
        <div className='bento-display-elements'>
          <DraggableElement type="button" label="Button" />
          <DraggableElement type="progress" label="Progress" />
          <DraggableElement type="meter" label="Meter" />
        </div>
      </div>

      {/* Structural Elements Section */}
      <div className="content-section">
        <h4>Structural Elements</h4>
        <div className='bento-display-elements'>
          <DraggableElement type="hr" label="Horizontal Rule" />
          <DraggableElement type="caption" label="Caption" />
        </div>
      </div>
    </div>
  );
};

export default NewElementPanel;
