export const SectionConfiguration = {
  sectionOne: {
    type: 'section',
    children: [
      { type: 'span', content: 'Label' },
      { type: 'heading', content: 'Section One Title' },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.' },
      { type: 'button', content: 'Learn More' },
      { type: 'button', content: 'Learn More' },
      { type: 'image', content: 'https://via.placeholder.com/600x400?text=Section+One+Image' },
    ],
  },
  sectionTwo: {
    type: 'section',
    label: 'Section Two',
    children: [
      { type: 'span', content: 'Label' },
      { type: 'heading', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum amet at molestie mattis.' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
    ],
  },
  sectionThree: {
    type: 'section',
    label: 'Section Three',
    children: [
      { type: 'span', content: 'Section Caption' },
      { type: 'heading', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum amet at molestie mattis.' },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.' },
    ],
  },
  sectionFour: {
    type: 'section',
    children: [
      { type: 'span', content: 'Caption' },
      { type: 'heading', content: 'Lorem ipsum dolor sit amet...' },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'path/to/icon1.svg' },
          { type: 'paragraph', content: 'Egestas ut dui scelerisque...' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'path/to/icon2.svg' },
          { type: 'paragraph', content: 'Id eros pellentes...' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'path/to/icon3.svg' },
          { type: 'paragraph', content: 'Nunc, pellentesque...' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'path/to/icon4.svg' },
          { type: 'paragraph', content: 'Imperdiet purus...' }
        ],
      },
      { type: 'button', content: 'Primary Action' },
    ],
  }

};
