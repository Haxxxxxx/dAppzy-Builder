import elementIconPaths from '../../../Mapping/elementIconPaths';

const StructureElements = [
  {
    type: 'section',
    label: 'Section',
    description: 'A container element for layout.',
    icon: elementIconPaths.section,
    tags: ['wrapper', 'group', 'block', 'area'],
  },
  {
    type: 'container',
    label: 'Container',
    description: 'A generic container element.',
    icon: elementIconPaths.container,
    tags: ['wrapper', 'box', 'div', 'layout'],
  },
  {
    type: 'gridLayout',
    label: 'Grid',
    description: 'A grid element.',
    icon: elementIconPaths.gridLayout,
    tags: ['columns', 'rows', 'layout', 'css grid'],
  },
  {
    type: 'vflexLayout',
    label: 'VFlex',
    description: 'Create a columns structured vflex',
    icon: elementIconPaths.vflexLayout,
    tags: ['vertical', 'stack', 'column', 'flexbox'],
  },
  {
    type: 'hflexLayout',
    label: 'H Flex',
    description: 'Create a columns structured hflex',
    icon: elementIconPaths.hflexLayout,
    tags: ['horizontal', 'row', 'inline', 'flexbox'],
  },
];

export default StructureElements;
