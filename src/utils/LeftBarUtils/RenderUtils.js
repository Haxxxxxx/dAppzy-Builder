import React from 'react';
import { LAYOUT_TYPES } from '../../constants/elementTypes';
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
  ListItem,
  Anchor,
  Textarea,
  Select,
  Video,
  Label,
  Blockquote,
  Code,
  Hr,
  Table,
  TableRow,
  TableCell,
  DraggableNavbar,
  DraggableFooter,
  DraggableHero,
  DraggableCTA,
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
  DraggableMinting,
  MintingModule as SelectableMintingModule,
  Audio,
  Iframe,
  Progress,
  Badge,
  Spacer,
  Separator,
  Checkbox,
  Radio,
  Toggle,
  Tabs,
  Accordion,
  Dropdown,
  Modal,
  Carousel,
  Tooltip,
  SearchBar,
  BackToTop,
  FileUpload,
  DatePicker,
  Breadcrumb,
  Countdown,
  CodeInject,
  MapEmbed,
  SocialLinks,
  Slider,
  Rating,
  Lightbox,
  Marquee,
  Alert,
  Pagination,
} from '../../Elements/SelectableElements';

import { structureConfigurations } from '../../configs/structureConfigurations';
import { elementTypes } from '../../core/configs/elementConfigs';

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
  forwardedRef = null,
  activeBreakpoint = 'desktop'
) => {
  if (!element || !element.id || !element.type) {
    return null;
  }

  const { id, type, children, configuration } = element;

  // Get base configuration and structure configuration
  const baseConfig = elementTypes[type];
  const structureConfig = configuration ? structureConfigurations[configuration] : null;

  // Merge styles from base config, structure config, element, and active breakpoint overrides
  const mergedStyles = {
    ...(baseConfig?.defaultStyles || {}),
    ...(structureConfig?.styles || {}),
    ...(element.styles || {}),
    ...(activeBreakpoint !== 'desktop' ? (element.breakpointStyles?.[activeBreakpoint] || {}) : {})
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
          handleOpenMediaPanel,
          null,
          activeBreakpoint
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
        handleOpenMediaPanel,
        null,
        activeBreakpoint
      ));
  };

  if (LAYOUT_TYPES.includes(type) && !configuration) {
    return (
      <div
        key={id}
        style={{
          padding: '24px',
          margin: '8px 0',
          border: '2px dashed var(--border-color, #444)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--not-selected, #838389)',
          fontSize: '14px',
          background: 'var(--surface-light, #f5f5f5)',
        }}
      >
        <span style={{ display: 'block', fontSize: '20px', marginBottom: '4px' }}>⚠</span>
        {type} section is missing its configuration
      </div>
    );
  }

  // Render the correct component directly instead of allocating a 60+ entry
  // object literal on every call. The previous componentMap created JSX for ALL
  // element types even though only ONE was used per call — wasted across every
  // element in the tree (including recursive children).
  const childrenNodes = children ? renderChildren(children) : null;
  const content = element.content;

  let Component;
  switch (type) {
    case 'paragraph': Component = <Paragraph id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'heading': Component = <Heading id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'section': Component = <Section id={id} key={id} styles={mergedStyles} settings={element.settings}>{childrenNodes}</Section>; break;
    case 'div': Component = <Div id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>{childrenNodes}</Div>; break;
    case 'button': Component = <Button id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'span': Component = <Span id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'image': Component = <Image id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel} content={content} />; break;
    case 'input': Component = <Input id={id} key={id} styles={mergedStyles} />; break;
    case 'form': Component = <Form id={id} key={id} styles={mergedStyles} />; break;
    case 'list': Component = <List id={id} key={id} type="ul" styles={mergedStyles} configuration={configuration} />; break;
    case 'listItem':
    case 'list-item': Component = <ListItem id={id} key={id} styles={mergedStyles} />; break;
    case 'hflex': Component = <HFlexLayout id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>{childrenNodes}</HFlexLayout>; break;
    case 'vflex': Component = <VFlexLayout id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>{childrenNodes}</VFlexLayout>; break;
    case 'navbar': Component = <DraggableNavbar id={id} key={id} configuration={configuration} contentListWidth={contentListWidth} handlePanelToggle={handlePanelToggle} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'hero': Component = <DraggableHero id={id} key={id} configuration={configuration} contentListWidth={contentListWidth} handlePanelToggle={handlePanelToggle} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'footer': Component = <DraggableFooter id={id} key={id} configuration={configuration} contentListWidth={contentListWidth} handlePanelToggle={handlePanelToggle} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'cta': Component = <DraggableCTA id={id} key={id} configuration={configuration} contentListWidth={contentListWidth} handlePanelToggle={handlePanelToggle} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'ContentSection': Component = <DraggableContentSections id={id} key={id} configuration={configuration} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'table': Component = <Table id={id} key={id} styles={mergedStyles} />; break;
    case 'tableRow': Component = <TableRow id={id} key={id} styles={mergedStyles} />; break;
    case 'tableCell': Component = <TableCell id={id} key={id} styles={mergedStyles} />; break;
    case 'anchor': Component = <Anchor id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'textarea': Component = <Textarea id={id} key={id} styles={mergedStyles} />; break;
    case 'select': Component = <Select id={id} key={id} styles={mergedStyles} />; break;
    case 'video': Component = <Video id={id} key={id} styles={mergedStyles} />; break;
    case 'label': Component = <Label id={id} key={id} styles={mergedStyles} />; break;
    case 'checkbox': Component = <Checkbox id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'radio': Component = <Radio id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'toggle': Component = <Toggle id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'blockquote': Component = <Blockquote id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'code': Component = <Code id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'hr': Component = <Hr id={id} key={id} styles={mergedStyles} />; break;
    case 'defiSection': Component = <DraggableDeFi id={id} key={id} contentListWidth={contentListWidth} handlePanelToggle={handlePanelToggle} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'mintingSection': Component = <DraggableMinting id={id} key={id} handleOpenMediaPanel={handleOpenMediaPanel} />; break;
    case 'defiModule': Component = <DeFiModule id={id} key={id} content={content} styles={mergedStyles} moduleType={element.moduleType} />; break;
    case 'mintingModule': Component = <SelectableMintingModule id={id} key={id} content={content} styles={mergedStyles} moduleType={element.moduleType} />; break;
    case 'container': Component = <Container id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>{childrenNodes}</Container>; break;
    case 'gridLayout': Component = <GridLayout id={id} key={id} styles={mergedStyles}>{childrenNodes}</GridLayout>; break;
    case 'line': Component = <Line id={id} key={id} styles={mergedStyles} />; break;
    case 'linkblock': // fallthrough
    case 'linkBlock': Component = <LinkBlock id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'youtubeVideo': Component = <YouTubeVideo id={id} key={id} styles={mergedStyles} />; break;
    case 'icon': Component = <Icon id={id} key={id} styles={mergedStyles} />; break;
    case 'bgVideo': Component = <BGVideo id={id} key={id} styles={mergedStyles} />; break;
    case 'connectWalletButton': Component = <ConnectWalletButton id={id} key={id} styles={mergedStyles} />; break;
    case 'audio': Component = <Audio id={id} key={id} styles={mergedStyles} />; break;
    case 'iframe': Component = <Iframe id={id} key={id} styles={mergedStyles} />; break;
    case 'progress': Component = <Progress id={id} key={id} styles={mergedStyles} />; break;
    case 'badge': Component = <Badge id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'spacer': Component = <Spacer id={id} key={id} styles={mergedStyles} />; break;
    case 'separator': Component = <Separator id={id} key={id} styles={mergedStyles} />; break;
    case 'hflexLayout': Component = <HFlexLayout id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>{childrenNodes}</HFlexLayout>; break;
    case 'vflexLayout': Component = <VFlexLayout id={id} key={id} styles={mergedStyles} handleOpenMediaPanel={handleOpenMediaPanel}>{childrenNodes}</VFlexLayout>; break;
    case 'tabs': Component = <Tabs id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'accordion': Component = <Accordion id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'dropdown': Component = <Dropdown id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'modal': Component = <Modal id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'carousel': Component = <Carousel id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'tooltip': Component = <Tooltip id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'searchBar': Component = <SearchBar id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'backToTop': Component = <BackToTop id={id} key={id} styles={mergedStyles} />; break;
    case 'fileUpload': Component = <FileUpload id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'datePicker': Component = <DatePicker id={id} key={id} styles={mergedStyles} />; break;
    case 'breadcrumb': Component = <Breadcrumb id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'countdown': Component = <Countdown id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'codeInject': Component = <CodeInject id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'mapEmbed': Component = <MapEmbed id={id} key={id} styles={mergedStyles} />; break;
    case 'socialLinks': Component = <SocialLinks id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'slider': Component = <Slider id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'rating': Component = <Rating id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'lightbox': Component = <Lightbox id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'marquee': Component = <Marquee id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'alert': Component = <Alert id={id} key={id} content={content} styles={mergedStyles} />; break;
    case 'pagination': Component = <Pagination id={id} key={id} content={content} styles={mergedStyles} />; break;
    default: Component = <div key={id}>Unsupported element type: {type}</div>;
  }

  return <React.Fragment key={id}>{Component}</React.Fragment>;
};
