import elementIconPaths from '../../../Mapping/elementIconPaths';
const BasicElements = [
  {
    type: 'div',
    label: 'Div',
    description: 'A generic container element.',
    icon: elementIconPaths.div,
  },
  {
    type: 'list',
    label: 'List',
    description: 'A list element',
    icon: elementIconPaths.list,
  },
  {
    type: 'linkblock',
    label: 'LinkBlock',
    description: 'Create a LinkBlock',
    icon: elementIconPaths.linkblock,  // use whichever “list” icon you like
  },
  {
    type: 'button',
    label: 'Button',
    description: 'Create a button',
    icon: elementIconPaths.button, // or whichever file name you prefer 
  },  
  {
    type: 'line',
    label: 'Line',
    description: 'Create a line',
    icon: elementIconPaths.line, // or whichever file name you prefer 
  },
];

export default BasicElements;
