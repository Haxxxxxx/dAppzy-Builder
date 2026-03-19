import elementIconPaths from '../../../Mapping/elementIconPaths';

const TypographyElements = [
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'A block of text.',
    icon: elementIconPaths.paragraph,
    tags: ['text', 'body', 'copy', 'content'],
  },
  {
    type: 'heading',
    label: 'Heading',
    description: 'A title or header element.',
    icon: elementIconPaths.heading,
    tags: ['title', 'h1', 'h2', 'header', 'h3'],
  },
  {
    type: 'span',
    label: 'Span',
    description: 'An inline text element.',
    icon: elementIconPaths.span,
    tags: ['inline', 'text', 'highlight', 'fragment'],
  },
  {
    type: 'blockquote',
    label: 'Blockquote',
    description: 'A quoted block of text.',
    icon: elementIconPaths.blockquote,
    tags: ['quote', 'citation', 'testimonial', 'pullquote'],
  },
  {
    type: 'code',
    label: 'Code',
    description: 'A code snippet.',
    icon: elementIconPaths.code,
    tags: ['snippet', 'preformatted', 'monospace', 'syntax'],
  },
];

export default TypographyElements;
