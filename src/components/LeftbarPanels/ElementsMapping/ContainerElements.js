import elementIconPaths from '../../../Mapping/elementIconPaths';
const ContainerElements = [
  {
    type: 'section',
    label: 'Section',
    description: 'A container element for layout.',
    icon: elementIconPaths.section,
  },
  {
    type: 'div',
    label: 'Div',
    description: 'A generic container element.',
    icon: elementIconPaths.div,
  },
  {
    type: 'table',
    label: 'Table',
    description: 'A table element for tabular data.',
    icon: elementIconPaths.table,
  },
  {
    type: 'list',
    label: 'List',
    description: 'Create an ordered or unordered list',
    icon: elementIconPaths.list,  // use whichever “list” icon you like
  },
  {
    type: 'bgVideo',
    label: 'Background Video',
    description: 'A container that has a looping video behind its children.',
    icon: elementIconPaths['bg-bideo'], // or whichever file name you prefer 
  },
];

export default ContainerElements;
