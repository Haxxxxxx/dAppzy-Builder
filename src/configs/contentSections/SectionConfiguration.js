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
      { type: 'image', content: 'https://via.placeholder.com/600x400?text=Section+Two+Image' },
      { type: 'heading', content: 'Section Two Title' },
      { type: 'paragraph', content: 'This section highlights our key features in detail.' },
      { type: 'button', content: 'Explore Features' },
    ],
  },
  sectionThree: {
    type: 'section',
    label: 'Section Three',
    children: [
      { type: 'span', content: 'Section Caption' },
      { type: 'heading', content: 'Section Three Title' },
      { type: 'paragraph', content: 'Final section with a call-to-action and contact info.' },
      { type: 'button', content: 'Get in Touch' },
      { type: 'image', content: 'https://via.placeholder.com/1200x600?text=Section+Three+Background' },
    ],
  },
};
