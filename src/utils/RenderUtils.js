// src/utils/renderUtils.js
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
import { List, ListItem } from '../Elements/Texts/List'; // Import List and ListItem components

export const renderElement = (element, elements) => {
    const { id, type, children } = element;
  
    const componentMap = {
      paragraph: <Paragraph id={id} key={id} />,
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
            <div className="nested-elements">
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
      heading: <Heading id={id} key={id} />,
      button: <Button id={id} key={id} />,
      image: <Image id={id} key={id} />,
      span: <Span id={id} key={id} />,
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
      'list-item': <ListItem id={id} key={id} />,
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
  
