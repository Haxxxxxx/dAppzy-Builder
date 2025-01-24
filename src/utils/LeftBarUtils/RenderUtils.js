// src/utils/RenderUtils.js
import React from 'react';
import {
  Paragraph,
  Heading,
  Section,
  Div,
  Button,
  Span,
  Image,
  Form,
  Input,
  List,
  Anchor,
  Textarea,
  Select,
  Video,
  Audio,
  Iframe,
  Label,
  Fieldset,
  Legend,
  Progress,
  Meter,
  Blockquote,
  Code,
  Pre,
  Hr,
  Caption,
  Table,
  TableRow,
  TableCell,
  DraggableNavbar,
  DraggableFooter,
  DraggableHero,
  DraggableCTA,
  DraggableWeb3Elements,
  DateComponent,
  ConnectWalletButton,
} from '../../Elements/SelectableElements';

import { structureConfigurations } from '../../configs/structureConfigurations';

const warnedElements = new Set();

export const renderElement = (
  element,
  elements,
  contentListWidth,
  setSelectedElement,
  setElements,
  handlePanelToggle,
  selectedElement,
  selectedStyle,
  isPreviewMode = true, // Default to true for static rendering
  handleOpenMediaPanel = () => { },
) => {

  if (!element || !element.id || !element.type) {
    return null; // Skip invalid elements
  }
  const { id, type, children, configuration } = element;




  const renderChildren = (resolvedChildren) => {
    if (!resolvedChildren || resolvedChildren.length === 0) {
      return null;
    }
    return resolvedChildren
      .filter((child) => child) // Filter out undefined children
      .map((child) =>
        renderElement(
          child,
          elements,
          contentListWidth,
          setSelectedElement,
          setElements,
          handlePanelToggle,
          selectedElement,
          selectedStyle,
          isPreviewMode
        )
      );
  };


  const renderConfiguredChildren = (configKey) => {
    const config = structureConfigurations[configKey];
    if (!config) {
      return null;
    }
    return config.children
      .filter((childConfig) => childConfig && childConfig.type) // Ensure valid children
      .map((childConfig, index) => {
        const childElement = {
          id: `${id}-child-${index}`,
          type: childConfig.type,
          content: childConfig.content,
          styles: { ...childConfig.styles } || {},
        };
        return renderElement(
          childElement,
          elements,
          contentListWidth,
          setSelectedElement,
          setElements,
          handlePanelToggle,
          selectedElement,
          selectedStyle,
          isPreviewMode
        );
      });
  };




  // Warn for missing configurations in structured elements
  if ((type === 'navbar' || type === 'hero' || type === 'mintingSection' || type === 'cta' || type === 'footer') && !configuration) {
    if (!warnedElements.has(id)) {
      warnedElements.add(id);
    }
    return null;
  }
  // Define component mappings
  const componentMap = {
    paragraph: <Paragraph id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    heading: <Heading id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    section: (
      <Section id={id} key={id} styles={{ ...element.styles }}>
        {children ? renderChildren(children.map((childId) => elements.find((el) => el.id === childId))) : null}
      </Section>
    ),
    div: (
      <Div id={id} key={id} styles={{ ...element.styles }} handleOpenMediaPanel={handleOpenMediaPanel}>
        {children ? renderChildren(children.map((childId) => elements.find((el) => el.id === childId))) : null}
      </Div>
    ),
    button: <Button id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    span: <Span id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    image: <Image id={id} key={id} styles={{ ...element.styles }} handleOpenMediaPanel={handleOpenMediaPanel} />,
    input: <Input id={id} key={id} styles={{ ...element.styles }} />,
    form: <Form id={id} key={id} styles={{ ...element.styles }} />,
    ul: <List id={id} key={id} type="ul" styles={{ ...element.styles }} />,
    ol: <List id={id} key={id} type="ol" styles={{ ...element.styles }} />,
    navbar: (
      <DraggableNavbar
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children.map((childId) => elements.find((el) => el.id === childId))) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    ),
    hero: (
      <DraggableHero
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children.map((childId) => elements.find((el) => el.id === childId))) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    ),
    footer: (
      <DraggableFooter
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children.map((childId) => elements.find((el) => el.id === childId))) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}

      />
    ),
    cta: (
      <DraggableCTA
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children.map((childId) => elements.find((el) => el.id === childId))) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}

      />
    ),
    table: <Table id={id} key={id} styles={{ ...element.styles }} />,
    tableRow: <TableRow id={id} key={id} styles={{ ...element.styles }} />,
    tableCell: <TableCell id={id} key={id} styles={{ ...element.styles }} />,
    anchor: <Anchor id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    textarea: <Textarea id={id} key={id} styles={{ ...element.styles }} />,
    select: <Select id={id} key={id} styles={{ ...element.styles }} />,
    video: <Video id={id} key={id} styles={{ ...element.styles }} />,
    audio: <Audio id={id} key={id} styles={{ ...element.styles }} />,
    iframe: <Iframe id={id} key={id} styles={{ ...element.styles }} />,
    label: <Label id={id} key={id} styles={{ ...element.styles }} />,
    fieldset: <Fieldset id={id} key={id} styles={{ ...element.styles }} />,
    legend: <Legend id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    progress: <Progress id={id} key={id} styles={{ ...element.styles }} />,
    meter: <Meter id={id} key={id} styles={{ ...element.styles }} />,
    blockquote: <Blockquote id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    code: <Code id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    pre: <Pre id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    hr: <Hr id={id} key={id} styles={{ ...element.styles }} />,
    caption: <Caption id={id} key={id} content={element.content} styles={{ ...element.styles }} />,
    mintingSection: (
      <DraggableWeb3Elements
        id={id}
        key={id}
        type={'candyMachine'}
        configuration={configuration}
        children={renderConfiguredChildren(configuration)}
        setElements={setElements}
        setSelectedElement={setSelectedElement}
        handlePanelToggle={handlePanelToggle}
        isPreviewMode={isPreviewMode}
        handleOpenMediaPanel={handleOpenMediaPanel}
      />
    ),
    date: <DateComponent id={id} key={id} styles={{ ...element.styles }} />,
    connectWalletButton: (
      <ConnectWalletButton
        id={id}
        key={id}
        type={'connectWalletButton'}
        content={element.content}
        styles={{ ...element.styles }}
        handlePanelToggle={handlePanelToggle}
      />
    ),
  };

  const component = componentMap[type];

  if (!component) {
    return null;
  }

  return <React.Fragment key={id}>{component}</React.Fragment>;
};
