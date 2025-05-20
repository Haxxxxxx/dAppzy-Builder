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
  BGVideo,
  Container,
  GridLayout,
  HFlexLayout,
  VFlexLayout,
  Line,
  LinkBlock,
  YouTubeVideo,
  DraggableContentSections,
  Icon,
  DeFiModule,
  DraggableDeFi,
  DraggableMinting
} from '../../Elements/SelectableElements';

import { structureConfigurations } from '../../configs/structureConfigurations';
import { elementTypes } from '../../core/configs/elementConfigs';
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
  isPreviewMode = true,
  handleOpenMediaPanel = () => {},
  forwardedRef = null
) => {
  if (!element || !element.id || !element.type) {
    return null;
  }

  const { id, type, children, configuration } = element;

  // Get base configuration and structure configuration
  const baseConfig = elementTypes[type];
  const structureConfig = configuration ? structureConfigurations[configuration] : null;

  // Merge styles from base config, structure config, and element
  const mergedStyles = {
    ...(baseConfig?.defaultStyles || {}),
    ...(structureConfig?.styles || {}),
    ...(element.styles || {})
  };

  // Single method for rendering children
  const renderChildren = (resolvedChildren) => {
    if (!resolvedChildren || resolvedChildren.length === 0) {
      return null;
    }

    // If children are IDs, resolve them from elements array
    if (typeof resolvedChildren[0] === 'string') {
    return resolvedChildren
        .map(childId => elements.find(el => el.id === childId))
        .filter(Boolean)
        .map(child => renderElement(
          child,
          elements,
          contentListWidth,
          setSelectedElement,
          setElements,
          handlePanelToggle,
          selectedElement,
          selectedStyle,
          isPreviewMode,
          handleOpenMediaPanel
        ));
    }

    // If children are direct element objects
    return resolvedChildren
      .filter(Boolean)
      .map(child => renderElement(
        child,
        elements,
        contentListWidth,
        setSelectedElement,
        setElements,
        handlePanelToggle,
        selectedElement,
        selectedStyle,
        isPreviewMode,
        handleOpenMediaPanel
      ));
  };

  const renderConfiguredChildren = (configKey) => {
    const config = structureConfigurations[configKey];
    if (!config) {
      return null;
    }
    return config.children
      .filter((childConfig) => childConfig && childConfig.type)
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

  if ((type === 'navbar' || type === 'hero' || type === 'mintingSection' || type === 'cta' || type === 'footer'|| type === 'ContentSection') && !configuration) {
    if (!warnedElements.has(id)) {
      warnedElements.add(id);
    }
    return null;
  }

  // Component map with unified configuration handling
  const componentMap = {
    paragraph: <Paragraph id={id} key={id} content={element.content} styles={mergedStyles} />,
    heading: <Heading id={id} key={id} content={element.content} styles={mergedStyles} />,
    section: (
      <Section
        id={id}
        key={id}
        styles={mergedStyles}
        settings={element.settings}
      >
        {children ? renderChildren(children) : null}
      </Section>
    ),
    div: (
      <Div id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>
        {children ? renderChildren(children) : null}
      </Div>
    ),
    button: <Button id={id} key={id} content={element.content} styles={mergedStyles} />,
    span: <Span id={id} key={id} content={element.content} styles={mergedStyles} />,
    image: <Image 
      id={id} 
      key={id} 
      styles={mergedStyles} 
      handleOpenMediaPanel={handleOpenMediaPanel}
      content={element.content}
    />,
    input: <Input id={id} key={id} styles={mergedStyles} />,
    form: <Form id={id} key={id} styles={mergedStyles} />,
    list: (
      <List
        id={id}
        key={id}
        type="ul"
        styles={mergedStyles}
        configuration={configuration}
      />
    ),
    hflex: (
      <HFlexLayout
        id={id}
        key={id}
        styles={mergedStyles}
      >
        {children ? renderChildren(children) : null}
      </HFlexLayout>
    ),
    vflex: (
      <VFlexLayout
        id={id}
        key={id}
        styles={mergedStyles}
      >
        {children ? renderChildren(children) : null}
      </VFlexLayout>
    ),
    navbar: (
      <DraggableNavbar
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        styles={mergedStyles}
        settings={element.settings}
        uniqueId={id}
      />
    ),
    hero: (
      <DraggableHero
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        styles={mergedStyles}
        settings={element.settings}
      />
    ),
    footer: (
      <DraggableFooter
        id={id}
        key={id}
        configuration={configuration}
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
        children={children ? renderChildren(children) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        styles={mergedStyles}
        settings={element.settings}
      />
    ),
    ContentSection: (
      <DraggableContentSections
        id={id}
        key={id}
        configuration={configuration}
        children={children ? renderChildren(children) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        styles={mergedStyles}
        settings={element.settings}
        uniqueId={id}
      />
    ),
    table: <Table id={id} key={id} styles={mergedStyles} />,
    tableRow: <TableRow id={id} key={id} styles={mergedStyles} />,
    tableCell: <TableCell id={id} key={id} styles={mergedStyles} />,
    anchor: <Anchor id={id} key={id} content={element.content} styles={mergedStyles} />,
    textarea: <Textarea id={id} key={id} styles={mergedStyles} />,
    select: <Select id={id} key={id} styles={mergedStyles} />,
    video: <Video id={id} key={id} styles={mergedStyles} />,
    audio: <Audio id={id} key={id} styles={mergedStyles} />,
    iframe: <Iframe id={id} key={id} styles={mergedStyles} />,
    label: <Label id={id} key={id} styles={mergedStyles} />,
    fieldset: <Fieldset id={id} key={id} styles={mergedStyles} />,
    legend: <Legend id={id} key={id} content={element.content} styles={mergedStyles} />,
    progress: <Progress id={id} key={id} styles={mergedStyles} />,
    meter: <Meter id={id} key={id} styles={mergedStyles} />,
    blockquote: <Blockquote id={id} key={id} content={element.content} styles={mergedStyles} />,
    code: <Code id={id} key={id} content={element.content} styles={mergedStyles} />,
    pre: <Pre id={id} key={id} content={element.content} styles={mergedStyles} />,
    hr: <Hr id={id} key={id} styles={mergedStyles} />,
    caption: <Caption id={id} key={id} content={element.content} styles={mergedStyles} />,
    defiSection: (
      <DraggableDeFi
        id={id}
        key={id}
        type={'defiSection'}
        configuration={configuration}
        children={children ? renderChildren(children) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        styles={mergedStyles}
        settings={element.settings}
      />
    ),
    mintingSection: (
      <DraggableMinting
        id={id}
        key={id}
        type={'mintingSection'}
        configuration={configuration}
        children={children ? renderChildren(children) : null}
        contentListWidth={contentListWidth}
        handlePanelToggle={handlePanelToggle}
        handleOpenMediaPanel={handleOpenMediaPanel}
        styles={mergedStyles}
        settings={element.settings}
      />
    ),
    defiModule: (
      <DeFiModule
        id={id}
        key={id}
        content={element.content}
        styles={mergedStyles}
        configuration={element.configuration || configuration}
        settings={element.settings}
        moduleType={element.moduleType}
        handleSelect={setSelectedElement}
        handleOpenMediaPanel={handleOpenMediaPanel}
        isConnected={false}
        isSigned={false}
        requireSignature={true}
      />
    ),
    container: <Container id={id} key={id} styles={mergedStyles}>{children ? renderChildren(children) : null}</Container>,
    gridLayout: (
      <GridLayout
        id={id}
        key={id}
        styles={mergedStyles}
      >
        {children ? renderChildren(children) : null}
      </GridLayout>
    ),
    line: <Line id={id} key={id} styles={mergedStyles} />,
    linkblock: <LinkBlock id={id} key={id} content={element.content} styles={mergedStyles} />,
    youtubeVideo: <YouTubeVideo id={id} key={id} styles={mergedStyles} />,
    icon: <Icon id={id} key={id} styles={mergedStyles} />,
    dateComponent: <DateComponent id={id} key={id} styles={mergedStyles} />,
    bgVideo: <BGVideo id={id} key={id} styles={mergedStyles} />,
    connectWalletButton: <ConnectWalletButton id={id} key={id} styles={mergedStyles} />
  };

  // Get the appropriate component or fallback
  const Component = componentMap[type] || <div key={id}>Unsupported element type: {type}</div>;

  return <React.Fragment key={id}>{Component}</React.Fragment>;
};
