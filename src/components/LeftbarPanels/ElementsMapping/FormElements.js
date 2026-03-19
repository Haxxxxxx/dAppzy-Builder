import elementIconPaths from '../../../Mapping/elementIconPaths';

const FormElements = [
  {
    type: 'input',
    label: 'Input',
    description: 'A basic input field.',
    icon: elementIconPaths.input,
    tags: ['text', 'field', 'textbox', 'entry'],
  },
  {
    type: 'form',
    label: 'Form',
    description: 'A container for form elements.',
    icon: elementIconPaths.form,
    tags: ['form', 'submit', 'fields', 'contact'],
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'A multi-line text input.',
    icon: elementIconPaths.textarea,
    tags: ['multiline', 'text', 'comment', 'message'],
  },
  {
    type: 'select',
    label: 'Select (Dropdown)',
    description: 'A dropdown menu.',
    icon: elementIconPaths.select,
    tags: ['dropdown', 'menu', 'options', 'choice'],
  },
  {
    type: 'label',
    label: 'Label',
    description: 'A label for form elements.',
    icon: elementIconPaths.label,
    tags: ['text', 'caption', 'field', 'name'],
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'A checkbox with editable label.',
    icon: elementIconPaths.checkbox,
    tags: ['check', 'tick', 'boolean'],
  },
  {
    type: 'radio',
    label: 'Radio',
    description: 'A radio button with editable label.',
    icon: elementIconPaths.radio,
    tags: ['option', 'choice', 'select'],
  },
  {
    type: 'toggle',
    label: 'Toggle',
    description: 'A toggle switch with editable label.',
    icon: elementIconPaths.toggle,
    tags: ['switch', 'on', 'off', 'boolean'],
  },
  {
    type: 'fileUpload',
    label: 'File Upload',
    description: 'A drag-and-drop file upload zone.',
    icon: elementIconPaths.fileUpload,
    tags: ['upload', 'file', 'attachment', 'drop'],
  },
  {
    type: 'datePicker',
    label: 'Date Picker',
    description: 'A date selection input.',
    icon: elementIconPaths.datePicker,
    tags: ['date', 'calendar', 'schedule'],
  },
  {
    type: 'searchBar',
    label: 'Search Bar',
    description: 'A search input with icon and button.',
    icon: elementIconPaths.searchBar,
    tags: ['search', 'find', 'filter', 'query'],
  },
  {
    type: 'slider',
    label: 'Range Slider',
    description: 'A range input slider with label and value display.',
    icon: elementIconPaths.slider,
    tags: ['range', 'volume', 'input', 'control'],
  },
];

export default FormElements;
