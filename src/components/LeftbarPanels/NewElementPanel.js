import React, { useEffect } from 'react';
import FooterPanel from '../SectionsPanels/FooterPanel';
import NavbarPanel from '../SectionsPanels/NavbarPanel';
import DraggableElement from './DraggableElement';
import '../css/Sidebar.css';
import HeroPanel from '../SectionsPanels/HeroPanel';
import CTAPanel from '../SectionsPanels/CTAPanel';
import Web3ElementPanel from '../SectionsPanels/Web3ElementPanel';
import Web3SectionPanel from '../SectionsPanels/Web3SectionPanel';

const NewElementPanel = ({ contentListWidth, viewMode }) => {
  useEffect(() => {
    console.log(contentListWidth);
  }, [contentListWidth]);

  if (viewMode === 'layout') {
    return (
      <div>
        <div className="panel-header">Layout Elements</div>
        <div className="content-section">
          <h4>Sections Created</h4>
          <NavbarPanel contentListWidth={contentListWidth} />
          <Web3SectionPanel/>
          <HeroPanel />
          <CTAPanel />
          <FooterPanel />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="panel-header">New Elements</div>

      {/* Text Elements Section */}
      <div className="content-section">
        <h4>Text Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="paragraph" label="Paragraph" description="A block of text." />
          <DraggableElement type="heading" level={1} label="Heading" description="A title or header element." />
          <DraggableElement type="span" label="Span" description="An inline text element." />
          <DraggableElement type="anchor" label="Anchor (Link)" description="A hyperlink element." />
          <DraggableElement type="blockquote" label="Blockquote" description="A quoted block of text." />
          <DraggableElement type="code" label="Code" description="A code snippet." />
          <DraggableElement type="pre" label="Preformatted Text" description="Text with preserved formatting." />
        </div>
      </div>

      {/* Container Elements Section */}
      <div className="content-section">
        <h4>Container Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="section" label="Section" description="A container element for layout." />
          <DraggableElement type="div" label="Div" description="A generic container element." />
          <DraggableElement type="table" label="Table" description="A table element for tabular data." />
          <DraggableElement type="ul" label="Unordered List" description="A bullet point list." />
          <DraggableElement type="ol" label="Ordered List" description="A numbered list." />
          <DraggableElement type="fieldset" label="Fieldset" description="Groups related form elements." />
        </div>
      </div>

      {/* Form Elements Section */}
      <div className="content-section">
        <h4>Form Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="input" label="Input" description="A basic input field." />
          <DraggableElement type="form" label="Form" description="A container for form elements." />
          <DraggableElement type="textarea" label="Textarea" description="A multi-line text input." />
          <DraggableElement type="select" label="Select (Dropdown)" description="A dropdown menu." />
          <DraggableElement type="label" label="Label" description="A label for form elements." />
          <DraggableElement type="legend" label="Legend" description="A title for a fieldset." />
        </div>
      </div>

      {/* Media Elements Section */}
      <div className="content-section">
        <h4>Media Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="image" label="Image" description="An image element." />
          <DraggableElement type="video" label="Video" description="A video player element." />
          <DraggableElement type="audio" label="Audio" description="An audio player element." />
          <DraggableElement type="iframe" label="Iframe" description="An inline frame for external content." />
        </div>
      </div>

      {/* Interactive Elements Section */}
      <div className="content-section">
        <h4>Interactive Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="button" label="Button" description="A clickable button." />
          <DraggableElement type="progress" label="Progress" description="A progress bar indicator." />
          <DraggableElement type="meter" label="Meter" description="A measurement value." />

        </div>
      </div>

      {/* Structural Elements Section */}
      <div className="content-section">
        <h4>Structural Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="hr" label="Horizontal Rule" description="A horizontal separator line." />
          <DraggableElement type="caption" label="Caption" description="A caption for a table." />
        </div>
      </div>
      <div className="content-section">
        <Web3ElementPanel/>
        </div>


    </div>
  );
};

export default NewElementPanel;
