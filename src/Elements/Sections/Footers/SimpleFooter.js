import React, { forwardRef } from 'react';
import BaseFooter from './BaseFooter';
import { SimplefooterStyles } from './defaultFooterStyles';

const SimpleFooter = forwardRef((props, ref) => (
  <BaseFooter {...props} ref={ref} defaultStyles={SimplefooterStyles} />
));

SimpleFooter.displayName = 'SimpleFooter';

export default SimpleFooter;
