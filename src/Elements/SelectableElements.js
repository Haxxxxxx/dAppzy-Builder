// src/Elements/SelectableElements.js
import Paragraph from './Texts/Paragraph';
import Heading from './Texts/Heading';
import Section from './Structure/Section';
import Div from './Structure/Div';
import Button from './Interact/Button';
import Image from './Media/Image';
import Form from './Interact/Form';
import Span from './Texts/Span';
import Input from './Interact/Input';
import { List, ListItem } from './Texts/List';
import { Table, TableRow, TableCell } from './Interact/Table';
import DraggableNavbar from './Structure/DraggableNavbar';
import DraggableFooter from './Structure/DraggableFooter';
import DraggableHero from './Structure/DraggableHero';
import DraggableCTA from './Structure/DraggableCTA';
import Anchor from './Interact/Anchor';
import Textarea from './Interact/Textarea';
import Select from './Interact/Select';
import Video from './Media/Video';
import Audio from './Media/Audio';
import Iframe from './Media/Iframe';
import Label from './Interact/Label';
import Fieldset from './Interact/FieldSet';
import Legend from './Texts/Legend';
import Progress from './Interact/Progress';
import Meter from './Interact/Meter';
import Blockquote from './Texts/Blockquote';
import Code from './Texts/Code';
import Pre from './Texts/Pre';
import Hr from './Interact/HorizotalRule';
import Caption from './Texts/Caption';
import DraggableWeb3Elements from './Structure/DraggableWeb3Elements';
import DateComponent from './Interact/DateComponent';
import ConnectWalletButton from './Sections/Web3Related/ConnectWalletButton';
import withSelectable from '../utils/withSelectable';
import BGVideo from './Structure/BGVideo';
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
};
