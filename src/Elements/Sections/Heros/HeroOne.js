import React from 'react';
import Span from '../../Texts/Span';
import Button from '../../Interact/Button';
import Image from '../../Media/Image';
import withSelectable from '../../../utils/withSelectable';
import { defaultHeroStyles } from './defaultHeroStyles';
import { structureConfigurations } from '../../../configs/structureConfigurations';
const SelectableSpan = withSelectable(Span);
const SelectableButton = withSelectable(Button);
const SelectableImage = withSelectable(Image);

const HeroOne = ({ uniqueId, children = [], handleOpenMediaPanel }) => {
  const defaultChildren = structureConfigurations.heroOne.children;

  const mergedChildren = defaultChildren.map((defaultChild) => {
    const overrideChild = children.find((child) => child.type === defaultChild.type);
    return overrideChild || defaultChild;
  });

  const backgroundImage = mergedChildren.find((child) => child.type === 'image');
  const title = mergedChildren.find((child) => child.type === 'span' && child.content === 'Welcome to Our Website');
  const subtitle = mergedChildren.find((child) => child.type === 'span' && child.content === 'Building a better future together.');
  const button = mergedChildren.find((child) => child.type === 'button');

  return (
    <section style={{ ...defaultHeroStyles.hero, backgroundImage: `url(${backgroundImage?.content || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={defaultHeroStyles.heroContent}>
        {title && <SelectableSpan id={title.id || `title-${uniqueId}`} content={title.content} styles={defaultHeroStyles.heroTitle} />}
        {subtitle && <SelectableSpan id={subtitle.id || `subtitle-${uniqueId}`} content={subtitle.content} styles={defaultHeroStyles.heroDescription} />}
        {button && (
          <div style={defaultHeroStyles.buttonContainer}>
            <SelectableButton
              id={button.id || `button-${uniqueId}`}
              content={button.content}
              styles={defaultHeroStyles.primaryButton}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroOne;
