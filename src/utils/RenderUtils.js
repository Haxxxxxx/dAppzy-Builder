// src/utils/RenderUtils.js
import React from 'react';
import Paragraph from '../Elements/Texts/Paragraph';
import Heading from '../Elements/Texts/Heading';
import Section from '../Elements/Structure/Section';
import Div from '../Elements/Structure/Div';
import Button from '../Elements/Interact/Button';
import Image from '../Elements/Media/Image';
import Form from '../Elements/Interact/Form';
import Span from '../Elements/Texts/Span';
import Input from '../Elements/Interact/Input';
import { List, ListItem } from '../Elements/Texts/List';
import { Table, TableRow, TableCell } from '../Elements/Interact/Table';
import DraggableNavbar from '../Elements/Structure/DraggableNavbar';
import DraggableFooter from '../Elements/Structure/DraggableFooter';
import DraggableHero from '../Elements/Structure/DraggableHero';
import DraggableCTA from '../Elements/Structure/DraggableCTA';
import Anchor from '../Elements/Interact/Anchor';
import Textarea from '../Elements/Interact/Textarea';
import Select from '../Elements/Interact/Select';
import Video from '../Elements/Media/Video';
import Audio from '../Elements/Media/Audio';
import Iframe from '../Elements/Media/Iframe';
import Label from '../Elements/Interact/Label';
import Fieldset from '../Elements/Structure/FieldSet';
import Legend from '../Elements/Structure/Legend';
import Progress from '../Elements/Structure/Progress';
import Meter from '../Elements/Interact/Meter';
import Blockquote from '../Elements/Texts/Blockquote';
import Code from '../Elements/Texts/Code';
import Pre from '../Elements/Texts/Pre';
import Hr from '../Elements/Structure/HorizotalRule';
import Caption from '../Elements/Structure/Caption';
import DraggableMintingSection from '../Elements/Structure/DraggableMintingSection';
import DateComponent from '../Elements/Interact/DateComponent';
import { structureConfigurations } from '../configs/structureConfigurations';
const warnedElements = new Set();

export const renderElement = (element, elements, contentListWidth, setSelectedElement, setElements) => {
  const { id, type, children, configuration } = element;

  if (!element || !id || !type) {
    console.warn(`Skipping invalid element due to missing fields:`, element);
    return null;
  }

  const resolvedChildren = Array.isArray(children)
    ? children.map((childId) => elements.find((el) => el.id === childId))
    : [];

  // Warn for missing children in `hero`
  if (type === 'hero') {
    const requiredChildren = structureConfigurations[configuration]?.children.map((child) => child.type) || [];
    const hasRequiredChildren = requiredChildren.every((childType) =>
      resolvedChildren.some((child) => child?.type === childType)
    );
  
    if (!hasRequiredChildren) {
      console.warn(`Hero with ID ${id} is missing required children:`, { requiredChildren, resolvedChildren });
      return <div style={{ color: 'red' }}>Incomplete Hero Section</div>; // Render fallback and stop further rendering
    }
  }
  

  // Handle missing configuration for `navbar` and `hero`
  if ((type === 'navbar' || type === 'hero') && !configuration) {
    if (!warnedElements.has(id)) {
      console.warn(`${type.charAt(0).toUpperCase() + type.slice(1)} with ID ${id} is missing a configuration.`);
      warnedElements.add(id);
    }

    if (setElements) {
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
      child ? renderElement(child, elements, contentListWidth, setSelectedElement, setElements) : null
    );

  const componentMap = {
    paragraph: <Paragraph id={id} key={id} content={element.content} />,
    section: (
      <Section id={id} key={id}>
        {resolvedChildren.length > 0 && <div className="nested-elements">{renderChildren()}</div>}
      </Section>
    ),
    div: (
      <Div id={id} key={id}>
        {resolvedChildren.length > 0 && <div className="nested-elements" style={{ padding: '10px' }}>{renderChildren()}</div>}
      </Div>
    ),
    heading: <Heading id={id} key={id} content={element.content} />,
    button: <Button id={id} key={id} content={element.content} />,
    span: <Span id={id} key={id} content={element.content} />,
    image: <Image id={id} key={id} />,
    input: <Input id={id} key={id} />,
    form: <Form id={id} key={id} />,
    navbar: (
      <DraggableNavbar
        configuration={configuration}
        id={id}
        key={id}
        isEditing={true}
        children={resolvedChildren}
        contentListWidth={contentListWidth}
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
      />
    ),
    footer: (
      <DraggableFooter
        configuration={configuration}
        id={id}
        key={id}
        isEditing={true}
        contentListWidth={contentListWidth}
      />
    ),
    cta: (
      <DraggableCTA
        configuration={configuration}
        id={id}
        key={id}
        isEditing={true}
        contentListWidth={contentListWidth}
      />
    ),
    table: <Table id={id} key={id} />,
    anchor: <Anchor id={id} key={id} />,
    textarea: <Textarea id={id} key={id} />,
    select: <Select id={id} key={id} />,
    video: <Video id={id} key={id} />,
    audio: <Audio id={id} key={id} />,
    iframe: <Iframe id={id} key={id} />,
    label: <Label id={id} key={id} />,
    fieldset: <Fieldset id={id} key={id} />,
    legend: <Legend id={id} key={id} />,
    progress: <Progress id={id} key={id} />,
    meter: <Meter id={id} key={id} />,
    blockquote: <Blockquote id={id} key={id} />,
    code: <Code id={id} key={id} />,
    pre: <Pre id={id} key={id} />,
    hr: <Hr id={id} key={id} />,
    caption: <Caption id={id} key={id} />,
    mintingSection: (
      <DraggableMintingSection
        id={id}
        configuration={configuration}
        elements={elements} // Ensure this is passed correctly
        setElements={setElements}
        setSelectedElement={setSelectedElement}
      />

    ),

    date: <DateComponent id={id} key={id} styles={element.styles} />
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