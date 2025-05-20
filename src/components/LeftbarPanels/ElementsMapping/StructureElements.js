import elementIconPaths from '../../../Mapping/elementIconPaths';

const StructureElements = [
  {
    type: 'section',
    label: 'Section',
    description: 'A container element for layout.',
    icon: elementIconPaths.section,
  },
  {
    type: 'container',
    label: 'Container',
    description: 'A generic container element.',
    icon: elementIconPaths.container,
  },
  {
    type: 'gridLayout',
    label: 'Grid',
    description: 'A grid element.',
    icon: elementIconPaths.grid,
  },
  {
    type: 'vflexLayout',
    label: 'VFlex',
    description: 'Create a columns structured vflex',
    icon: elementIconPaths.vflex,  // use whichever "list" icon you like
  },
  {
    type: 'hflexLayout',
    label: 'H Flex',
    description: 'Create a columns structured hflex',
    icon: elementIconPaths.hflex, // or whichever file name you prefer 
  },
  
];

export default StructureElements;
