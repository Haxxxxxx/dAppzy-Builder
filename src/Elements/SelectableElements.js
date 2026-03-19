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
import Label from './Forms/Label';
import Checkbox from './Forms/Checkbox';
import Radio from './Forms/Radio';
import Toggle from './Forms/Toggle';
import Tabs from './Interactive/Tabs';
import Accordion from './Interactive/Accordion';
import Dropdown from './Interactive/Dropdown';
import Modal from './Interactive/Modal';
import Carousel from './Interactive/Carousel';
import Tooltip from './Interactive/Tooltip';
import SearchBar from './Interactive/SearchBar';
import BackToTop from './Interactive/BackToTop';
import FileUpload from './Forms/FileUpload';
import DatePicker from './Forms/DatePicker';
import Breadcrumb from './Navigation/Breadcrumb';
import Blockquote from './Typography/Blockquote';
import Code from './Advanced/Code';
import Hr from './Basic/HorizotalRule';
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
import Audio from './Media/Audio';
import Iframe from './Media/Iframe';
import Progress from './Basic/Progress';
import Badge from './Basic/Badge';
import Spacer from './Basic/Spacer';
import Separator from './Basic/Separator';
import DraggableDeFi from './DraggableLayout/DraggableDeFi';
import DeFiModule from './Sections/Web3Related/DeFiModule';
import DraggableMinting from './DraggableLayout/DraggableMinting';
import MintingModule from './Sections/Web3Related/MintingModule';
import Countdown from './Interactive/Countdown';
import CodeInject from './Advanced/CodeInject';
import MapEmbed from './Media/MapEmbed';
import SocialLinks from './Basic/SocialLinks';
import Slider from './Forms/Slider';
import Rating from './Interactive/Rating';
import Lightbox from './Interactive/Lightbox';
import Marquee from './Interactive/Marquee';
import Alert from './Interactive/Alert';
import Pagination from './Navigation/Pagination';

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
const LabelWithRef = forwardRef((props, ref) => <Label {...props} ref={ref} />);
const CheckboxWithRef = forwardRef((props, ref) => <Checkbox {...props} ref={ref} />);
const RadioWithRef = forwardRef((props, ref) => <Radio {...props} ref={ref} />);
const ToggleWithRef = forwardRef((props, ref) => <Toggle {...props} ref={ref} />);
const BlockquoteWithRef = forwardRef((props, ref) => <Blockquote {...props} ref={ref} />);
const CodeWithRef = forwardRef((props, ref) => <Code {...props} ref={ref} />);
const HrWithRef = forwardRef((props, ref) => <Hr {...props} ref={ref} />);
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
const AudioWithRef = forwardRef((props, ref) => <Audio {...props} ref={ref} />);
const IframeWithRef = forwardRef((props, ref) => <Iframe {...props} ref={ref} />);
const ProgressWithRef = forwardRef((props, ref) => <Progress {...props} ref={ref} />);
const BadgeWithRef = forwardRef((props, ref) => <Badge {...props} ref={ref} />);
const SpacerWithRef = forwardRef((props, ref) => <Spacer {...props} ref={ref} />);
const SeparatorWithRef = forwardRef((props, ref) => <Separator {...props} ref={ref} />);
const TabsWithRef = forwardRef((props, ref) => <Tabs {...props} ref={ref} />);
const AccordionWithRef = forwardRef((props, ref) => <Accordion {...props} ref={ref} />);
const DropdownWithRef = forwardRef((props, ref) => <Dropdown {...props} ref={ref} />);
const ModalWithRef = forwardRef((props, ref) => <Modal {...props} ref={ref} />);
const CarouselWithRef = forwardRef((props, ref) => <Carousel {...props} ref={ref} />);
const TooltipWithRef = forwardRef((props, ref) => <Tooltip {...props} ref={ref} />);
const SearchBarWithRef = forwardRef((props, ref) => <SearchBar {...props} ref={ref} />);
const BackToTopWithRef = forwardRef((props, ref) => <BackToTop {...props} ref={ref} />);
const FileUploadWithRef = forwardRef((props, ref) => <FileUpload {...props} ref={ref} />);
const DatePickerWithRef = forwardRef((props, ref) => <DatePicker {...props} ref={ref} />);
const BreadcrumbWithRef = forwardRef((props, ref) => <Breadcrumb {...props} ref={ref} />);
const CountdownWithRef = forwardRef((props, ref) => <Countdown {...props} ref={ref} />);
const CodeInjectWithRef = forwardRef((props, ref) => <CodeInject {...props} ref={ref} />);
const MapEmbedWithRef = forwardRef((props, ref) => <MapEmbed {...props} ref={ref} />);
const SocialLinksWithRef = forwardRef((props, ref) => <SocialLinks {...props} ref={ref} />);
const SliderWithRef = forwardRef((props, ref) => <Slider {...props} ref={ref} />);
const RatingWithRef = forwardRef((props, ref) => <Rating {...props} ref={ref} />);
const LightboxWithRef = forwardRef((props, ref) => <Lightbox {...props} ref={ref} />);
const MarqueeWithRef = forwardRef((props, ref) => <Marquee {...props} ref={ref} />);
const AlertWithRef = forwardRef((props, ref) => <Alert {...props} ref={ref} />);
const PaginationWithRef = forwardRef((props, ref) => <Pagination {...props} ref={ref} />);

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
LabelWithRef.displayName = 'LabelWithRef';
CheckboxWithRef.displayName = 'CheckboxWithRef';
RadioWithRef.displayName = 'RadioWithRef';
ToggleWithRef.displayName = 'ToggleWithRef';
BlockquoteWithRef.displayName = 'BlockquoteWithRef';
CodeWithRef.displayName = 'CodeWithRef';
HrWithRef.displayName = 'HrWithRef';
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
AudioWithRef.displayName = 'AudioWithRef';
IframeWithRef.displayName = 'IframeWithRef';
ProgressWithRef.displayName = 'ProgressWithRef';
BadgeWithRef.displayName = 'BadgeWithRef';
SpacerWithRef.displayName = 'SpacerWithRef';
SeparatorWithRef.displayName = 'SeparatorWithRef';
TabsWithRef.displayName = 'TabsWithRef';
AccordionWithRef.displayName = 'AccordionWithRef';
DropdownWithRef.displayName = 'DropdownWithRef';
ModalWithRef.displayName = 'ModalWithRef';
CarouselWithRef.displayName = 'CarouselWithRef';
TooltipWithRef.displayName = 'TooltipWithRef';
SearchBarWithRef.displayName = 'SearchBarWithRef';
BackToTopWithRef.displayName = 'BackToTopWithRef';
FileUploadWithRef.displayName = 'FileUploadWithRef';
DatePickerWithRef.displayName = 'DatePickerWithRef';
BreadcrumbWithRef.displayName = 'BreadcrumbWithRef';
DeFiModuleWithRef.displayName = 'DeFiModuleWithRef';
MintingModuleWithRef.displayName = 'MintingModuleWithRef';
CountdownWithRef.displayName = 'CountdownWithRef';
CodeInjectWithRef.displayName = 'CodeInjectWithRef';
MapEmbedWithRef.displayName = 'MapEmbedWithRef';
SocialLinksWithRef.displayName = 'SocialLinksWithRef';
SliderWithRef.displayName = 'SliderWithRef';
RatingWithRef.displayName = 'RatingWithRef';
LightboxWithRef.displayName = 'LightboxWithRef';
MarqueeWithRef.displayName = 'MarqueeWithRef';
AlertWithRef.displayName = 'AlertWithRef';
PaginationWithRef.displayName = 'PaginationWithRef';
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
const SelectableLabel = withSelectable(LabelWithRef);
const SelectableBlockquote = withSelectable(BlockquoteWithRef);
const SelectableCode = withSelectable(CodeWithRef);
const SelectableHr = withSelectable(HrWithRef);
const SelectableConnectWalletButton = withSelectable(ConnectWalletButtonWithRef);
const SelectableBGVideo = withSelectable(BGVideoWithRef);
const SelectableContainer = withSelectable(ContainerWithRef);
const SelectableGridLayout = withSelectable(GridLayout);
const SelectableHFlexLayout = withSelectable(HFlexLayoutWithRef);
const SelectableVFlexLayout = withSelectable(VFlexLayoutWithRef);
const SelectableLine = withSelectable(LineWithRef);
const SelectableLinkBlock = withSelectable(LinkBlockWithRef);
const SelectableYoutubeVideo = withSelectable(YouTubeVideoWithRef);
const SelectableIcon = withSelectable(IconWithRef);
const SelectableAudio = withSelectable(AudioWithRef);
const SelectableIframe = withSelectable(IframeWithRef);
const SelectableProgress = withSelectable(ProgressWithRef);
const SelectableBadge = withSelectable(BadgeWithRef);
const SelectableSpacer = withSelectable(SpacerWithRef);
const SelectableSeparator = withSelectable(SeparatorWithRef);
const SelectableCheckbox = withSelectable(CheckboxWithRef);
const SelectableRadio = withSelectable(RadioWithRef);
const SelectableToggle = withSelectable(ToggleWithRef);
const SelectableDeFiModule = withSelectable(DeFiModuleWithRef);
const SelectableMintingModule = withSelectable(MintingModuleWithRef);
const SelectableDraggableDeFi = withSelectable(DraggableDeFi);
const SelectableDraggableMinting = withSelectable(DraggableMinting);
const SelectableTabs = withSelectable(TabsWithRef);
const SelectableAccordion = withSelectable(AccordionWithRef);
const SelectableDropdown = withSelectable(DropdownWithRef);
const SelectableModal = withSelectable(ModalWithRef);
const SelectableCarousel = withSelectable(CarouselWithRef);
const SelectableTooltip = withSelectable(TooltipWithRef);
const SelectableSearchBar = withSelectable(SearchBarWithRef);
const SelectableBackToTop = withSelectable(BackToTopWithRef);
const SelectableFileUpload = withSelectable(FileUploadWithRef);
const SelectableDatePicker = withSelectable(DatePickerWithRef);
const SelectableBreadcrumb = withSelectable(BreadcrumbWithRef);
const SelectableCountdown = withSelectable(CountdownWithRef);
const SelectableCodeInject = withSelectable(CodeInjectWithRef);
const SelectableMapEmbed = withSelectable(MapEmbedWithRef);
const SelectableSocialLinks = withSelectable(SocialLinksWithRef);
const SelectableSlider = withSelectable(SliderWithRef);
const SelectableRating = withSelectable(RatingWithRef);
const SelectableLightbox = withSelectable(LightboxWithRef);
const SelectableMarquee = withSelectable(MarqueeWithRef);
const SelectableAlert = withSelectable(AlertWithRef);
const SelectablePagination = withSelectable(PaginationWithRef);

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
  SelectableLabel as Label,
  SelectableBlockquote as Blockquote,
  SelectableCode as Code,
  SelectableHr as Hr,
  SelectableConnectWalletButton as ConnectWalletButton,
  SelectableBGVideo as BGVideo,
  SelectableContainer as Container,
  SelectableGridLayout as GridLayout,
  SelectableHFlexLayout as HFlexLayout,
  SelectableVFlexLayout as VFlexLayout,
  SelectableLine as Line,
  SelectableLinkBlock as LinkBlock,
  SelectableYoutubeVideo as YouTubeVideo,
  SelectableIcon as Icon,
  SelectableDraggableDeFi as DraggableDeFi,
  SelectableDeFiModule as DeFiModule,
  SelectableDraggableMinting as DraggableMinting,
  SelectableMintingModule as MintingModule,
  SelectableAudio as Audio,
  SelectableIframe as Iframe,
  SelectableProgress as Progress,
  SelectableBadge as Badge,
  SelectableSpacer as Spacer,
  SelectableSeparator as Separator,
  SelectableCheckbox as Checkbox,
  SelectableRadio as Radio,
  SelectableToggle as Toggle,
  SelectableTabs as Tabs,
  SelectableAccordion as Accordion,
  SelectableDropdown as Dropdown,
  SelectableModal as Modal,
  SelectableCarousel as Carousel,
  SelectableTooltip as Tooltip,
  SelectableSearchBar as SearchBar,
  SelectableBackToTop as BackToTop,
  SelectableFileUpload as FileUpload,
  SelectableDatePicker as DatePicker,
  SelectableBreadcrumb as Breadcrumb,
  SelectableCountdown as Countdown,
  SelectableCodeInject as CodeInject,
  SelectableMapEmbed as MapEmbed,
  SelectableSocialLinks as SocialLinks,
  SelectableSlider as Slider,
  SelectableRating as Rating,
  SelectableLightbox as Lightbox,
  SelectableMarquee as Marquee,
  SelectableAlert as Alert,
  SelectablePagination as Pagination,
};
