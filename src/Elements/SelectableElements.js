// src/Elements/SelectableElements.js
import React, { forwardRef } from 'react';
import Paragraph from './Typography/Paragraph';
import Heading from './Typography/Heading';
import Section from './Structure/Section';
import Div from './Basic/Div';
import Button from './Basic/Button';
import Image from './Media/Image';
import Form from './Forms/Form';
import Span from './Typography/Span';
import Input from './Forms/Input';
import { List, ListItem } from './Basic/List';
import { Table, TableRow, TableCell } from './Structure/Table';
import DraggableNavbar from './DraggableLayout/DraggableNavbar';
import DraggableFooter from './DraggableLayout/DraggableFooter';
import DraggableHero from './DraggableLayout/DraggableHero';
import DraggableCTA from './DraggableLayout/DraggableCTA';
import DraggableContentSections from './DraggableLayout/DraggableContentSections';
import Anchor from './Basic/Anchor';
import Textarea from './Forms/Textarea';
import Select from './Forms/Select';
import Video from './Media/Video';
import Audio from './Unused(Yet)/Audio';
import Iframe from './Unused(Yet)/Iframe';
import Label from './Forms/Label';
import Fieldset from './Unused(Yet)/FieldSet';
import Legend from './Unused(Yet)/Legend';
import Progress from './Unused(Yet)/Progress';
import Meter from './Unused(Yet)/Meter';
import Blockquote from './Typography/Blockquote';
import Code from './Advanced/Code';
import Pre from './Unused(Yet)/Pre';
import Hr from './Basic/HorizotalRule';
import Caption from './Unused(Yet)/Caption';
import DraggableWeb3Elements from './DraggableLayout/DraggableMinting';
import DateComponent from './Unused(Yet)/DateComponent';
import ConnectWalletButton from './Web3Block/ConnectWalletButton';
import withSelectable from '../utils/withSelectable';
import BGVideo from './Advanced/BGVideo';
import Container from './Structure/Container';
import GridLayout from './Structure/Grid';
import HFlexLayout from './Structure/HFlex';
import VFlexLayout from './Structure/VFlex';
import LinkBlock from './Basic/LinkBlock';
import Line from './Basic/Line';
import YouTubeVideo from './Media/YoutubeVideo';
import Icon from './Media/Icon';
import DraggableDeFi from './DraggableLayout/DraggableDeFi';
import DeFiModule from './Sections/Web3Related/DeFiModule';
import DraggableMinting from './DraggableLayout/DraggableMinting';
import MintingModule from './Sections/Web3Related/MintingModule';

// Memoize leaf components for performance
const MemoParagraph = React.memo(Paragraph);
const MemoHeading = React.memo(Heading);
const MemoImage = React.memo(Image);
const MemoAnchor = React.memo(Anchor);
const MemoSpan = React.memo(Span);
const MemoButton = React.memo(Button);
const MemoDiv = React.memo(Div);

// Wrap basic components with forwardRef
const DivWithRef = forwardRef((props, ref) => <MemoDiv {...props} ref={ref} />);
const ButtonWithRef = forwardRef((props, ref) => <MemoButton {...props} ref={ref} />);
const ImageWithRef = forwardRef((props, ref) => <MemoImage {...props} ref={ref} />);
const FormWithRef = forwardRef((props, ref) => <Form {...props} ref={ref} />);
const SpanWithRef = forwardRef((props, ref) => <MemoSpan {...props} ref={ref} />);
const InputWithRef = forwardRef((props, ref) => <Input {...props} ref={ref} />);
const ListWithRef = forwardRef((props, ref) => <List {...props} ref={ref} />);
const ListItemWithRef = forwardRef((props, ref) => <ListItem {...props} ref={ref} />);
const TableWithRef = forwardRef((props, ref) => <Table {...props} ref={ref} />);
const TableRowWithRef = forwardRef((props, ref) => <TableRow {...props} ref={ref} />);
const TableCellWithRef = forwardRef((props, ref) => <TableCell {...props} ref={ref} />);
const AnchorWithRef = forwardRef((props, ref) => <MemoAnchor {...props} ref={ref} />);
const TextareaWithRef = forwardRef((props, ref) => <Textarea {...props} ref={ref} />);
const SelectWithRef = forwardRef((props, ref) => <Select {...props} ref={ref} />);
const VideoWithRef = forwardRef((props, ref) => <Video {...props} ref={ref} />);
const AudioWithRef = forwardRef((props, ref) => <Audio {...props} ref={ref} />);
const IframeWithRef = forwardRef((props, ref) => <Iframe {...props} ref={ref} />);
const LabelWithRef = forwardRef((props, ref) => <Label {...props} ref={ref} />);
const FieldsetWithRef = forwardRef((props, ref) => <Fieldset {...props} ref={ref} />);
const LegendWithRef = forwardRef((props, ref) => <Legend {...props} ref={ref} />);
const ProgressWithRef = forwardRef((props, ref) => <Progress {...props} ref={ref} />);
const MeterWithRef = forwardRef((props, ref) => <Meter {...props} ref={ref} />);
const BlockquoteWithRef = forwardRef((props, ref) => <Blockquote {...props} ref={ref} />);
const CodeWithRef = forwardRef((props, ref) => <Code {...props} ref={ref} />);
const PreWithRef = forwardRef((props, ref) => <Pre {...props} ref={ref} />);
const HrWithRef = forwardRef((props, ref) => <Hr {...props} ref={ref} />);
const CaptionWithRef = forwardRef((props, ref) => <Caption {...props} ref={ref} />);
const DateComponentWithRef = forwardRef((props, ref) => <DateComponent {...props} ref={ref} />);
const ConnectWalletButtonWithRef = forwardRef((props, ref) => <ConnectWalletButton {...props} ref={ref} />);
const BGVideoWithRef = forwardRef((props, ref) => <BGVideo {...props} ref={ref} />);
const ContainerWithRef = forwardRef((props, ref) => <Container {...props} ref={ref} />);
const GridLayoutWithRef = forwardRef((props, ref) => <GridLayout {...props} ref={ref} />);
const HFlexLayoutWithRef = forwardRef((props, ref) => <HFlexLayout {...props} ref={ref} />);
const VFlexLayoutWithRef = forwardRef((props, ref) => <VFlexLayout {...props} ref={ref} />);
const LineWithRef = forwardRef((props, ref) => <Line {...props} ref={ref} />);
const LinkBlockWithRef = forwardRef((props, ref) => <LinkBlock {...props} ref={ref} />);
const YouTubeVideoWithRef = forwardRef((props, ref) => <YouTubeVideo {...props} ref={ref} />);
const IconWithRef = forwardRef((props, ref) => <Icon {...props} ref={ref} />);

// Special handling for Web3 modules
const DeFiModuleWithRef = forwardRef((props, ref) => {
  const { id, ...rest } = props;
  return (
    <DeFiModule
      {...rest}
      id={id}
      ref={ref}
    />
  );
});

const MintingModuleWithRef = forwardRef((props, ref) => {
  const { id, ...rest } = props;
  return (
    <MintingModule
      {...rest}
      id={id}
      ref={ref}
    />
  );
});

const DraggableDeFiWithRef = forwardRef((props, ref) => {
  const { id, ...rest } = props;
  return (
    <DraggableDeFi {...rest} id={id} ref={ref} />
  );
}); 

const DraggableMintingWithRef = forwardRef((props, ref) => {
  const { id, ...rest } = props;
  return (
    <DraggableMinting {...rest} id={id} ref={ref} />
  );
});
// Set display names for the wrapped components
DivWithRef.displayName = 'DivWithRef';
ButtonWithRef.displayName = 'ButtonWithRef';
ImageWithRef.displayName = 'ImageWithRef';
FormWithRef.displayName = 'FormWithRef';
SpanWithRef.displayName = 'SpanWithRef';
InputWithRef.displayName = 'InputWithRef';
ListWithRef.displayName = 'ListWithRef';
ListItemWithRef.displayName = 'ListItemWithRef';
TableWithRef.displayName = 'TableWithRef';
TableRowWithRef.displayName = 'TableRowWithRef';
TableCellWithRef.displayName = 'TableCellWithRef';
AnchorWithRef.displayName = 'AnchorWithRef';
TextareaWithRef.displayName = 'TextareaWithRef';
SelectWithRef.displayName = 'SelectWithRef';
VideoWithRef.displayName = 'VideoWithRef';
AudioWithRef.displayName = 'AudioWithRef';
IframeWithRef.displayName = 'IframeWithRef';
LabelWithRef.displayName = 'LabelWithRef';
FieldsetWithRef.displayName = 'FieldsetWithRef';
LegendWithRef.displayName = 'LegendWithRef';
ProgressWithRef.displayName = 'ProgressWithRef';
MeterWithRef.displayName = 'MeterWithRef';
BlockquoteWithRef.displayName = 'BlockquoteWithRef';
CodeWithRef.displayName = 'CodeWithRef';
PreWithRef.displayName = 'PreWithRef';
HrWithRef.displayName = 'HrWithRef';
CaptionWithRef.displayName = 'CaptionWithRef';
DateComponentWithRef.displayName = 'DateComponentWithRef';
ConnectWalletButtonWithRef.displayName = 'ConnectWalletButtonWithRef';
BGVideoWithRef.displayName = 'BGVideoWithRef';
ContainerWithRef.displayName = 'ContainerWithRef';
GridLayoutWithRef.displayName = 'GridLayoutWithRef';
HFlexLayoutWithRef.displayName = 'HFlexLayoutWithRef';
VFlexLayoutWithRef.displayName = 'VFlexLayoutWithRef';
LineWithRef.displayName = 'LineWithRef';
LinkBlockWithRef.displayName = 'LinkBlockWithRef';
YouTubeVideoWithRef.displayName = 'YouTubeVideoWithRef';
IconWithRef.displayName = 'IconWithRef';
DeFiModuleWithRef.displayName = 'DeFiModuleWithRef';
MintingModuleWithRef.displayName = 'MintingModuleWithRef';
DraggableDeFiWithRef.displayName = 'DraggableDeFiWithRef';
DraggableMintingWithRef.displayName = 'DraggableMintingWithRef';
// Create selectable components with the ref-forwarded components
const SelectableParagraph = withSelectable(Paragraph);
const SelectableHeading = withSelectable(Heading);
const SelectableSection = withSelectable(Section);
const SelectableDiv = withSelectable(DivWithRef);
const SelectableButton = withSelectable(ButtonWithRef);
const SelectableImage = withSelectable(ImageWithRef);
const SelectableForm = withSelectable(FormWithRef);
const SelectableSpan = withSelectable(SpanWithRef);
const SelectableInput = withSelectable(InputWithRef);
const SelectableList = withSelectable(ListWithRef);
const SelectableListItem = withSelectable(ListItemWithRef);
const SelectableTable = withSelectable(TableWithRef);
const SelectableTableRow = withSelectable(TableRowWithRef);
const SelectableTableCell = withSelectable(TableCellWithRef);
const SelectableDraggableNavbar = withSelectable(DraggableNavbar);
const SelectableDraggableFooter = withSelectable(DraggableFooter);
const SelectableDraggableHero = withSelectable(DraggableHero);
const SelectableDraggableCTA = withSelectable(DraggableCTA);
const SelectableDraggableContentSections = withSelectable(DraggableContentSections);
const SelectableAnchor = withSelectable(AnchorWithRef);
const SelectableTextarea = withSelectable(TextareaWithRef);
const SelectableSelect = withSelectable(SelectWithRef);
const SelectableVideo = withSelectable(VideoWithRef);
const SelectableAudio = withSelectable(AudioWithRef);
const SelectableIframe = withSelectable(IframeWithRef);
const SelectableLabel = withSelectable(LabelWithRef);
const SelectableFieldset = withSelectable(FieldsetWithRef);
const SelectableLegend = withSelectable(LegendWithRef);
const SelectableProgress = withSelectable(ProgressWithRef);
const SelectableMeter = withSelectable(MeterWithRef);
const SelectableBlockquote = withSelectable(BlockquoteWithRef);
const SelectableCode = withSelectable(CodeWithRef);
const SelectablePre = withSelectable(PreWithRef);
const SelectableHr = withSelectable(HrWithRef);
const SelectableCaption = withSelectable(CaptionWithRef);
const SelectableDraggableWeb3Elements = withSelectable(DraggableWeb3Elements);
const SelectableDateComponent = withSelectable(DateComponentWithRef);
const SelectableConnectWalletButton = withSelectable(ConnectWalletButtonWithRef);
const SelectableBGVideo = withSelectable(BGVideoWithRef);
const SelectableContainer = withSelectable(ContainerWithRef);
const SelectableGridLayout = withSelectable(GridLayout);
const SelectableHFlexLayout = withSelectable(HFlexLayoutWithRef);
const SelectableVFlexLayout = withSelectable(VFlexLayoutWithRef);
const SelectableLine = withSelectable(LineWithRef);
const SelectbleLinkBlock = withSelectable(LinkBlockWithRef);
const SelectableYoutubeVideo = withSelectable(YouTubeVideoWithRef);
const SelectableIcon = withSelectable(IconWithRef);
const SelectableDeFiSection = withSelectable(DraggableDeFi);
const SelectableDeFiModule = withSelectable(DeFiModuleWithRef);
const SelectableMintingSection = withSelectable(DraggableMinting);
const SelectableMintingModule = withSelectable(MintingModuleWithRef);
const SelectableDraggableDeFi = withSelectable(DraggableDeFi);
const SelectableDraggableMinting = withSelectable(DraggableMinting);

export {
  SelectableParagraph as Paragraph,
  SelectableHeading as Heading,
  SelectableSection as Section,
  SelectableDiv as Div,
  SelectableButton as Button,
  SelectableImage as Image,
  SelectableForm as Form,
  SelectableSpan as Span,
  SelectableInput as Input,
  SelectableList as List,
  SelectableListItem as ListItem,
  SelectableTable as Table,
  SelectableTableRow as TableRow,
  SelectableTableCell as TableCell,
  SelectableDraggableNavbar as DraggableNavbar,
  SelectableDraggableFooter as DraggableFooter,
  SelectableDraggableHero as DraggableHero,
  SelectableDraggableCTA as DraggableCTA,
  SelectableDraggableContentSections as DraggableContentSections,
  SelectableAnchor as Anchor,
  SelectableTextarea as Textarea,
  SelectableSelect as Select,
  SelectableVideo as Video,
  SelectableAudio as Audio,
  SelectableIframe as Iframe,
  SelectableLabel as Label,
  SelectableFieldset as Fieldset,
  SelectableLegend as Legend,
  SelectableProgress as Progress,
  SelectableMeter as Meter,
  SelectableBlockquote as Blockquote,
  SelectableCode as Code,
  SelectablePre as Pre,
  SelectableHr as Hr,
  SelectableCaption as Caption,
  SelectableDraggableWeb3Elements as DraggableWeb3Elements,
  SelectableDateComponent as DateComponent,
  SelectableConnectWalletButton as ConnectWalletButton,
  SelectableBGVideo as BGVideo,
  SelectableContainer as Container,
  SelectableGridLayout as GridLayout,
  SelectableHFlexLayout as HFlexLayout,
  SelectableVFlexLayout as VFlexLayout,
  SelectableLine as Line,
  SelectbleLinkBlock as LinkBlock,
  SelectableYoutubeVideo as YouTubeVideo,
  SelectableIcon as Icon,
  SelectableDeFiSection as DeFiSection,
  SelectableDraggableDeFi as DraggableDeFi,
  SelectableDeFiModule as DeFiModule, 
  SelectableMintingSection as MintingSection,
  SelectableDraggableMinting as DraggableMinting,
  SelectableMintingModule as MintingModule,
};
