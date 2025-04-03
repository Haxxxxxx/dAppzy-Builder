export const SectionConfiguration = {
  sectionOne: {
    type: 'section',
    children: [
      { type: 'span', content: 'Label' },
      { type: 'heading', content: 'Section One Title' },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.' },
      { type: 'button', content: 'Learn More' },
      { type: 'button', content: 'Learn More' },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
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
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'paragraph', content: 'Egestas ut dui scelerisque...' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'paragraph', content: 'Id eros pellentes...' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'paragraph', content: 'Nunc, pellentesque...' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'paragraph', content: 'Imperdiet purus...' }
        ],
      },
      { type: 'button', content: 'Primary Action' },
    ],
  }

};
