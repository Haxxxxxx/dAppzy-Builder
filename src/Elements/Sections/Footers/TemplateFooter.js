import React, { forwardRef } from 'react';
import BaseFooter from './BaseFooter';
import { TemplateFooterStyles } from './defaultFooterStyles';

const TemplateFooter = forwardRef((props, ref) => (
  <BaseFooter {...props} ref={ref} defaultStyles={TemplateFooterStyles} />
));

TemplateFooter.displayName = 'TemplateFooter';

export default TemplateFooter;
