import elementIconPaths from '../../../Mapping/elementIconPaths';

const MediaElements = [
  {
    type: 'image',
    label: 'Image',
    description: 'An image element.',
    icon: elementIconPaths.image,
    tags: ['photo', 'picture', 'img', 'graphic'],
  },
  {
    type: 'video',
    label: 'Video',
    description: 'A video player element.',
    icon: elementIconPaths.video,
    tags: ['mp4', 'player', 'media', 'clip'],
  },
  {
    type: 'youtubeVideo',
    label: 'Youtube Video',
    description: 'A Youtube Video player element.',
    icon: elementIconPaths.youtubeVideo,
    tags: ['youtube', 'video', 'embed', 'stream'],
  },
  {
    type: 'icon',
    label: 'Icon',
    description: 'An icon for your layouts.',
    icon: elementIconPaths.icon,
    tags: ['svg', 'symbol', 'glyph', 'emoji'],
  },
  {
    type: 'audio',
    label: 'Audio',
    description: 'An HTML5 audio player.',
    icon: elementIconPaths.audio,
    tags: ['music', 'sound', 'podcast', 'player'],
  },
  {
    type: 'iframe',
    label: 'Embed',
    description: 'Embed external content (maps, forms, etc.).',
    icon: elementIconPaths.iframe,
    tags: ['embed', 'external', 'widget'],
  },
  {
    type: 'bgVideo',
    label: 'Background Video',
    description: 'A background video that autoplays and loops.',
    icon: elementIconPaths.bgVideo,
    tags: ['background', 'video', 'hero', 'cover'],
  },
  {
    type: 'mapEmbed',
    label: 'Map Embed',
    description: 'Embed a Google Maps location.',
    icon: elementIconPaths.mapEmbed,
    tags: ['map', 'google', 'location', 'address', 'directions'],
  },
  {
    type: 'lightbox',
    label: 'Lightbox Gallery',
    description: 'An image gallery with fullscreen lightbox.',
    icon: elementIconPaths.lightbox,
    tags: ['gallery', 'photos', 'images', 'grid', 'portfolio'],
  },
];

export default MediaElements;
