import elementIconPaths from '../../../Mapping/elementIconPaths';

const FormElements = [
  {
    type: 'input',
    label: 'Input',
    description: 'A basic input field.',
    icon: elementIconPaths.input,
  },
  {
    type: 'form',
    label: 'Form',
    description: 'A container for form elements.',
    icon: elementIconPaths.form,
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'A multi-line text input.',
    icon: elementIconPaths.textarea,
  },
  {
    type: 'select',
    label: 'Select (Dropdown)',
    description: 'A dropdown menu.',
    icon: elementIconPaths.select,
  },
  {
    type: 'label',
    label: 'Label',
    description: 'A label for form elements.',
    icon: elementIconPaths.label,
  },
];

export default FormElements;
