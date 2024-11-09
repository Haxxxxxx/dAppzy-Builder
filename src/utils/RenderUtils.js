// RenderUtils.js
import React from 'react';
import Paragraph from '../Elements/Texts/Paragraph';
import Heading from '../Elements/Texts/Heading';
import Section from '../Elements/Structure/Section';
import Div from '../Elements/Structure/Div';
import Button from '../Elements/Interact/Button';
import Image from '../Elements/Structure/Image';
import Form from '../Elements/Interact/Form';
import Span from '../Elements/Texts/Span';
import Input from '../Elements/Interact/Input';
import { List, ListItem } from '../Elements/Texts/List';
import DraggableNavbar from '../Elements/Structure/DraggableNavbar';
import DraggableFooter from '../Elements/Structure/DraggableFooter';

export const renderElement = (element, elements) => {
    const { id, type, children, configuration } = element;

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
                  return childElement ? renderElement(childElement, elements) : null;
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
                  return childElement ? renderElement(childElement, elements) : null;
                })}
            </div>
          )}
        </Div>
      ),
      heading: <Heading id={id} key={id} content={element.content} />,
      button: <Button id={id} key={id} content={element.content} />,
      image: <Image id={id} key={id} />,
      span: <Span id={id} key={id} content={element.content} />,
      input: <Input id={id} key={id} />,
      form: <Form id={id} key={id} />,
      ul: (
        <List id={id} type="ul" key={id}>
          {children && children.length > 0 && children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement, elements) : null;
          })}
        </List>
      ),
      ol: (
        <List id={id} type="ol" key={id}>
          {children && children.length > 0 && children.map((childId) => {
            const childElement = elements.find((el) => el.id === childId);
            return childElement ? renderElement(childElement, elements) : null;
          })}
        </List>
      ),
      'list-item': <ListItem id={id} key={id} content={element.content} />,
      navbar: (
        <DraggableNavbar configuration={configuration} id={id} key={id} isEditing={true} />
      ),
      footer: (
        <DraggableFooter configuration={configuration} id={id} key={id} isEditing={true} />
      ),
    };

    if (!componentMap[type]) {
      console.warn(`Unsupported element type: ${type}`);
      return null;
    }

    return (
      <React.Fragment key={id}>
        {componentMap[type]}
      </React.Fragment>
    );
  };
