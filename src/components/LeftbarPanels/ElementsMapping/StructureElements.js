import elementIconPaths from '../../../Mapping/elementIconPaths';
const StructureElements = [
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
    icon: elementIconPaths.container,
  },
  {
    type: 'grid',
    label: 'Grid',
    description: 'A grid element.',
    icon: elementIconPaths.grid,
  },
  {
    type: 'VFlex',
    label: 'VFlex',
    description: 'Create a columns structured vflex',
    icon: elementIconPaths.vflex,  // use whichever “list” icon you like
  },
  {
    type: 'hflex',
    label: 'H Flex',
    description: 'Create a columns structured hflex',
    icon: elementIconPaths.hflex, // or whichever file name you prefer 
  },
];

export default StructureElements;
