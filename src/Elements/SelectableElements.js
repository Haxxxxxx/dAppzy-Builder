// src/Elements/SelectableElements.js
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

const SelectableParagraph = withSelectable(Paragraph);
const SelectableHeading = withSelectable(Heading);
const SelectableSection = withSelectable(Section);
const SelectableDiv = withSelectable(Div);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);
const SelectableForm = withSelectable(Form);
const SelectableSpan = withSelectable(Span);
const SelectableInput = withSelectable(Input);
const SelectableList = withSelectable(List);
const SelectableListItem = withSelectable(ListItem);
const SelectableTable = withSelectable(Table);
const SelectableTableRow = withSelectable(TableRow);
const SelectableTableCell = withSelectable(TableCell);
const SelectableDraggableNavbar = withSelectable(DraggableNavbar);
const SelectableDraggableFooter = withSelectable(DraggableFooter);
const SelectableDraggableHero = withSelectable(DraggableHero);
const SelectableDraggableCTA = withSelectable(DraggableCTA);
const SelectableDraggableContentSections = withSelectable(DraggableContentSections);
const SelectableAnchor = withSelectable(Anchor);
const SelectableTextarea = withSelectable(Textarea);
const SelectableSelect = withSelectable(Select);
const SelectableVideo = withSelectable(Video);
const SelectableAudio = withSelectable(Audio);
const SelectableIframe = withSelectable(Iframe);
const SelectableLabel = withSelectable(Label);
const SelectableFieldset = withSelectable(Fieldset);
const SelectableLegend = withSelectable(Legend);
const SelectableProgress = withSelectable(Progress);
const SelectableMeter = withSelectable(Meter);
const SelectableBlockquote = withSelectable(Blockquote);
const SelectableCode = withSelectable(Code);
const SelectablePre = withSelectable(Pre);
const SelectableHr = withSelectable(Hr);
const SelectableCaption = withSelectable(Caption);
const SelectableDraggableWeb3Elements = withSelectable(DraggableWeb3Elements);
const SelectableDateComponent = withSelectable(DateComponent);
const SelectableConnectWalletButton = withSelectable(ConnectWalletButton);
const SelectableBGVideo = withSelectable(BGVideo);
const SelectableContainer = withSelectable(Container);
const SelectableGridLayout = withSelectable(GridLayout);
const SelectableHFlexLayout = withSelectable(HFlexLayout);
const SelectableVFlexLayout = withSelectable(VFlexLayout);
const SelectableLine = withSelectable(Line);
const SelectbleLinkBlock = withSelectable(LinkBlock);
const SelectableYoutubeVideo = withSelectable(YouTubeVideo);
const SelectableIcon = withSelectable(Icon);
const SelectableDeFiSection = withSelectable(DraggableDeFi);
const SelectableDeFiModule = withSelectable(DeFiModule);

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


  SelectableDeFiSection as DraggableDeFi,
  SelectableDeFiModule as DeFiModule,
};
