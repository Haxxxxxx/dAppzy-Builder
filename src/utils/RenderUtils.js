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

export const renderElement = (element, elements, contentListWidth) => {
  const { id, type, children, configuration } = element;
  console.log('Rendering element:', { id, type, children, configuration });
  if (type === 'navbar' && !configuration) {
    console.warn(`Navbar with id ${id} is missing a configuration and will not be rendered.`);
    return null; // Skip rendering if navbar has no configuration
  }
  
  const componentMap = {
    paragraph: <Paragraph id={id} key={id} content={element.content} />,
    section: (
      <Section id={id} key={id}>
        {children && children.length > 0 && (
          <div className="nested-elements">
            {children
              .filter((childId) => elements.find((el) => el.id === childId))
              .map((childId) => {
                const childElement = elements.find((el) => el.id === childId);
                return childElement ? renderElement(childElement, elements, contentListWidth) : null;
              })}
          </div>
        )}
      </Section>
    ),
    div: (
      <Div id={id} key={id}>
        {children && children.length > 0 && (
          <div className="nested-elements" style={{ padding: '10px' }}>
            {children
              .filter((childId) => elements.find((el) => el.id === childId))
              .map((childId) => {
                const childElement = elements.find((el) => el.id === childId);
                return childElement ? renderElement(childElement, elements, contentListWidth) : null;
              })}
          </div>
        )}
      </Div>
    ),
    heading: <Heading id={id} key={id} content={element.content} />,
    button: <Button id={id} key={id} content={element.content} />,
    span: <Span id={id} key={id} content={element.content} />,
    image: <Image id={id} key={id} />,
    input: <Input id={id} key={id} />,
    form: <Form id={id} key={id} />,
    ul: (
      <List id={id} type="ul" key={id}>
        {children &&
          children.length > 0 &&
          children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement, elements, contentListWidth) : null;
          })}
      </List>
    ),
    ol: (
      <List id={id} type="ol" key={id}>
        {children &&
          children.length > 0 &&
          children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement, elements, contentListWidth) : null;
          })}
      </List>
    ),
    'list-item': <ListItem id={id} key={id} content={element.content} />,
    navbar: (
      <DraggableNavbar
        configuration={configuration}
        id={id}
        key={id}
        isEditing={true}
        contentListWidth={contentListWidth}
      />
    ),
    footer: (
      <DraggableFooter 
        configuration={configuration} 
        id={id} 
        key={id} 
        isEditing={true} 
        contentListWidth={contentListWidth} />
    ),
    hero: (
      <DraggableHero
        configuration={configuration}
        id={id}
        key={id}
        isEditing={true}
        contentListWidth={contentListWidth} // Pass the contentListWidth if required
      />
    ),
    cta: (
      <DraggableCTA 
        configuration={configuration} 
        id={id} 
        key={id} 
        isEditing={true} 
        contentListWidth={contentListWidth} // Pass the contentListWidth if required

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

  };

  const component = componentMap[type];
  if (!component) {
    console.warn(`Unsupported element type: ${type}`);
    return null;
  }

  return <React.Fragment key={id}>{component}</React.Fragment>;
};
