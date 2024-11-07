// src/utils/renderUtils.js
import React from 'react';
import Paragraph from '../Texts/Paragraph';
import Heading from '../Texts/Heading';
import Section from '../Elements/Section';
import Div from '../Elements/Div';
import Button from '../Elements/Button';
import Image from '../Elements/Image';
import Form from '../Elements/Form';
import Span from '../Elements/Span';
import Input from '../Elements/Input';

export const renderElement = (element, elements) => {
  const { id, type, children } = element;

  // Define how to render each component type, including nested children if applicable
  const componentMap = {
    paragraph:   <Paragraph id={id}/>,
    section: (
      <Section id={id}>
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
      <Div id={id}>
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
    heading: <Heading id={id}/>,
    paragraph : <Paragraph id={id}/>,
    button: <Button id={id} />,
    image: <Image id={id} />,
    span: <Span id={id} />,
    input: <Input id={id} />,
    form: <Form id={id} />,
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
