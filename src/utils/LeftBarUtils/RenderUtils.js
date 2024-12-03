// src/utils/RenderUtils.js
import React from 'react';
import Paragraph from '../../Elements/Texts/Paragraph';
import Heading from '../../Elements/Texts/Heading';
import Section from '../../Elements/Structure/Section';
import Div from '../../Elements/Structure/Div';
import Button from '../../Elements/Interact/Button';
import Image from '../../Elements/Media/Image';
import Form from '../../Elements/Interact/Form';
import Span from '../../Elements/Texts/Span';
import Input from '../../Elements/Interact/Input';
import { List, ListItem } from '../../Elements/Texts/List';
import { Table, TableRow, TableCell } from '../../Elements/Interact/Table';
import DraggableNavbar from '../../Elements/Structure/DraggableNavbar';
import DraggableFooter from '../../Elements/Structure/DraggableFooter';
import DraggableHero from '../../Elements/Structure/DraggableHero';
import DraggableCTA from '../../Elements/Structure/DraggableCTA';
import Anchor from '../../Elements/Interact/Anchor';
import Textarea from '../../Elements/Interact/Textarea';
import Select from '../../Elements/Interact/Select';
import Video from '../../Elements/Media/Video';
import Audio from '../../Elements/Media/Audio';
import Iframe from '../../Elements/Media/Iframe';
import Label from '../../Elements/Interact/Label';
import Fieldset from '../../Elements/Interact/FieldSet';
import Legend from '../../Elements/Texts/Legend';
import Progress from '../../Elements/Interact/Progress';
import Meter from '../../Elements/Interact/Meter';
import Blockquote from '../../Elements/Texts/Blockquote';
import Code from '../../Elements/Texts/Code';
import Pre from '../../Elements/Texts/Pre';
import Hr from '../../Elements/Interact/HorizotalRule';
import Caption from '../../Elements/Texts/Caption';
import DraggableWeb3Elements from '../../Elements/Structure/DraggableWeb3Elements';
import DateComponent from '../../Elements/Interact/DateComponent';
import ConnectWalletButton from '../../Elements/Sections/Web3Related/ConnectWalletButton';
import { structureConfigurations } from '../../configs/structureConfigurations';
const warnedElements = new Set();

export const renderElement = (
  element,
  elements,
  contentListWidth,
  setSelectedElement,
  setElements,
  handlePanelToggle,
  isPreviewMode = true // Default to true for static rendering
) => {
  const { id, type, children, configuration } = element;

  if (!element || !id || !type) {
    console.warn(`Skipping invalid or undefined element:`, element);
    return null; // Skip invalid elements
  }

  // Resolve children
  const resolvedChildren = Array.isArray(children)
    ? children
        .map((childId) => elements.find((el) => el.id === childId))
        .filter(Boolean) // Filters out null/undefined children
    : [];

  // Warn for missing children in `hero`
  if (type === 'hero') {
    const requiredChildren =
      structureConfigurations[configuration]?.children.map((child) => child.type) || [];
    const hasRequiredChildren = requiredChildren.every((childType) =>
      resolvedChildren.some((child) => child?.type === childType)
    );
  }

  // Handle missing configuration for `navbar`, `hero`, and `mintingSection`
  if ((type === 'navbar' || type === 'hero' || type === 'mintingSection') && !configuration) {
    if (!warnedElements.has(id)) {
      console.warn(`${type.charAt(0).toUpperCase() + type.slice(1)} with ID ${id} is missing a configuration.`);
      warnedElements.add(id);
    }

    if (setElements || type !== 'footer') {
      setElements((prev) => {
        const updatedElements = prev.filter((el) => el.id !== id);
        localStorage.setItem('editableElements', JSON.stringify(updatedElements));
        return updatedElements;
      });
    }

    return null; // Skip rendering
  }

  // Recursive child rendering
  const renderChildren = () =>
    resolvedChildren.map((child) =>
      child
        ? renderElement(
            child,
            elements,
            contentListWidth,
            setSelectedElement,
            setElements,
            handlePanelToggle,
            isPreviewMode // Pass isPreviewMode recursively
          )
        : null
    );

  // Define component mappings
  const componentMap = {
    paragraph: (
      <Paragraph
        id={id}
        key={id}
        content={element.content}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    section: (
      <Section id={id} key={id} isPreviewMode={isPreviewMode} setSelectedElement={setSelectedElement}>
        {resolvedChildren.length > 0 && (
          <div className="nested-elements" style={{ padding: '10px' }}>
            {renderChildren()}
          </div>
        )}
      </Section>
    ),
    div: (
      <Div id={id} key={id} isPreviewMode={isPreviewMode} setSelectedElement={setSelectedElement}>
        {resolvedChildren.length > 0 && (
          <div className="nested-elements" style={{ padding: '10px' }}>
            {renderChildren()}
          </div>
        )}
      </Div>
    ),
    heading: (
      <Heading
        id={id}
        key={id}
        content={element.content}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    button: (
      <Button
        id={id}
        key={id}
        content={element.content}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    span: (
      <Span
        id={id}
        key={id}
        content={element.content}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    image: (
      <Image
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    input: (
      <Input
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    form: (
      <Form
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    ul: (
      <List
        id={id}
        key={id}
        type="ul"
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    ol: (
      <List
        id={id}
        key={id}
        type="ol"
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    navbar: (
      <DraggableNavbar
        configuration={configuration}
        id={id}
        key={id}
        isEditing={!isPreviewMode}
        children={resolvedChildren}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
      />
    ),
    hero: (
      <DraggableHero
        id={id}
        configuration={configuration}
        key={id}
        children={resolvedChildren}
        contentListWidth={contentListWidth}
        setSelectedElement={setSelectedElement}
        isPreviewMode={isPreviewMode}
      />
    ),
    footer: (
      <DraggableFooter
        configuration={configuration}
        id={id}
        key={id}
        isEditing={!isPreviewMode}
        contentListWidth={contentListWidth}
      />
    ),
    cta: (
      <DraggableCTA
        configuration={configuration}
        id={id}
        key={id}
        isEditing={!isPreviewMode}
        contentListWidth={contentListWidth}
      />
    ),
    table: (
      <Table
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    anchor: (
      <Anchor
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    textarea: (
      <Textarea
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    select: (
      <Select
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    video: (
      <Video
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    audio: (
      <Audio
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    iframe: (
      <Iframe
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    label: (
      <Label
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    fieldset: (
      <Fieldset
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    legend: (
      <Legend
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    progress: (
      <Progress
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    meter: (
      <Meter
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    blockquote: (
      <Blockquote
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    code: (
      <Code
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    pre: (
      <Pre
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    hr: (
      <Hr
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    caption: (
      <Caption
        id={id}
        key={id}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
    mintingSection: (
      <DraggableWeb3Elements
        id={id}
        configuration={configuration}
        key={id}
        elements={elements}
        setElements={setElements}
        setSelectedElement={setSelectedElement}
        handlePanelToggle={handlePanelToggle}
        isPreviewMode={isPreviewMode}
      />
    ),
    connectWalletButton: (
      <ConnectWalletButton
        id={id}
        key={id}
        content={element.content}
        handlePanelToggle={handlePanelToggle}
        isPreviewMode={isPreviewMode}
      />
    ),
    date: (
      <DateComponent
        id={id}
        key={id}
        styles={element.styles}
        isPreviewMode={isPreviewMode}
        setSelectedElement={setSelectedElement}
      />
    ),
  };

  // Ensure content is string for date
  if (type === 'date' && element.content instanceof Date) {
    element.content = element.content.toLocaleString();
  }

  // Ensure component exists in the map
  const component = componentMap[type];
  if (!component) {
    if (!warnedElements.has(id)) {
      console.warn(`Unsupported element type: ${type}`);
      warnedElements.add(id);
    }
    return null;
  }

  return <React.Fragment key={id}>{component}</React.Fragment>;
};
